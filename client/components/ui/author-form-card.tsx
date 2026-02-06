"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useImageUpload } from "@/hooks/use-image-upload";

type LevelOption = {
  value: number;
  label: string;
};

interface AuthorFormCardProps {
  levelOptions: LevelOption[];
  onSubmit: (data: {
    username: string;
    password: string;
    confirmPassword: string;
    levelId: number;
    avatarFile?: File | null;
  }) => Promise<void> | void;
  onCancel: () => void;
  className?: string;
}

export const AuthorFormCard: React.FC<AuthorFormCardProps> = ({
  levelOptions,
  onSubmit,
  onCancel,
  className,
}) => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [selectedLevel, setSelectedLevel] = React.useState<number | null>(
    levelOptions[0]?.value ?? null,
  );
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const { previewUrl, file, handleThumbnailClick, handleFileChange, handleRemove, fileInputRef } =
    useImageUpload();

  React.useEffect(() => {
    if (levelOptions.length === 0) {
      setSelectedLevel(null);
      return;
    }
    const exists = levelOptions.some((option) => option.value === selectedLevel);
    if (!exists) {
      setSelectedLevel(levelOptions[0].value);
    }
  }, [levelOptions, selectedLevel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError("用户名不能为空");
      return;
    }
    if (password.length === 0) {
      setError("密码不能为空");
      return;
    }
    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }
    if (selectedLevel == null) {
      setError("请选择用户等级");
      return;
    }
    try {
      setSubmitting(true);
      await Promise.resolve(
        onSubmit({
          username: trimmedUsername,
          password,
          confirmPassword,
          levelId: selectedLevel,
          avatarFile: file,
        }),
      );
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setSelectedLevel(levelOptions[0]?.value ?? null);
      handleRemove();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err?.message ?? "创建用户失败，请稍后重试";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setSelectedLevel(levelOptions[0]?.value ?? null);
    setError(null);
    handleRemove();
    onCancel();
  };

  const FADE_IN_VARIANTS = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring" } },
  } as const;

  const avatarFallback = username ? username.slice(0, 1).toUpperCase() : "U";

  return (
    <motion.div
      initial="hidden"
      animate="show"
      viewport={{ once: true }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      className={cn("relative w-full max-w-lg rounded-xl bg-background p-6 shadow-xl", className)}
    >
      <div className="flex items-center justify-between">
        <motion.h3 variants={FADE_IN_VARIANTS} className="text-xl font-semibold text-foreground">
          创建新用户
        </motion.h3>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-3">
        <motion.div
          variants={FADE_IN_VARIANTS}
          className="flex flex-col items-center gap-4 md:col-span-1"
        >
          <div className="relative">
            <button
              type="button"
              onClick={handleThumbnailClick}
              className="group block rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
              aria-label="上传头像"
            >
              <Avatar className="h-24 w-24 border-2 border-dashed border-border transition-colors group-hover:border-primary">
                <AvatarImage src={previewUrl ?? undefined} alt={username || "avatar preview"} />
                <AvatarFallback className="bg-muted text-base text-muted-foreground">
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
            </button>
            <button
              type="button"
              className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border bg-background transition-colors hover:bg-muted"
              aria-label={previewUrl ? "清除头像" : "上传头像"}
              onClick={() => {
                if (previewUrl) {
                  handleRemove();
                } else {
                  handleThumbnailClick();
                }
              }}
            >
              {previewUrl ? (
                <X className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Plus className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-sm font-medium text-foreground">用户头像</p>
            <p className="text-xs text-muted-foreground">建议尺寸 256x256，支持 PNG、JPG</p>
          </div>
        </motion.div>

        <div className="flex flex-col gap-4 md:col-span-2">
          <motion.div variants={FADE_IN_VARIANTS} className="grid w-full items-center gap-1.5">
            <Label htmlFor="username">
              用户名 <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              id="username"
              placeholder="请输入用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={submitting}
              required
            />
          </motion.div>
          <motion.div variants={FADE_IN_VARIANTS} className="grid w-full items-center gap-1.5">
            <Label htmlFor="password">
              密码 <span className="text-red-500">*</span>
            </Label>
            <Input
              type="password"
              id="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              required
            />
          </motion.div>
          <motion.div variants={FADE_IN_VARIANTS} className="grid w-full items-center gap-1.5">
            <Label htmlFor="confirm-password">
              确认密码 <span className="text-red-500">*</span>
            </Label>
            <Input
              type="password"
              id="confirm-password"
              placeholder="请再次输入密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={submitting}
              required
            />
          </motion.div>
          <motion.div variants={FADE_IN_VARIANTS} className="grid w-full items-start gap-1.5">
            <Label htmlFor="level-trigger">
              用户等级 <span className="text-red-500">*</span>
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  id="level-trigger"
                  type="button"
                  variant="outline"
                  className="w-full justify-between"
                  disabled={submitting || levelOptions.length === 0}
                >
                  {selectedLevel != null
                    ? levelOptions.find((option) => option.value === selectedLevel)?.label ?? "请选择用户等级"
                    : "请选择用户等级"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
                {levelOptions.length === 0 ? (
                  <DropdownMenuItem disabled>暂无可用等级</DropdownMenuItem>
                ) : (
                  levelOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onSelect={() => {
                        setSelectedLevel(option.value);
                      }}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
          {error ? (
            <motion.p variants={FADE_IN_VARIANTS} className="text-sm text-red-500">
              {error}
            </motion.p>
          ) : null}
        </div>

        <motion.div variants={FADE_IN_VARIANTS} className="flex justify-end gap-3 md:col-span-3">
          <Button type="button" variant="ghost" onClick={handleCancel} disabled={submitting}>
            取消
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "创建中..." : "创建用户"}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};
