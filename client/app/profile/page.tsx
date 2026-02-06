'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { NavHeroHeader } from "@/components/ui/nav-hero-header";
import { ProfileCard } from "@/components/ui/profile-card";
import { BorderBeam } from "@/components/ui/border-beam";
import Dialog01 from "@/components/ui/ruixen-dialog";
import { AnimatedTooltip, type AnimatedTooltipItem } from "@/components/ui/animated-tooltip";
import AnimatedGlowingSearchBar from "@/components/ui/animated-glowing-search-bar";
import MorphingPageDots from "@/components/ui/morphing-page-dots";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AuthorFormCard } from "@/components/ui/author-form-card";
import { axiosInstance } from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch, setUserProfile } from "@/lib/store";
import { getCurrentUserId } from "@/lib/auth";

type ProfileResponse = {
  id: number;
  username: string;
  levelId: number;
  levelName?: string | null;
  avatarUrl?: string | null;
  priority?: number;
};

type LevelOption = {
  id: number;
  name: string;
  priority?: number | null;
};

type UserSummary = {
  id: number;
  username: string;
  levelId: number;
  levelName?: string | null;
  avatarUrl?: string | null;
  priority?: number | null;
};

const DEFAULT_AVATAR = "/default_avatar.png";
const CREATE_MEMBER_ID = -1;
const CREATE_MEMBER_ITEM: AnimatedTooltipItem = {
  id: CREATE_MEMBER_ID,
  name: "创建成员",
  designation: "添加新用户",
  image:
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='112' height='112' viewBox='0 0 112 112'><rect width='112' height='112' rx='56' fill='white'/><path d='M56 28a4 4 0 0 1 4 4v20h20a4 4 0 0 1 0 8H60v20a4 4 0 0 1-8 0V60H32a4 4 0 0 1 0-8h20V32a4 4 0 0 1 4-4Z' fill='%23646673'/></svg>",
};
const PAGE_SIZE = 10;

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [avatarOverride, setAvatarOverride] = useState<string | null>(null);
  const [userSummaries, setUserSummaries] = useState<UserSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [tooltipItems, setTooltipItems] = useState<AnimatedTooltipItem[]>([]);
  const [levels, setLevels] = useState<LevelOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [canCreateUser, setCanCreateUser] = useState(false);
  const [selectedLevelName, setSelectedLevelName] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isMembersLoading, setIsMembersLoading] = useState(false);
  const dispatch = useAppDispatch();

  const createButtonItems = useMemo(() => [CREATE_MEMBER_ITEM], []);

  const sortSummaries = useCallback((users: UserSummary[]): UserSummary[] => {
    return [...users].sort((a, b) => {
      const pa = a.priority ?? Number.MAX_SAFE_INTEGER;
      const pb = b.priority ?? Number.MAX_SAFE_INTEGER;
      if (pa !== pb) {
        return pa - pb;
      }
      return a.id - b.id;
    });
  }, []);

  const buildTooltipItems = useCallback((users: UserSummary[]): AnimatedTooltipItem[] => {
    return users.map((user) => ({
      id: user.id,
      name: user.username,
      designation: user.levelName ?? "未设置等级",
      image: user.avatarUrl && user.avatarUrl.trim().length > 0 ? user.avatarUrl : DEFAULT_AVATAR,
      priority: user.priority ?? null,
    }));
  }, []);

  const processListResponse = useCallback(
    (listData: any, userId: number) => {
      const rawUsers: ProfileResponse[] = Array.isArray(listData)
        ? (listData as ProfileResponse[])
        : Array.isArray(listData?.list)
          ? ((listData.list as ProfileResponse[]))
          : [];
      const summaries = rawUsers.map((user) => ({
        id: user.id,
        username: user.username,
        levelId: user.levelId,
        levelName: user.levelName,
        avatarUrl: user.avatarUrl,
        priority: user.priority ?? null,
      }));
      const orderedSummaries = sortSummaries(summaries);
      setUserSummaries(orderedSummaries);
      setTooltipItems(buildTooltipItems(orderedSummaries));
      return orderedSummaries.length;
    },
    [buildTooltipItems, sortSummaries],
  );

  const fetchUserCount = useCallback(
    async (usernameFilter?: string, levelNameFilter?: string | null) => {
      const params: Record<string, string> = {};
      if (usernameFilter) {
        params.username = usernameFilter;
      }
      if (levelNameFilter) {
        params.level_name = levelNameFilter;
      }
      const res = await axiosInstance.get("/user/count", { params });
      const { code, data, message } = res.data ?? {};
      if (code === 200) {
        return typeof data === "number" ? data : 0;
      }
      throw new Error(message ?? "获取用户数量失败");
    },
    [],
  );

  const fetchMembers = useCallback(
    async ({
      userId,
      pageIndex,
      usernameFilter,
      levelNameFilter,
    }: {
      userId: number;
      pageIndex: number;
      usernameFilter?: string;
      levelNameFilter?: string | null;
    }) => {
      const params: Record<string, string | number> = {
        page: pageIndex + 1,
        pagesize: PAGE_SIZE,
      };
      if (usernameFilter) {
        params.username = usernameFilter;
      }
      if (levelNameFilter) {
        params.level_name = levelNameFilter;
      }

      setIsMembersLoading(true);
      try {
        const listRes = await axiosInstance.get("/user/users", { params });
        const { code, data, message } = listRes.data ?? {};
        if (code === 200) {
          const renderedCount = processListResponse(data, userId);
          const pageNum =
            typeof data?.pageNum === "number" && data.pageNum >= 1 ? data.pageNum : pageIndex + 1;
          const pages =
            typeof data?.pages === "number" && data.pages >= 1
              ? data.pages
              : Math.max(1, Math.ceil((typeof data?.total === "number" ? data.total : renderedCount) / PAGE_SIZE));
          if (typeof data?.total === "number") {
            setTotalCount(data.total);
          }
          setTotalPages(pages);
          setCurrentPage(Math.min(pageNum - 1, pages - 1));
          return;
        }
        setUserSummaries([]);
        setTooltipItems([]);
        throw new Error(message ?? "获取成员列表失败");
      } finally {
        setIsMembersLoading(false);
      }
    },
    [processListResponse],
  );

  const refreshMembersWithFilters = useCallback(
    async (userId: number, pageIndex: number, usernameFilter: string, levelNameFilter: string | null) => {
      try {
        const total = await fetchUserCount(usernameFilter, levelNameFilter);
        setTotalCount(total);
        const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
        setTotalPages(pages);
        const targetPage = Math.min(pageIndex, pages - 1);
        await fetchMembers({
          userId,
          pageIndex: targetPage,
          usernameFilter: usernameFilter || undefined,
          levelNameFilter: levelNameFilter || null,
        });
        setCurrentPage(targetPage);
        setError(null);
      } catch (err: any) {
        const fallbackMessage = err?.response?.data?.message ?? err?.message ?? "获取成员列表失败";
        setError(fallbackMessage);
        setUserSummaries([]);
        setTooltipItems([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    },
    [fetchMembers, fetchUserCount],
  );

  useEffect(() => {
    let active = true;
    const loadInitial = async () => {
      try {
        const userId = getCurrentUserId();
        if (!active) {
          return;
        }
        setCurrentUserId(userId);
        if (!userId) {
          setError("无法确认用户身份，请重新登录");
          setLoading(false);
          return;
        }

        const [profileRes, levelsRes] = await Promise.all([
          axiosInstance.get(`/user/${userId}`),
          axiosInstance.get("/levels"),
        ]);
        if (!active) {
          return;
        }

        const { code: profileCode, data: profileData, message: profileMessage } = profileRes.data ?? {};
        let allowCreate = false;
        if (profileCode === 200 && profileData) {
          const parsed = profileData as ProfileResponse;
          setProfile(parsed);
          setAvatarOverride(parsed.avatarUrl ?? null);
          dispatch(setUserProfile({ username: parsed.username, avatarUrl: parsed.avatarUrl }));
          allowCreate = (parsed.priority ?? null) === 0;
          setError(null);
        } else {
          setError(profileMessage ?? "获取用户信息失败");
          setLoading(false);
          return;
        }
        setCanCreateUser(allowCreate);

        const { code: levelCode, data: levelData } = levelsRes.data ?? {};
        if (levelCode === 200 && Array.isArray(levelData)) {
          setLevels(
            levelData.map((item: any) => ({
              id: item.id,
              name: item.name,
              priority: item.priority ?? null,
            })),
          );
        } else {
          setLevels([]);
        }

        await refreshMembersWithFilters(userId, 0, "", null);
      } catch (err: any) {
        if (!active) {
          return;
        }
        const fallbackMessage = err?.response?.data?.message ?? err?.message ?? "获取用户信息失败";
        setError(fallbackMessage);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadInitial();
    return () => {
      active = false;
    };
  }, [dispatch, refreshMembersWithFilters]);

  useEffect(() => {
    if (!canCreateUser) {
      setCreateDialogOpen(false);
    }
  }, [canCreateUser]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      if (!currentUserId) {
        return;
      }
      const usernameFilter = value.trim();
      const levelFilter = selectedLevelName ? selectedLevelName.trim() || null : null;
      void refreshMembersWithFilters(currentUserId, 0, usernameFilter, levelFilter);
    },
    [currentUserId, refreshMembersWithFilters, selectedLevelName],
  );

  const handleLevelChange = useCallback(
    (levelName: string | null) => {
      setSelectedLevelName(levelName);
      if (!currentUserId) {
        return;
      }
      const usernameFilter = searchTerm.trim();
      const levelFilter = levelName?.trim() || null;
      void refreshMembersWithFilters(currentUserId, 0, usernameFilter, levelFilter);
    },
    [currentUserId, refreshMembersWithFilters, searchTerm],
  );

  const handleSearchSubmit = useCallback(async () => {
    if (!currentUserId) {
      return;
    }
    await refreshMembersWithFilters(
      currentUserId,
      0,
      searchTerm.trim(),
      selectedLevelName?.trim() || null,
    );
  }, [currentUserId, refreshMembersWithFilters, searchTerm, selectedLevelName]);

  const handlePageChange = useCallback(
    async (pageIndex: number) => {
      if (!currentUserId || isMembersLoading) {
        return;
      }
      try {
        await fetchMembers({
          userId: currentUserId,
          pageIndex,
          usernameFilter: searchTerm.trim() || undefined,
          levelNameFilter: selectedLevelName?.trim() || null,
        });
        setCurrentPage(pageIndex);
        setError(null);
      } catch (err: any) {
        const fallbackMessage = err?.response?.data?.message ?? err?.message ?? "获取成员列表失败";
        setError(fallbackMessage);
      }
    },
    [currentUserId, fetchMembers, isMembersLoading, searchTerm, selectedLevelName],
  );

  const handleProfileSave = async ({
    username,
    avatarFile,
    removeAvatar,
  }: {
    username: string;
    avatarFile?: File | null;
    levelId?: number | null;
    removeAvatar?: boolean;
  }) => {
    if (!currentUserId) {
      throw new Error("无法确认用户身份，请重新登录");
    }
    const formData = new FormData();
    formData.append("username", username);
    if (avatarFile !== undefined && avatarFile !== null) {
      formData.append("avatar", avatarFile);
    }
    if (removeAvatar) {
      formData.append("removeAvatar", "true");
    }
    const res = await axiosInstance.patch(`/user/${currentUserId}`, formData);
    const { code, data, message } = res.data ?? {};
    if (code !== 200 || !data) {
      throw new Error(message ?? "更新失败");
    }
    const updatedProfile = data as ProfileResponse;
    const updatedCanCreate = (updatedProfile.priority ?? null) === 0;
    if (updatedProfile.id === currentUserId) {
      setCanCreateUser(updatedCanCreate);
    }
    setProfile(updatedProfile);
    dispatch(setUserProfile({ username: updatedProfile.username, avatarUrl: updatedProfile.avatarUrl }));
    setAvatarOverride(updatedProfile.avatarUrl ?? null);
    let nextSummaries: UserSummary[] = [];
    setUserSummaries((prev) => {
      if (updatedProfile.id === currentUserId) {
        nextSummaries = sortSummaries(prev);
        return prev;
      }
      const mapped: UserSummary = {
        id: updatedProfile.id,
        username: updatedProfile.username,
        levelId: updatedProfile.levelId,
        levelName: updatedProfile.levelName,
        avatarUrl: updatedProfile.avatarUrl,
        priority: updatedProfile.priority ?? null,
      };
      const filtered = prev.filter((item) => item.id !== mapped.id);
      nextSummaries = sortSummaries([...filtered, mapped]);
      return nextSummaries;
    });
    const tooltipSource =
      updatedProfile.id === currentUserId ? sortSummaries(userSummaries) : nextSummaries;
    setTooltipItems(buildTooltipItems(tooltipSource));
    setError(null);
  };

  const effectiveAvatar =
    avatarOverride ??
    (profile?.avatarUrl && profile.avatarUrl.trim().length > 0
      ? profile.avatarUrl
      : DEFAULT_AVATAR);

  const handleTooltipSelect = useCallback(
    (item: AnimatedTooltipItem) => {
      if (item.id === CREATE_MEMBER_ID) {
        if (!canCreateUser) return;
        setCreateDialogOpen(true);
        return;
      }
      const found =
        userSummaries.find((u) => u.id === item.id) ||
        (profile && profile.id === item.id
          ? {
              id: profile.id,
              username: profile.username,
              levelId: profile.levelId,
              levelName: profile.levelName,
              avatarUrl: profile.avatarUrl,
              priority: profile.priority ?? null,
            }
          : null);
      if (!found) return;
      setSelectedUser({
        ...found,
        avatarUrl:
          found.avatarUrl && found.avatarUrl.trim().length > 0
            ? found.avatarUrl
            : item.image ?? DEFAULT_AVATAR,
      });
      setEditDialogOpen(true);
    },
    [userSummaries, profile, currentUserId, canCreateUser],
  );

  const handleEditSubmit = useCallback(
    async ({
      userId,
      username,
      avatarFile,
      levelId,
      removeAvatar,
    }: {
      userId: number;
      username: string;
      avatarFile?: File | null;
      levelId?: number | null;
      removeAvatar?: boolean;
    }) => {
      const formData = new FormData();
      formData.append("username", username);
      if (avatarFile !== undefined && avatarFile !== null) {
        formData.append("avatar", avatarFile);
      }
      if (levelId != null) {
        formData.append("levelId", String(levelId));
      }
      if (removeAvatar) {
        formData.append("removeAvatar", "true");
      }
      const res = await axiosInstance.patch(`/user/${userId}`, formData);
      const { code, data, message } = res.data ?? {};
      if (code !== 200 || !data) {
        throw new Error(message ?? "更新失败");
      }
      const updated = data as ProfileResponse;
      if (updated.id === currentUserId) {
        const isCreator = (updated.priority ?? null) === 0;
        setCanCreateUser(isCreator);
      }
      const mappedSummary: UserSummary = {
        id: updated.id,
        username: updated.username,
        levelId: updated.levelId,
        levelName: updated.levelName,
        avatarUrl: updated.avatarUrl,
        priority: updated.priority ?? null,
      };
      let nextSummaries: UserSummary[] = [];
      setUserSummaries((prev) => {
        if (updated.id === currentUserId) {
          nextSummaries = prev;
          return prev;
        }
        const filtered = prev.filter((item) => item.id !== mappedSummary.id);
        nextSummaries = sortSummaries([...filtered, mappedSummary]);
        return nextSummaries;
      });
      setTooltipItems(buildTooltipItems(nextSummaries));
      if (profile && profile.id === updated.id) {
        setProfile(updated);
        dispatch(setUserProfile({ username: updated.username, avatarUrl: updated.avatarUrl }));
        setAvatarOverride(updated.avatarUrl ?? null);
      }
      setSelectedUser(mappedSummary);
    },
    [dispatch, profile, canCreateUser, currentUserId, buildTooltipItems, sortSummaries],
  );

  const createLevelOptions = useMemo(() => {
    if (levels.length === 0) return [];
    return [...levels]
      .sort((a, b) => {
        const priorityA = a.priority ?? Number.MAX_SAFE_INTEGER;
        const priorityB = b.priority ?? Number.MAX_SAFE_INTEGER;
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        return a.id - b.id;
      })
      .map((level) => ({
        value: level.id,
        label: level.name ?? `Level ${level.id}`,
      }));
  }, [levels]);

  const handleCreateSubmit = useCallback(
    async ({
      username,
      password,
      confirmPassword,
      levelId,
      avatarFile,
    }: {
      username: string;
      password: string;
      confirmPassword: string;
      levelId: number;
      avatarFile?: File | null;
    }) => {
      if (!canCreateUser) {
        throw new Error("当前用户无权限创建新用户");
      }
      if (password !== confirmPassword) {
        throw new Error("两次输入的密码不一致");
      }
      const levelName =
        createLevelOptions.find((option) => option.value === levelId)?.label ??
        levels.find((item) => item.id === levelId)?.name ??
        "";
      if (!levelName || levelName.trim().length === 0) {
        throw new Error("未找到对应的用户等级");
      }
      const trimmedUsername = username.trim();
      const resolvedLevelName = levelName.trim();

      const formData = new FormData();
      formData.append("username", trimmedUsername);
      formData.append("password", password);
      formData.append("levelName", resolvedLevelName);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }
      const registerRes = await axiosInstance.post("/auth/register", formData);
      const { code, data, message } = registerRes.data ?? {};
      if (code !== 200 || !data) {
        throw new Error(message ?? "创建用户失败");
      }
      const created = data as ProfileResponse;
      if (currentUserId) {
        await refreshMembersWithFilters(
          currentUserId,
          0,
          searchTerm.trim(),
          selectedLevelName?.trim() || null,
        );
      } else {
        const mapped: UserSummary = {
          id: created.id,
          username: created.username ?? trimmedUsername,
          levelId: created.levelId,
          levelName: created.levelName ?? resolvedLevelName,
          avatarUrl: created.avatarUrl ?? null,
          priority: created.priority ?? null,
        };
        let nextSummaries: UserSummary[] = [];
        setUserSummaries((prev) => {
          const filtered = prev.filter((item) => item.id !== mapped.id);
          nextSummaries = sortSummaries([...filtered, mapped]);
          return nextSummaries;
        });
        setTooltipItems(buildTooltipItems(nextSummaries));
      }
      setCreateDialogOpen(false);
    },
    [
      createLevelOptions,
      levels,
      canCreateUser,
      buildTooltipItems,
      sortSummaries,
      currentUserId,
      refreshMembersWithFilters,
      searchTerm,
      selectedLevelName,
    ],
  );

  const canEditLevelForUser = useCallback(
    (user: UserSummary | null) => {
      if (!user || user.id === currentUserId) return false;
      if (profile?.priority == null || user.priority == null) return false;
      return profile.priority < user.priority;
    },
    [currentUserId, profile?.priority],
  );

  return (
    <AuroraBackground className="min-h-svh items-stretch justify-start">
      <NavHeroHeader />
      <main className="flex flex-1 items-start justify-center px-4 pt-16 md:pt-24">
        <div className="flex w-full max-w-5xl flex-col gap-8 min-h-[400px] items-start">
          {loading ? (
            <Skeleton className="h-72 w-full max-w-sm rounded-3xl" />
          ) : error ? (
            <div className="w-full max-w-sm rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          ) : profile ? (
            <>
              <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
                <ProfileCard
                  className="w-full"
                  username={profile.username}
                  userId={profile.id}
                  levelId={profile.levelId}
                  levelName={profile.levelName}
                  avatarUrl={effectiveAvatar}
                  coverImageUrl={effectiveAvatar}
                  onSave={handleProfileSave}
                />
                <div className="relative flex h-full min-h-[320px] w-full flex-1 flex-col items-start gap-4 overflow-visible rounded-3xl border border-border/60 bg-background/40 p-6 text-left shadow-lg shadow-black/10 backdrop-blur">
                  <div className="flex w-full flex-wrap items-center gap-3">
                    <div className="flex items-center gap-3">
                      <span className="pointer-events-none text-2xl font-semibold tracking-wide text-gray-900 dark:text-white">
                        成员管理
                      </span>
                      {canCreateUser ? (
                        <AnimatedTooltip
                          items={createButtonItems}
                          onSelect={handleTooltipSelect}
                          className="pointer-events-auto z-0"
                          imageSize={40}
                          tooltipZIndex={30}
                        />
                      ) : null}
                    </div>
                    <AnimatedGlowingSearchBar
                      className="ml-auto flex-shrink-0"
                      value={searchTerm}
                      onValueChange={handleSearchChange}
                      onSubmit={handleSearchSubmit}
                      placeholder="搜索成员..."
                      levelOptions={levels.map((level) => level.name).filter((name): name is string => Boolean(name && name.trim().length > 0))}
                      selectedLevelName={selectedLevelName}
                      onLevelChange={handleLevelChange}
                    />
                  </div>
                  <BorderBeam size={260} duration={12} delay={9} />
                  <div className="relative z-20 flex w-full flex-1 flex-wrap items-start gap-x-4 gap-y-6 pt-2">
                    <AnimatedTooltip
                      items={tooltipItems}
                      onSelect={handleTooltipSelect}
                      className="w-full"
                      tooltipZIndex={60}
                    />
                  </div>
                  <div className="flex w-full flex-col items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {isMembersLoading
                        ? "成员加载中..."
                        : totalCount > 0
                          ? `共 ${totalCount} 人，当前第 ${Math.min(currentPage + 1, totalPages)}/${totalPages} 页`
                          : "暂无成员"}
                    </span>
                    {totalPages > 1 ? (
                      <MorphingPageDots total={totalPages} current={currentPage} onChange={handlePageChange} />
                    ) : null}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </main>
      {selectedUser ? (
        <Dialog01
          disableTrigger
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) {
              setSelectedUser(null);
            }
          }}
          name={selectedUser.username}
          userId={selectedUser.id}
          levelId={selectedUser.levelId}
          levelName={selectedUser.levelName}
          avatarUrl={selectedUser.avatarUrl ?? undefined}
          canEditUsername={selectedUser.id === currentUserId}
          canEditAvatar={selectedUser.id === currentUserId}
          canEditLevel={canEditLevelForUser(selectedUser)}
          levelOptions={levels.map((level) => ({ id: level.id, name: level.name }))}
          onSave={async ({ username, avatarFile, levelId, removeAvatar }) => {
            if (!selectedUser) return;
            await handleEditSubmit({
              userId: selectedUser.id,
              username,
              avatarFile: avatarFile ?? undefined,
              levelId,
              removeAvatar,
            });
          }}
        />
      ) : null}
      {canCreateUser ? (
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="w-full max-w-xl border-none bg-transparent p-0 shadow-none">
            <AuthorFormCard
              levelOptions={createLevelOptions}
              onSubmit={handleCreateSubmit}
              onCancel={() => setCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      ) : null}
    </AuroraBackground>
  );
}
