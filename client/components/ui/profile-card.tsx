"use client";

import React from "react";
import Dialog01 from "@/components/ui/ruixen-dialog";

type ProfileCardProps = {
  className?: string;
  username: string;
  userId: number;
  levelId?: number | null;
  levelName?: string | null;
  avatarUrl: string;
  coverImageUrl?: string;
  onSave?: (payload: { username: string; avatarFile?: File | null; levelId?: number | null; removeAvatar?: boolean }) => Promise<void> | void;
};

export const ProfileCard: React.FC<ProfileCardProps> = ({
  className,
  username,
  userId,
  levelId,
  levelName,
  avatarUrl,
  coverImageUrl,
  onSave,
}) => {
  const displayCover = coverImageUrl ?? avatarUrl;
  const displayLevel = levelName?.trim() ? levelName : "未设置等级";
  const displayName = username;

  return (
    <div className={className}>
      <div className="relative z-10 mx-0 overflow-hidden rounded-3xl bg-white shadow-lg transition-transform duration-700 ease-out hover:scale-[1.02] dark:bg-zinc-900 dark:shadow-2xl dark:shadow-black/80">
        <div className="group relative overflow-hidden">
          <img
            src={displayCover}
            alt="Profile cover"
            className="aspect-square w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/30 to-transparent dark:from-black/60" />
          <div className="absolute left-6 top-6">
            <h2 className="text-2xl font-medium text-black drop-shadow-lg">
              {displayName}
            </h2>
          </div>
        </div>

        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 overflow-hidden rounded-full ring-2 ring-gray-200 transition-transform duration-500 ease-out hover:scale-110 dark:ring-zinc-700">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="transition-transform duration-500 ease-out hover:translate-x-1">
              <div className="text-sm text-gray-700 dark:text-zinc-200">{displayName}</div>
              <div className="text-xs text-gray-500 dark:text-zinc-500">{displayLevel}</div>
            </div>
          </div>
          <Dialog01
            name={username}
            userId={userId}
            levelId={levelId ?? null}
            levelName={displayLevel}
            avatarUrl={avatarUrl}
            canEditLevel={false}
            onSave={onSave}
            trigger={
              <button
                type="button"
                className="pointer-events-auto rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-all duration-500 ease-out hover:scale-105 hover:bg-gray-800 hover:shadow-md active:scale-95 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 dark:hover:shadow-lg dark:hover:shadow-black/50"
              >
                编辑资料
              </button>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
