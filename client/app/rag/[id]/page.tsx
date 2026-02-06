'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, Clock, ExternalLink, FileText, HardDrive, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UploadDialog } from '@/components/ui/upload-dialog';
import { useKnowledgeBases } from '../layout';
import { axiosInstance } from '@/lib/axios';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { RadialOrbitalTimeline, type TimelineItem } from '@/components/ui/radial-orbital-timeline';
import type { UploadedItem } from '@/components/hooks/use-multi-file-upload';

type KnowledgeBaseDetail = {
  id: number;
  name: string;
  description?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  userId?: number | null;
  ownerName?: string | null;
  ownerLevelName?: string | null;
};

type KnowledgeBaseDocument = {
  id: number;
  knowledgeBaseId: number;
  fileName?: string | null;
  fileUrl?: string | null;
  fileSize?: number | null;
  processingStatus?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type NodeSummary = {
  id: string;
  documentId: number;
  context?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type KnowledgeBaseDetailPageProps = {
  params: { id: string };
};

const formatDate = (value?: string | null) => {
  if (!value) return '暂无';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '暂无';
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatFileSize = (size?: number | null) => {
  if (!size || size <= 0) return '未知大小';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let index = 0;
  let computed = size;
  while (computed >= 1024 && index < units.length - 1) {
    computed /= 1024;
    index += 1;
  }
  return `${computed.toFixed(computed >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
};

const formatStatus = (status?: string | null) => {
  if (!status) return '状态未知';
  const normalized = status.trim().toUpperCase();
  switch (normalized) {
    case 'COMPLETED':
    case 'SUCCESS':
      return '处理完成';
    case 'PROCESSING':
    case 'PENDING':
      return '处理中';
    case 'FAILED':
    case 'ERROR':
      return '处理失败';
    default:
      return status;
  }
};

const truncateText = (value: string | null | undefined, maxLength = 50) => {
  if (!value) return '';
  return value.length > maxLength ? `${value.slice(0, maxLength)}…` : value;
};

export default function KnowledgeBaseDetailPage({ params }: KnowledgeBaseDetailPageProps) {
  const knowledgeBaseId = Number(params.id);
  const { knowledgeBases } = useKnowledgeBases();
  const fallbackKnowledgeBase = useMemo(
    () => knowledgeBases.find((kb) => kb.id === knowledgeBaseId),
    [knowledgeBases, knowledgeBaseId]
  );
  const canManageDocuments = useMemo(
    () => knowledgeBases.some((kb) => kb.id === knowledgeBaseId),
    [knowledgeBases, knowledgeBaseId]
  );

  const [detail, setDetail] = useState<KnowledgeBaseDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [documents, setDocuments] = useState<KnowledgeBaseDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [documentRefreshKey, setDocumentRefreshKey] = useState(0);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollStartTimeRef = useRef<number | null>(null);
  const POLL_INTERVAL_MS = 4000;
  const POLL_MAX_DURATION_MS = 60000;
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<KnowledgeBaseDocument | null>(null);
  const [documentNodes, setDocumentNodes] = useState<Record<number, NodeSummary[]>>({});
  const [nodesLoading, setNodesLoading] = useState(false);
  const [nodesError, setNodesError] = useState<string | null>(null);

  const handleConfirmDeleteDocument = useCallback(async (document: KnowledgeBaseDocument) => {
    if (!canManageDocuments || !document?.id) return;

    try {
      await axiosInstance.delete(`/documents/${document.id}`, {
        params: { knowledgeBaseId },
      });
      setDocuments((prev) => prev.filter((item) => item.id !== document.id));
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.message ?? '删除文档失败，请稍后重试';
      setDocumentsError(message);
    } finally {
      setDocumentRefreshKey((key) => key + 1);
    }
  }, [canManageDocuments, knowledgeBaseId]);

  const handleOpenDetailDialog = useCallback((document: KnowledgeBaseDocument) => {
    setSelectedDocument(document);
    setDetailDialogOpen(true);
  }, []);

  const handleCloseDetailDialog = useCallback(() => {
    setDetailDialogOpen(false);
    setSelectedDocument(null);
    setNodesError(null);
  }, []);

  const detailTimelineData = useMemo<TimelineItem[]>(() => {
    if (!selectedDocument) return [];
    const nodes = documentNodes[selectedDocument.id] ?? [];
    if (!nodes.length) {
      return [
        {
          id: 1,
          title: selectedDocument.fileName?.trim() || '未命名文件',
          date: formatDate(selectedDocument.createdAt),
          content: '尚未获取节点信息，请稍后重试。',
          category: 'Document',
          icon: FileText,
          relatedIds: [],
          status: 'pending',
        },
      ];
    }

    const count = nodes.length;
    const timeline = nodes.map<TimelineItem>((node, index) => {
      const status: 'completed' | 'in-progress' | 'pending' = 'completed';
      const createdAtLabel = node.createdAt ? formatDate(node.createdAt) : formatDate(selectedDocument.updatedAt ?? selectedDocument.createdAt);
      const nextIndex = (index + 1) % count;
      const prevIndex = (index - 1 + count) % count;
      return {
        id: index + 1,
        title: `节点 #${String(node.id).slice(0, 3)}`,
        date: createdAtLabel,
        content: truncateText(node.context?.trim() || '暂无内容'),
        category: 'Node',
        icon: FileText,
        relatedIds: count > 1 ? [prevIndex + 1, nextIndex + 1] : [],
        status,
      };
    });

    return timeline;
  }, [documentNodes, selectedDocument]);

  useEffect(() => {
    const hasProcessing = documents.some((item) => item.processingStatus?.toUpperCase() === 'PROCESSING');

    if (hasProcessing) {
      if (!pollStartTimeRef.current) {
        pollStartTimeRef.current = Date.now();
      }
      const start = pollStartTimeRef.current;
      const elapsed = start ? Date.now() - start : 0;
      if (elapsed < POLL_MAX_DURATION_MS && !pollTimeoutRef.current) {
        pollTimeoutRef.current = setTimeout(() => {
          pollTimeoutRef.current = null;
          setDocumentRefreshKey((key) => key + 1);
        }, POLL_INTERVAL_MS);
      }
    } else {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
      pollStartTimeRef.current = null;
    }
  }, [documents]);

  useEffect(() => () => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!detailDialogOpen || !selectedDocument) {
      return;
    }

    const docId = selectedDocument.id;
    if (documentNodes[docId]) {
      return;
    }

    let cancelled = false;
    const fetchNodes = async () => {
      setNodesLoading(true);
      setNodesError(null);
      try {
        const res = await axiosInstance.get('/nodes', {
          params: { documentId: docId },
        });
        const data = res?.data;
        if (!cancelled) {
          if (data?.code === 200 && Array.isArray(data?.data)) {
            setDocumentNodes((prev) => ({ ...prev, [docId]: data.data as NodeSummary[] }));
          } else {
            setNodesError(data?.message ?? '获取节点信息失败');
          }
        }
      } catch (error: any) {
        if (!cancelled) {
          const message = error?.response?.data?.message ?? error?.message ?? '获取节点信息失败';
          setNodesError(message);
        }
      } finally {
        if (!cancelled) {
          setNodesLoading(false);
        }
      }
    };

    fetchNodes();

    return () => {
      cancelled = true;
    };
  }, [detailDialogOpen, selectedDocument, documentNodes]);

  useEffect(() => {
    if (!Number.isFinite(knowledgeBaseId)) {
      setError('无效的知识库 ID');
      return;
    }

    let cancelled = false;

    const fetchDetail = async () => {
      try {
        const res = await axiosInstance.get(`/knowledge-base/${knowledgeBaseId}`);
        const data = res?.data;
        if (!cancelled) {
          if (data?.code === 200 && data?.data) {
            const payload = data.data as KnowledgeBaseDetail;
            setDetail({
              id: payload.id,
              name: payload.name ?? fallbackKnowledgeBase?.name ?? `知识库 #${knowledgeBaseId}`,
              description: payload.description ?? fallbackKnowledgeBase?.description ?? null,
              createdAt: payload.createdAt ?? fallbackKnowledgeBase?.createdAt ?? null,
              updatedAt: payload.updatedAt ?? payload.createdAt ?? fallbackKnowledgeBase?.updatedAt ?? null,
              userId: payload.userId ?? null,
              ownerName: payload.ownerName ?? null,
              ownerLevelName: payload.ownerLevelName ?? null,
            });
            setError(null);
          } else {
            setError(data?.message ?? '获取知识库详情失败');
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          const message = err?.response?.data?.message ?? err?.message ?? '获取知识库详情失败';
          setError(message);
        }
      }
    };

    fetchDetail();

    return () => {
      cancelled = true;
    };
  }, [knowledgeBaseId, fallbackKnowledgeBase]);

  useEffect(() => {
    if (!Number.isFinite(knowledgeBaseId)) {
      return;
    }

    let cancelled = false;

    const fetchDocuments = async () => {
      setDocumentsLoading(true);
      try {
        const res = await axiosInstance.get('/documents', {
          params: { knowledgeBaseId },
        });
        const data = res?.data;
        if (!cancelled) {
          if (data?.code === 200 && Array.isArray(data?.data)) {
            setDocuments(data.data as KnowledgeBaseDocument[]);
            setDocumentsError(null);
          } else {
            setDocuments([]);
            setDocumentsError(data?.message ?? '获取知识库文档失败');
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setDocuments([]);
          const message = err?.response?.data?.message ?? err?.message ?? '获取知识库文档失败';
          setDocumentsError(message);
        }
      } finally {
        if (!cancelled) {
          setDocumentsLoading(false);
        }
      }
    };

    fetchDocuments();

    return () => {
      cancelled = true;
    };
  }, [knowledgeBaseId, documentRefreshKey]);

  useEffect(() => {
    if (!uploadDialogOpen) {
      setUploadMessage(null);
    }
  }, [uploadDialogOpen]);

  useEffect(() => {
    if (!canManageDocuments && uploadDialogOpen) {
      setUploadDialogOpen(false);
    }
  }, [canManageDocuments, uploadDialogOpen]);

  const handleFileSelection = useCallback((files: File[]) => {
    if (files.length) {
      setUploadMessage(null);
    }
  }, []);

  const handleSaveUpload = useCallback(async (items: Array<Pick<UploadedItem, 'id' | 'file'>>) => {
    if (!canManageDocuments || !items.length) return {};
    setUploadingDocument(true);
    setUploadMessage('正在上传，请稍候…');

    const results: Record<string, 'success' | 'error'> = {};
    let latestError: string | null = null;

    try {
      await Promise.all(
        items.map(async ({ id, file }) => {
          try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('knowledgeBaseId', String(knowledgeBaseId));
            await axiosInstance.post('/documents', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
            results[id] = 'success';
          } catch (error: any) {
            results[id] = 'error';
            const message = error?.response?.data?.message ?? error?.message ?? '上传失败，请稍后重试';
            latestError = message;
          }
        })
      );

      const hasSuccess = Object.values(results).includes('success');
      const hasFailure = Object.values(results).includes('error');

      if (hasSuccess) {
        setDocumentRefreshKey((key) => key + 1);
      }

      if (hasFailure && hasSuccess) {
        setUploadMessage(latestError ? `部分文件上传失败：${latestError}` : '部分文件上传失败，请查看标记');
      } else if (hasFailure) {
        setUploadMessage(latestError ?? '上传失败，请稍后重试');
      } else {
        setUploadMessage('上传完成，可关闭弹窗');
      }
    } catch (error: any) {
      items.forEach(({ id }) => {
        if (!results[id]) {
          results[id] = 'error';
        }
      });
      const message = error?.response?.data?.message ?? error?.message ?? '上传时发生异常，请稍后重试';
      latestError = latestError ?? message;
      setUploadMessage(message);
    } finally {
      setUploadingDocument(false);
    }

    return results;
  }, [canManageDocuments, knowledgeBaseId]);

  const displayKnowledgeBase = detail ?? fallbackKnowledgeBase;
  const showDocumentLoading = documentsLoading && documents.length === 0;

  if (!Number.isFinite(knowledgeBaseId)) {
    return (
      <div className='flex min-h-svh w-full items-center justify-center text-sm text-neutral-500 dark:text-neutral-400'>
        提供的知识库 ID 无效。
      </div>
    );
  }

  return (
    <div className='space-y-10 px-4 py-10 md:pl-[300px] md:pr-12 min-h-svh bg-white dark:bg-white'>
      <header className='space-y-3 text-center md:text-left'>
        <p className='text-sm uppercase tracking-wide text-neutral-500 dark:text-neutral-500'>
          Knowledge Base Detail
        </p>
        <h1 className='text-3xl font-semibold text-neutral-900 dark:text-neutral-900 md:text-4xl'>
          {displayKnowledgeBase?.name ?? `知识库 #${knowledgeBaseId}`}
        </h1>
        <p className='text-sm text-neutral-600 dark:text-neutral-600'>
          {displayKnowledgeBase?.description?.trim() ||
            '尚未为这个知识库添加描述，试着补充一些背景信息，让协作成员更快理解上下文。'}
        </p>
        {canManageDocuments ? (
          <div className='flex flex-wrap items-center justify-start gap-3'>
            <Button
              size='sm'
              onClick={() => {
                setUploadMessage(null);
                setUploadingDocument(false);
                setUploadDialogOpen(true);
              }}
            >
              上传文档
            </Button>
          </div>
        ) : null}
        {error ? <p className='text-sm text-red-500'>{error}</p> : null}
      </header>

      {documentsError ? <p className='text-sm text-red-500'>{documentsError}</p> : null}

      {showDocumentLoading ? (
        <div className='flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-8 text-sm text-neutral-500 dark:border-neutral-200 dark:bg-white dark:text-neutral-500'>
          正在加载文档...
        </div>
      ) : documents.length ? (
        <div className='flex flex-wrap justify-center gap-6 md:justify-start md:gap-8'>
          {documents.map((document) => (
            <div key={document.id} className='w-full max-w-[280px]'>
              <SpotlightCard className='flex h-full min-h-[200px] flex-col justify-between gap-3 p-5'>
                <div className='space-y-4'>
                  <div className='flex items-center gap-2 text-xs font-medium uppercase tracking-wide' style={{ color: 'var(--icon-color)' }}>
                    <FileText className='h-4 w-4' style={{ color: 'var(--icon-color)' }} />
                    <span>Document</span>
                  </div>
                  <div className='space-y-2'>
                    <h2 className='break-words text-xl font-semibold leading-relaxed' style={{ color: 'var(--heading-text)' }}>
                      {document.fileName?.trim() || '未命名文件'}
                    </h2>
                    <p className='text-xs uppercase' style={{ color: 'var(--paragraph-text)' }}>
                      {formatStatus(document.processingStatus)}
                    </p>
                  </div>
                </div>
                <div className='space-y-4 text-sm' style={{ color: 'var(--paragraph-text)' }}>
                  <div className='flex items-center gap-3'>
                    <HardDrive className='h-5 w-5' style={{ color: 'var(--icon-color)' }} />
                    <div>
                      <p className='text-xs uppercase opacity-70'>文件大小</p>
                      <p className='text-sm' style={{ color: 'var(--heading-text)' }}>{formatFileSize(document.fileSize ?? null)}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <CalendarDays className='h-5 w-5' style={{ color: 'var(--icon-color)' }} />
                    <div>
                      <p className='text-xs uppercase opacity-70'>创建时间</p>
                      <p className='text-sm' style={{ color: 'var(--heading-text)' }}>{formatDate(document.createdAt)}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <Clock className='h-5 w-5' style={{ color: 'var(--icon-color)' }} />
                    <div>
                      <p className='text-xs uppercase opacity-70'>最近更新</p>
                      <p className='text-sm' style={{ color: 'var(--heading-text)' }}>{formatDate(document.updatedAt ?? document.createdAt)}</p>
                    </div>
                  </div>
                </div>
                <div className='flex w-full items-center justify-between gap-3'>
                  <Button
                    size='sm'
                    variant='secondary'
                    className='flex items-center gap-1'
                    onClick={() => handleOpenDetailDialog(document)}
                  >
                    查看详情
                    <ExternalLink className='h-3.5 w-3.5' />
                  </Button>
                  {canManageDocuments ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size='icon'
                          variant='ghost'
                          className='h-9 w-9 rounded-full border bg-transparent hover:bg-white/10'
                          style={{ borderColor: 'var(--card-border)', color: 'var(--icon-color)' }}
                          onClick={(event) => {
                            event.stopPropagation();
                          }}
                        >
                          <Trash2 className='h-5 w-5' style={{ color: 'inherit' }} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认删除文档？</AlertDialogTitle>
                          <AlertDialogDescription>
                            删除后将无法恢复，确认要移除 "{document.fileName?.trim() || '未命名文件'}" 吗？
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction
                            className='bg-red-600 hover:bg-red-700'
                            onClick={() => handleConfirmDeleteDocument(document)}
                          >
                            删除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : null}
                </div>
              </SpotlightCard>
            </div>
          ))}
        </div>
      ) : (
        <div className='flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-12 text-center text-sm text-neutral-500 dark:border-neutral-200 dark:bg-white dark:text-neutral-500'>
          <p>
            {canManageDocuments
              ? '这个知识库还没有文档，点击上方的“上传文档”按钮添加内容吧。'
              : '这个知识库还没有文档。'}
          </p>
        </div>
      )}

      <UploadDialog
        open={canManageDocuments && uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        uploading={uploadingDocument}
        statusMessage={uploadMessage}
        accept=".pdf,.doc,.docx,image/*"
        onFileChange={handleFileSelection}
        onSubmit={handleSaveUpload}
        title="上传知识库文档"
        description="选择需要上传的文件，我们将同步到此知识库。"
      />

      {/* 删除文档的 AlertDialog 已嵌入每个卡片内部 */}

      <Dialog open={detailDialogOpen} onOpenChange={(open) => (open ? setDetailDialogOpen(true) : handleCloseDetailDialog())}>
        <DialogContent className='w-[40vw] min-w-[360px] max-w-none border-none p-0 shadow-2xl'>
          {selectedDocument ? (
            <div className='flex flex-col gap-6 overflow-hidden rounded-2xl bg-white pb-10 pt-6 dark:bg-white'>
              <DialogHeader className='px-6'>
                <DialogTitle className='text-xl font-semibold text-neutral-900'>
                  {selectedDocument.fileName?.trim() || '未命名文件'}
                </DialogTitle>
                <DialogDescription className='text-sm text-neutral-600'>
                  文档状态：{formatStatus(selectedDocument.processingStatus)}
                </DialogDescription>
              </DialogHeader>
              <div className='h-[500px] px-6 pb-6'>
                {nodesLoading ? (
                  <div className='flex h-full w-full items-center justify-center text-sm text-neutral-500'>节点加载中…</div>
                ) : nodesError ? (
                  <div className='flex h-full w-full items-center justify-center text-sm text-red-500'>{nodesError}</div>
                ) : (
                  <RadialOrbitalTimeline timelineData={detailTimelineData} />
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
