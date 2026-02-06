import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type UploadedItem = {
  id: string;
  file: File;
  previewUrl?: string;
};

interface UseMultiFileUploadOptions {
  acceptImagesOnly?: boolean;
  onChange?: (files: File[]) => void;
}

export function useMultiFileUpload({ acceptImagesOnly = false, onChange }: UseMultiFileUploadOptions = {}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<Record<string, string>>({});
  const [items, setItems] = useState<UploadedItem[]>([]);

  const cleanupPreview = useCallback((id: string) => {
    const url = previewUrlsRef.current[id];
    if (url) URL.revokeObjectURL(url);
    delete previewUrlsRef.current[id];
  }, []);

  const emitChange = useCallback((nextItems: UploadedItem[]) => {
    onChange?.(nextItems.map((item) => item.file));
  }, [onChange]);

  const addFiles = useCallback((files: FileList | File[]) => {
    const incoming = Array.from(files);
    if (!incoming.length) return;

    setItems((prev) => {
      const next = [...prev];
      const getId = () => {
        if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
          return crypto.randomUUID();
        }
        return Math.random().toString(36).slice(2, 10);
      };

      for (const file of incoming) {
        if (acceptImagesOnly && !file.type.startsWith("image/")) continue;
        const id = getId();
        const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
        if (previewUrl) previewUrlsRef.current[id] = previewUrl;
        next.push({ id, file, previewUrl });
      }
      emitChange(next);
      return next;
    });
  }, [acceptImagesOnly, emitChange]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      addFiles(files);
      event.target.value = "";
    }
  }, [addFiles]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer.files;
    if (files) addFiles(files);
  }, [addFiles]);

  const handleRemove = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      cleanupPreview(id);
      emitChange(next);
      return next;
    });
  }, [cleanupPreview, emitChange]);

  const clearAll = useCallback(() => {
    setItems((prev) => {
      prev.forEach((item) => cleanupPreview(item.id));
      emitChange([]);
      return [];
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [cleanupPreview, emitChange]);

  useEffect(() => () => {
    Object.values(previewUrlsRef.current).forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const images = useMemo(() => items.filter((item) => Boolean(item.previewUrl)), [items]);
  const nonImages = useMemo(() => items.filter((item) => !item.previewUrl), [items]);

  return {
    items,
    images,
    nonImages,
    fileInputRef,
    handleInputChange,
    handleDrop,
    addFiles,
    handleRemove,
    clearAll,
  };
}
