'use client';

import { useEffect, useMemo, useState } from 'react';
import { axiosInstance } from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { Gallery4, type Gallery4Item } from '@/components/ui/gallery4';

interface KnowledgeBaseSummary {
  id: number;
  name: string;
  description?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  ownerName?: string | null;
  ownerLevelName?: string | null;
  ownerAvatar?: string | null;
  ownerPriority?: number | null;
}

interface GroupedGallery {
  id: string;
  ownerName: string;
  ownerLevel?: string | null;
  avatarUrl?: string | null;
  ownerPriority: number | null;
  items: Gallery4Item[];
}

export default function AllRagPage() {
  const router = useRouter();
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBaseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/knowledge-base/available');
        const data = res?.data;
        if (!cancelled) {
          if (data?.code === 200 && Array.isArray(data?.data)) {
            setKnowledgeBases(data.data as KnowledgeBaseSummary[]);
            setError(null);
          } else {
            setError(data?.message ?? '加载知识库失败');
            setKnowledgeBases([]);
          }
        }
      } catch (e: any) {
        if (!cancelled) {
          setKnowledgeBases([]);
          setError(e?.response?.data?.message ?? e?.message ?? '加载知识库失败');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const groupedGalleries = useMemo<GroupedGallery[]>(() => {
    if (!knowledgeBases.length) return [];

    const groups = new Map<string, GroupedGallery>();

    knowledgeBases.forEach((kb) => {
      const ownerName = kb.ownerName?.trim() || '未知用户';
      const ownerLevel = kb.ownerLevelName?.trim() || null;
      const groupKey = `${ownerName}__${ownerLevel ?? ''}`;

      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          id: groupKey,
          ownerName,
          ownerLevel,
          avatarUrl: kb.ownerAvatar ?? null,
          ownerPriority: kb.ownerPriority ?? null,
          items: [],
        });
      }

      const group = groups.get(groupKey)!;
      if (group.ownerPriority == null || (kb.ownerPriority ?? Number.MAX_SAFE_INTEGER) < (group.ownerPriority ?? Number.MAX_SAFE_INTEGER)) {
        group.ownerPriority = kb.ownerPriority ?? null;
      }

      group.items.push({
        id: String(kb.id),
        title: kb.name?.trim() || '未命名知识库',
        description: kb.description,
        href: `/rag/${kb.id}`,
        createdAt: kb.createdAt,
        updatedAt: kb.updatedAt,
      });
    });

    groups.forEach((group) => {
      group.items.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : Number.MAX_SAFE_INTEGER;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : Number.MAX_SAFE_INTEGER;
        if (timeA !== timeB) {
          return timeA - timeB;
        }
        return a.id.localeCompare(b.id, 'zh-Hans-CN');
      });
    });

    return Array.from(groups.values()).sort((a, b) => {
      const priorityA = a.ownerPriority ?? Number.MAX_SAFE_INTEGER;
      const priorityB = b.ownerPriority ?? Number.MAX_SAFE_INTEGER;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      return a.ownerName.localeCompare(b.ownerName, 'zh-Hans-CN');
    });
  }, [knowledgeBases]);

  return (
    <div className='space-y-10 px-4 py-10 md:pl-[300px] md:pr-12 min-h-svh bg-white dark:bg-white'>
      <header className='space-y-3 text-center md:text-left'>
        <p className='text-sm uppercase tracking-wide text-neutral-500 dark:text-neutral-500'>
          Knowledge Bases
        </p>
        <h1 className='text-3xl font-semibold text-neutral-900 dark:text-neutral-900 md:text-4xl'>
          可访问的知识库
        </h1>
        <p className='text-sm text-neutral-600 dark:text-neutral-600'>
          按照知识库所属用户进行分组，左右滑动即可浏览该用户创建的知识库。
        </p>
        {error ? <p className='text-sm text-red-500'>{error}</p> : null}
      </header>

      {loading ? (
        <div className='flex min-h-[160px] items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-8 text-sm text-neutral-500 dark:border-neutral-200 dark:bg-white dark:text-neutral-500'>
          正在加载知识库...
        </div>
      ) : groupedGalleries.length ? (
        <div className='space-y-12'>
          {groupedGalleries.map((group) => (
            <Gallery4
              key={group.id}
              avatarUrl={group.avatarUrl}
              avatarFallback={group.ownerName}
              userName={group.ownerName}
              userLevel={group.ownerLevel}
              summary={`共 ${group.items.length} 个知识库`}
              items={group.items}
              onNavigate={(item) => {
                router.push(item.href as any);
              }}
            />
          ))}
        </div>
      ) : (
        <div className='flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-12 text-center text-sm text-neutral-500 dark:border-neutral-200 dark:bg-white dark:text-neutral-500'>
          <p>暂无权限范围内的知识库。</p>
        </div>
      )}
    </div>
  );
}
