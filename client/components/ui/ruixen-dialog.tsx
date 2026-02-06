"use client";

import { useImageUpload } from "@/hooks/use-image-upload";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ImagePlus, X } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useState, type ReactNode, type ChangeEvent } from "react";
import { cn } from "@/lib/utils";

type LevelOption = {
  id: number;
  name: string;
};

type Dialog01Props = {
  name?: string;
  userId?: number;
  levelId?: number | null;
  levelName?: string | null;
  avatarUrl?: string;
  trigger?: ReactNode;
  onSave?: (payload: { username: string; avatarFile?: File | null; levelId?: number | null; removeAvatar?: boolean }) => Promise<void> | void;
  canEditUsername?: boolean;
  canEditAvatar?: boolean;
  canEditLevel?: boolean;
  levelOptions?: LevelOption[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disableTrigger?: boolean;
};

export default function Dialog01({
  name,
  userId,
  levelId,
  levelName,
  avatarUrl,
  trigger,
  onSave,
  canEditUsername = true,
  canEditAvatar = true,
  canEditLevel = false,
  levelOptions,
  open,
  onOpenChange,
  disableTrigger = false,
}: Dialog01Props) {
  const id = useId();
  const [internalOpen, setInternalOpen] = useState(false);
  const controlled = open !== undefined;
  const effectiveOpen = controlled ? !!open : internalOpen;
  const [usernameInput, setUsernameInput] = useState(name ?? "");
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(levelId ?? levelOptions?.[0]?.id ?? null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    previewUrl,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
    file,
  } = useImageUpload();
  const [removeExistingAvatar, setRemoveExistingAvatar] = useState(false);

  const showPlaceholder = !previewUrl && (removeExistingAvatar || !avatarUrl);
  const profileImage = previewUrl ?? (!removeExistingAvatar ? avatarUrl : undefined);

  const resetState = useCallback(() => {
    const initialLevel = levelId ?? levelOptions?.[0]?.id ?? null;
    setUsernameInput(name ?? "");
    setSelectedLevelId(initialLevel);
    setError(null);
    setSubmitting(false);
    handleRemove();
    setRemoveExistingAvatar(false);
  }, [name, levelId, levelOptions, handleRemove]);

  useEffect(() => {
    if (!effectiveOpen) {
      resetState();
    }
  }, [effectiveOpen, resetState]);

  const defaultTrigger = (
    <Button
      className="h-auto rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-all duration-500 ease-out hover:scale-105 hover:bg-gray-800 hover:shadow-md active:scale-95 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 dark:hover:shadow-lg dark:hover:shadow-black/50"
    >
      编辑资料
    </Button>
  );

  const effectiveLevel = useMemo(() => {
    const display = levelName?.trim();
    return display && display.length > 0 ? display : "未设置等级";
  }, [levelName]);

  const hasChanges = useMemo(() => {
    const trimmed = usernameInput.trim();
    const usernameChanged = canEditUsername && trimmed !== (name ?? "");
    const avatarChanged = canEditAvatar && (!!file || removeExistingAvatar);
    const levelChanged = canEditLevel && (selectedLevelId ?? null) !== (levelId ?? null);
    return usernameChanged || avatarChanged || levelChanged;
  }, [usernameInput, canEditUsername, name, canEditAvatar, file, removeExistingAvatar, canEditLevel, selectedLevelId, levelId]);

  const handleSubmit = useCallback(async () => {
    const trimmed = usernameInput.trim();
    if (canEditUsername && !trimmed) {
      setError("用户名不能为空");
      return;
    }
    if (!hasChanges) {
      if (!controlled) setInternalOpen(false);
      onOpenChange?.(false);
      return;
    }
    if (!onSave) {
      if (!controlled) setInternalOpen(false);
      onOpenChange?.(false);
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await Promise.resolve(
        onSave({
          username: canEditUsername ? trimmed : name ?? "",
          avatarFile: canEditAvatar && !removeExistingAvatar ? file ?? undefined : undefined,
          levelId: canEditLevel ? selectedLevelId ?? null : undefined,
          removeAvatar: canEditAvatar ? removeExistingAvatar : undefined,
        }),
      );
      if (!controlled) setInternalOpen(false);
      onOpenChange?.(false);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.message ??
        "保存失败，请稍后重试";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }, [canEditUsername, usernameInput, canEditAvatar, file, removeExistingAvatar, canEditLevel, selectedLevelId, levelId, onSave, controlled, onOpenChange, name, hasChanges]);

  const handleDialogOpenChange = (value: boolean) => {
    if (!controlled) {
      setInternalOpen(value);
    }
    if (!value) {
      resetState();
    }
    onOpenChange?.(value);
  };

  const effectiveLevelOptions: LevelOption[] =
    levelOptions && levelOptions.length > 0
      ? levelOptions
      : levelId != null && levelName
        ? [{ id: levelId, name: levelName }]
        : [];

  const levelDisplayName = useMemo(() => {
    const targetId = selectedLevelId ?? levelId ?? null;
    if (targetId != null) {
      const found = effectiveLevelOptions.find((item) => item.id === targetId);
      if (found) {
        return found.name;
      }
    }
    return effectiveLevel;
  }, [effectiveLevelOptions, selectedLevelId, levelId, effectiveLevel]);

  const handleAvatarFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (removeExistingAvatar) {
        setRemoveExistingAvatar(false);
      }
      handleFileChange(event);
    },
    [handleFileChange, removeExistingAvatar],
  );

  return (
    <Dialog open={effectiveOpen} onOpenChange={handleDialogOpenChange}>
      {!disableTrigger ? (
        <DialogTrigger asChild>
          {trigger ?? defaultTrigger}
        </DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl border">
        <div
          className="px-6 py-4 h-36"
          style={{
            background: "radial-gradient(circle, rgba(238, 174, 202, 1) 0%, rgba(148, 187, 233, 1) 100%)",
          }}
        />

        <div className="-mt-14 flex justify-center">
          <div className="relative">
            <Avatar
              className={cn(
                "h-24 w-24 border-4 border-background shadow-lg rounded-full",
                showPlaceholder && "border-dashed border-border/70 bg-muted text-muted-foreground",
              )}
            >
              {profileImage ? <AvatarImage src={profileImage} alt="头像" /> : null}
              <AvatarFallback>{showPlaceholder ? "头像" : "U"}</AvatarFallback>
            </Avatar>
            {canEditAvatar ? (
              <>
                {previewUrl || (!removeExistingAvatar && avatarUrl) ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleRemove();
                      setRemoveExistingAvatar(true);
                    }}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow transition-colors hover:bg-muted"
                    aria-label="清除选中的头像"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
                <button
                  onClick={handleThumbnailClick}
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  aria-label="更换头像"
                >
                  <ImagePlus size={16} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </>
            ) : null}
          </div>
        </div>

        <div className="max-h-[50vh] overflow-y-auto px-6 py-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor={`${id}-level`}>等级</Label>
            {canEditLevel ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    id={`${id}-level`}
                    type="button"
                    variant="outline"
                    className="w-full justify-between"
                    disabled={effectiveLevelOptions.length === 0 || submitting}
                  >
                    {levelDisplayName}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
                  {effectiveLevelOptions.length === 0 ? (
                    <DropdownMenuItem disabled>暂无可用等级</DropdownMenuItem>
                  ) : (
                    effectiveLevelOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.id}
                        onSelect={() => {
                          setSelectedLevelId(option.id);
                        }}
                      >
                        {option.name}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div
                id={`${id}-level`}
                role="textbox"
                aria-readonly="true"
                tabIndex={-1}
                className="flex h-9 w-full items-center rounded-lg border border-input bg-muted px-3 text-sm text-muted-foreground shadow-sm shadow-black/5 select-none"
              >
                {levelDisplayName}
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${id}-name`}>用户名</Label>
            <Input
              id={`${id}-name`}
              placeholder="例如: johndoe"
              value={usernameInput}
              onChange={(event) => setUsernameInput(event.target.value)}
              readOnly={!canEditUsername}
              tabIndex={canEditUsername ? undefined : -1}
              onFocus={
                canEditUsername
                  ? undefined
                  : (event) => {
                      event.currentTarget.blur();
                    }
              }
              className={cn(!canEditUsername && "cursor-default bg-muted text-muted-foreground")}
            />
          </div>
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
        </div>

        <DialogFooter className="border-t border-border px-6 py-4 bg-background rounded-b-2xl">
          <DialogClose asChild>
            <Button variant="outline" disabled={submitting}>取消</Button>
          </DialogClose>
          {(canEditAvatar || canEditUsername || canEditLevel) ? (
            <Button type="button" onClick={handleSubmit} disabled={submitting || !hasChanges}>
              {submitting ? "保存中..." : "保存更改"}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
