"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Upload, Trash2, FileText, CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useMultiFileUpload, type UploadedItem } from "@/components/hooks/use-multi-file-upload";

type UploadItemPayload = Pick<UploadedItem, "id" | "file">;
type UploadResultMap = Record<string, "success" | "error">;

type UploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uploading?: boolean;
  statusMessage?: string | null;
  onSubmit: (items: UploadItemPayload[]) => Promise<UploadResultMap | void> | UploadResultMap | void;
  onFileChange?: (files: File[]) => void;
  accept?: string;
  title?: string;
  description?: string;
};

export function UploadDialog({
  open,
  onOpenChange,
  uploading = false,
  statusMessage,
  onSubmit,
  onFileChange,
  accept = "*/*",
  title = "上传文件",
  description = "选择文件后点击开始上传。",
}: UploadDialogProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [itemStatuses, setItemStatuses] = useState<UploadResultMap>({});
  const {
    items,
    images,
    nonImages,
    fileInputRef,
    handleInputChange,
    addFiles,
    handleRemove,
    clearAll,
  } = useMultiFileUpload({ onChange: onFileChange });

  const handleDialogChange = useCallback(
    (next: boolean) => {
      onOpenChange(next);
      if (!next) {
        setItemStatuses({});
        clearAll();
        setIsDragging(false);
      }
    },
    [clearAll, onOpenChange],
  );

  useEffect(() => {
    setItemStatuses((prev) => {
      const itemIds = new Set(items.map((item) => item.id));
      const filteredEntries = Object.entries(prev).filter(([id]) => itemIds.has(id));
      if (filteredEntries.length === Object.keys(prev).length) {
        return prev;
      }
      return filteredEntries.reduce<UploadResultMap>((acc, [id, status]) => {
        acc[id] = status;
        return acc;
      }, {});
    });
  }, [items]);

  const hasStatuses = Object.keys(itemStatuses).length > 0;

  const handleSubmit = useCallback(async () => {
    if (!items.length || uploading) return;
    setItemStatuses({});
    try {
      const result = await onSubmit(items.map(({ id, file }) => ({ id, file })));
      if (result) {
        setItemStatuses(result);
      }
    } catch (error) {
      // Swallow to keep dialog responsive; status message supplied by parent.
    }
  }, [items, onSubmit, uploading]);

  const handleDropArea = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
      const files = event.dataTransfer.files;
      if (files?.length) addFiles(files);
    },
    [addFiles],
  );

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="w-full max-w-lg sm:max-w-xl lg:max-w-2xl space-y-6 bg-white dark:bg-neutral-950">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          multiple
          onChange={handleInputChange}
        />

        {!items.length ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onDragEnter={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIsDragging(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIsDragging(false);
            }}
            onDrop={handleDropArea}
            className={cn(
              "flex h-64 w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 transition-colors",
              "hover:bg-muted/40",
              isDragging && "border-primary/50 bg-primary/10",
            )}
          >
            <div className="rounded-full bg-background p-3 shadow-sm">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">点击选择文件</p>
              <p className="text-xs text-muted-foreground">或拖拽文件到此处</p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {images.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {images.map((item) => (
                  <div key={item.id} className="group relative h-48 overflow-hidden rounded-lg border">
                    {item.previewUrl ? (
                      <Image
                        src={item.previewUrl}
                        alt={item.file.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()} className="h-9 w-9 p-0">
                        <Upload className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleRemove(item.id)} className="h-9 w-9 p-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-3 py-2 text-xs text-white">
                      {item.file.name}
                    </div>
                    {itemStatuses[item.id] ? (
                      <div className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white">
                        {itemStatuses[item.id] === "success" ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-400" />
                        )}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            {nonImages.length ? (
              <div className="space-y-2">
                {nonImages.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-md border border-dashed border-border/70 px-3 py-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="truncate">{item.file.name}</span>
                    {itemStatuses[item.id] ? (
                      itemStatuses[item.id] === "success" ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )
                    ) : null}
                    <Button variant="ghost" size="icon" className="ml-auto h-8 w-8" onClick={() => handleRemove(item.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">移除文件</span>
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                继续添加
              </Button>
              <Button variant="ghost" size="sm" onClick={clearAll}>
                清空全部
              </Button>
            </div>
          </div>
        )}

        {statusMessage ? <p className="text-sm text-muted-foreground">{statusMessage}</p> : null}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={uploading}>
              关闭
            </Button>
          </DialogClose>
          {!hasStatuses ? (
            <Button onClick={handleSubmit} disabled={!items.length || uploading}>
              {uploading ? "上传中…" : "开始上传"}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
