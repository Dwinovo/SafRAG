"use client";
import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Database, ChevronDown, Check } from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// util cn compatible with project
import { cn as projectCn } from "@/lib/utils";
const cn = (...inputs: Array<string | number | boolean | null | undefined>) => projectCn(inputs.filter(Boolean).join(" "));

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = React.forwardRef<React.ElementRef<typeof TooltipPrimitive.Content>, React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & { showArrow?: boolean }>(
  ({ className, sideOffset = 4, showArrow = false, ...props }, ref) => (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "relative z-50 max-w-[280px] rounded-md bg-popover text-popover-foreground px-1.5 py-1 text-xs animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      >
        {props.children}
        {showArrow && (
          <TooltipPrimitive.Arrow className="-my-px fill-popover" />
        )}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverContent = React.forwardRef<React.ElementRef<typeof PopoverPrimitive.Content>, React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>>(
  ({ className, align = "center", sideOffset = 4, ...props }, ref) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-64 rounded-xl bg-popover dark:bg-[#303030] p-2 text-popover-foreground dark:text-white shadow-md outline-none animate-in data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogOverlay = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
);
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>>(
  ({ className, children, ...props }, ref) => (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-[90vw] md:max-w-[800px] translate-x-[-50%] translate-y-[-50%] gap-4 border-none bg-transparent p-0 shadow-none duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          className
        )}
        {...props}
      >
        <div className="relative bg-card dark:bg-[#303030] rounded-[28px] overflow-hidden shadow-2xl p-1">
          {children}
          <DialogPrimitive.Close className="absolute right-3 top-3 z-10 rounded-full bg-background/50 dark:bg-[#303030] p-1 hover:bg-accent dark:hover:bg-[#515151] transition-all">
            <XIcon className="h-5 w-5 text-muted-foreground dark:text-gray-200 hover:text-foreground dark:hover:text-white" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </div>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 5V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const SendIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 5.25L12 18.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.75 12L12 5.25L5.25 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const MicIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
  </svg>
);

type KnowledgeBaseOption = {
  id: number;
  name: string;
  description?: string | null;
  ownerName?: string | null;
  ownerLevelName?: string | null;
};

const truncateText = (value?: string | null, maxLength = 30) => {
  if (!value) return "";
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength)}…`;
};

export type PromptBoxProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  onSend?: (payload: { text: string; imagePreview?: string | null; knowledgeBaseIds: number[] }) => Promise<void> | void;
  isStreaming?: boolean;
  onStop?: () => void;
}

export const PromptBox = React.forwardRef<HTMLTextAreaElement, PromptBoxProps>(({ className, onSend, isStreaming = false, onStop, ...props }, ref) => {
  const internalTextareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [value, setValue] = React.useState("");
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [knowledgeBases, setKnowledgeBases] = React.useState<KnowledgeBaseOption[]>([]);
  const [selectedKnowledgeBaseIds, setSelectedKnowledgeBaseIds] = React.useState<number[]>([]);
  const [tempSelectedKnowledgeBaseIds, setTempSelectedKnowledgeBaseIds] = React.useState<number[]>([]);
  const [kbPopoverOpen, setKbPopoverOpen] = React.useState(false);
  const [kbLoading, setKbLoading] = React.useState(false);
  const [kbError, setKbError] = React.useState<string | null>(null);
  const [kbSearchTerm, setKbSearchTerm] = React.useState("");
  const [isImageDialogOpen, setIsImageDialogOpen] = React.useState(false);

  const selectedKnowledgeBases = React.useMemo(() => {
    if (!selectedKnowledgeBaseIds.length) return [];
    const map = new Map<number, KnowledgeBaseOption>();
    knowledgeBases.forEach((kb) => map.set(kb.id, kb));
    return selectedKnowledgeBaseIds
      .map((id) => map.get(id) || { id, name: `知识库 #${id}` })
      .filter(Boolean);
  }, [knowledgeBases, selectedKnowledgeBaseIds]);

  const knowledgeBaseButtonLabel = selectedKnowledgeBases.length
    ? `已选 ${selectedKnowledgeBases.length} 个`
    : "选择知识库";

  const fetchKnowledgeBases = React.useCallback(async () => {
    setKbLoading(true);
    setKbError(null);
    try {
      const res = await axiosInstance.get("/knowledge-base/available");
      const data = res?.data;
      if (data && data.code === 200 && Array.isArray(data.data)) {
        const list = data.data.map((item: any) => ({
          id: item.id,
          name: item.name ?? `知识库 #${item.id}`,
          description: item.description ?? null,
          ownerName: item.ownerName ?? null,
          ownerLevelName: item.ownerLevelName ?? null,
        })) as KnowledgeBaseOption[];
        setKnowledgeBases(list);
      } else {
        setKbError(data?.message || "加载知识库失败");
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "加载知识库失败";
      setKbError(message);
    } finally {
      setKbLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!kbPopoverOpen) return;
    setTempSelectedKnowledgeBaseIds(selectedKnowledgeBaseIds);
    setKbSearchTerm("");
    if (!knowledgeBases.length && !kbLoading && !kbError) {
      fetchKnowledgeBases();
    }
  }, [kbPopoverOpen, selectedKnowledgeBaseIds, knowledgeBases.length, kbLoading, kbError, fetchKnowledgeBases]);

  const filteredKnowledgeBases = React.useMemo(() => {
    if (!kbSearchTerm.trim()) {
      return knowledgeBases;
    }
    const keyword = kbSearchTerm.trim().toLowerCase();
    return knowledgeBases.filter((kb) => {
      const nameMatch = kb.name?.toLowerCase().includes(keyword);
      const descMatch = kb.description?.toLowerCase().includes(keyword);
      const ownerMatch = kb.ownerName?.toLowerCase().includes(keyword);
      return Boolean(nameMatch || descMatch || ownerMatch);
    });
  }, [knowledgeBases, kbSearchTerm]);

  const toggleTempKnowledgeBase = React.useCallback((id: number) => {
    setTempSelectedKnowledgeBaseIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const handleConfirmKnowledgeBases = React.useCallback(() => {
    setSelectedKnowledgeBaseIds(tempSelectedKnowledgeBaseIds);
    setKbPopoverOpen(false);
  }, [tempSelectedKnowledgeBaseIds]);

  const handleRemoveSelectedKnowledgeBase = React.useCallback((id: number) => {
    setSelectedKnowledgeBaseIds((prev) => prev.filter((item) => item !== id));
    setTempSelectedKnowledgeBaseIds((prev) => prev.filter((item) => item !== id));
  }, []);
  React.useImperativeHandle(ref, () => internalTextareaRef.current!, []);
  React.useLayoutEffect(() => { const textarea = internalTextareaRef.current; if (textarea) { textarea.style.height = "auto"; const newHeight = Math.min(textarea.scrollHeight, 200); textarea.style.height = `${newHeight}px`; } }, [value]);
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => { setValue(e.target.value); if (props.onChange) props.onChange(e); };
  const handlePlusClick = () => { fileInputRef.current?.click(); };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file && file.type.startsWith("image/")) { const reader = new FileReader(); reader.onloadend = () => { setImagePreview(reader.result as string); }; reader.readAsDataURL(file); } event.target.value = ""; };
  const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); setImagePreview(null); if(fileInputRef.current) { fileInputRef.current.value = ""; } };
  const hasValue = value.trim().length > 0 || imagePreview;
  const sendMessage = async () => {
    if (!hasValue) return;
    const textToSend = value.trim();
    const imageToSend = imagePreview;
    
    // 立即清空输入框,不等待 onSend 完成
    setValue("");
    setImagePreview(null);
    
    try {
      if (onSend) {
        await onSend({ text: textToSend, imagePreview: imageToSend, knowledgeBaseIds: selectedKnowledgeBaseIds });
      }
    } catch {
      // 静默处理发送失败
    }
  };
  return (
    <div className={cn("flex flex-col rounded-[28px] p-2 shadow-sm transition-colors bg-white border dark:bg-[#303030] dark:border-transparent cursor-text", className)}>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*"/>
      {imagePreview && (
        <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
          <div className="relative mb-1 w-fit rounded-[1rem] px-1 pt-1">
            <button type="button" className="transition-transform" onClick={() => setIsImageDialogOpen(true)}>
              <img src={imagePreview} alt="Image preview" className="h-14.5 w-14.5 rounded-[1rem]" />
            </button>
            <button onClick={handleRemoveImage} className="absolute right-2 top-2 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-white/50 dark:bg-[#303030] text-black dark:text-white transition-colors hover:bg-accent dark:hover:bg-[#515151]" aria-label="Remove image">
              <XIcon className="h-4 w-4" />
            </button>
          </div>
          <DialogContent>
            <img src={imagePreview} alt="Full size preview" className="w-full max-h-[95vh] object-contain rounded-[24px]" />
          </DialogContent>
        </Dialog>
      )}

      <textarea
        ref={internalTextareaRef}
        rows={1}
        value={value}
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !isStreaming) {
            e.preventDefault();
            sendMessage();
          }
        }}
        placeholder={isStreaming ? "正在生成中..." : (props.placeholder || "Message...")}
        readOnly={isStreaming}
        className="custom-scrollbar w-full resize-none border-0 bg-transparent p-3 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-gray-300 focus:ring-0 focus-visible:outline-none min-h-12"
        {...props}
      />

      <div className="mt-0.5 p-1 pt-0">
        <TooltipProvider delayDuration={100}>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" onClick={handlePlusClick} className="flex h-8 w-8 items-center justify-center rounded-full text-foreground dark:text-white transition-colors hover:bg-accent dark:hover:bg-[#515151] focus-visible:outline-none">
                  <PlusIcon className="h-6 w-6" />
                  <span className="sr-only">Attach image</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" showArrow={true}><p>Attach image</p></TooltipContent>
            </Tooltip>

            <Popover
              open={kbPopoverOpen}
              onOpenChange={(open) => {
                setKbPopoverOpen(open);
                if (open) {
                  setTempSelectedKnowledgeBaseIds(selectedKnowledgeBaseIds);
                }
              }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex h-8 items-center gap-2 rounded-full px-3 text-sm text-foreground dark:text-white transition-colors hover:bg-accent dark:hover:bg-[#515151] focus-visible:outline-none focus-visible:ring-ring"
                    >
                      <Database className="h-4 w-4" />
                      <span>{knowledgeBaseButtonLabel}</span>
                      <ChevronDown className="h-4 w-4 opacity-70" />
                    </button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="top" showArrow={true}><p>选择知识库</p></TooltipContent>
              </Tooltip>
              <PopoverContent side="top" align="start" className="w-72 p-3">
                <div className="flex flex-col gap-3">
                  {kbLoading ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">加载中…</div>
                  ) : kbError ? (
                    <div className="space-y-3">
                      <p className="text-sm text-red-500">{kbError}</p>
                      <Button type="button" size="sm" variant="outline" onClick={fetchKnowledgeBases}>
                        重试
                      </Button>
                    </div>
                  ) : knowledgeBases.length ? (
                    <>
                      <Input
                        value={kbSearchTerm}
                        onChange={(event) => setKbSearchTerm(event.target.value)}
                        placeholder="搜索知识库..."
                        className="h-8 border-border text-sm"
                      />
                      <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                        {filteredKnowledgeBases.length ? filteredKnowledgeBases.map((kb) => {
                          const checked = tempSelectedKnowledgeBaseIds.includes(kb.id);
                          return (
                            <button
                              key={kb.id}
                              type="button"
                            onClick={() => toggleTempKnowledgeBase(kb.id)}
                            className={cn(
                              "flex w-full items-start gap-3 rounded-md p-2 text-left transition-colors",
                              checked ? "bg-accent/60 dark:bg-[#3b4045]" : "hover:bg-accent dark:hover:bg-[#515151]"
                            )}
                          >
                            <span
                              className={cn(
                                "mt-1 flex h-4 w-4 items-center justify-center rounded border text-xs",
                                checked ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
                              )}
                            >
                              {checked && <Check className="h-3 w-3" />}
                            </span>
                            <span className="flex-1">
                              <span className="block text-sm font-medium text-foreground dark:text-white">
                                {kb.name}
                              </span>
                              {kb.description ? (
                                <span className="mt-1 block text-xs text-muted-foreground dark:text-gray-400">
                                  {truncateText(kb.description, 50)}
                                </span>
                              ) : null}
                              {(kb.ownerName || kb.ownerLevelName) ? (
                                <span className="mt-1 block text-xs text-muted-foreground dark:text-gray-500">
                                  {kb.ownerName ? `创建者：${kb.ownerName}` : "创建者：未知"}
                                  {kb.ownerLevelName ? ` · 等级：${kb.ownerLevelName}` : ""}
                                </span>
                              ) : null}
                            </span>
                          </button>
                        );
                        }) : (
                          <div className="py-6 text-center text-sm text-muted-foreground">
                            未找到匹配的知识库
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="py-4 text-center text-sm text-muted-foreground">暂无可用知识库</div>
                  )}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={!tempSelectedKnowledgeBaseIds.length}
                      onClick={() => setTempSelectedKnowledgeBaseIds([])}
                    >
                      清空
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setKbPopoverOpen(false)}>
                        取消
                      </Button>
                      <Button type="button" size="sm" onClick={handleConfirmKnowledgeBases}>
                        完成
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {selectedKnowledgeBases.length > 0 && (
              <>
                <div className="h-4 w-px bg-border dark:bg-gray-600" />
                <div className="flex flex-wrap items-center gap-2">
                  {selectedKnowledgeBases.map((kb) => (
                    <button
                      key={kb.id}
                      type="button"
                      onClick={() => handleRemoveSelectedKnowledgeBase(kb.id)}
                      className="group flex items-center gap-1 rounded-full bg-accent/60 px-2 py-1 text-xs text-foreground transition-colors hover:bg-accent dark:bg-[#3b4045] dark:hover:bg-[#4a4f55]"
                    >
                      <Database className="h-3 w-3" />
                      <span>{kb.name}</span>
                      <XIcon className="h-3 w-3 opacity-70 group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="ml-auto flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full text-foreground dark:text-white transition-colors hover:bg-accent dark:hover:bg-[#515151] focus-visible:outline-none">
                    <MicIcon className="h-5 w-5" />
                    <span className="sr-only">Record voice</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" showArrow={true}><p>Record voice</p></TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    disabled={!isStreaming && !hasValue}
                    onClick={isStreaming ? onStop : sendMessage}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80 disabled:bg-black/40 dark:disabled:bg-[#515151]"
                  >
                    {isStreaming ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                        <rect x="7" y="7" width="10" height="10" rx="1" />
                      </svg>
                    ) : (
                      <SendIcon className="h-6 w-6 text-bold" />
                    )}
                    <span className="sr-only">{isStreaming ? 'Stop generation' : 'Send message'}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" showArrow={true}><p>{isStreaming ? 'Stop' : 'Send'}</p></TooltipContent>
              </Tooltip>
            </div>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
});
PromptBox.displayName = "PromptBox";
