'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  PopoverFooter,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { User, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppSelector, useAppDispatch } from '@/lib/store';
import { logoutThunk } from '@/lib/store';
import { useOptionalSidebar } from '@/components/ui/sidebar';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

type UserProfileDemoProps = {
  variant?: "sidebar" | "nav";
};

export default function UserProfileDemo({ variant = "sidebar" }: UserProfileDemoProps) {
  const { user } = useAppSelector(s => s.auth);
  const dispatch = useAppDispatch();
  const username = user?.username || 'User';
  const avatarUrl = user?.avatarUrl && user.avatarUrl.trim().length > 0
    ? user.avatarUrl
    : undefined;
  const sidebarContext = useOptionalSidebar();
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const lockAppliedRef = React.useRef(false);
  const router = useRouter();
  const isSidebarVariant = variant === "sidebar";
  const sidebarOpen = isSidebarVariant ? (sidebarContext?.open ?? false) : false;
  const setLockOpen = isSidebarVariant ? sidebarContext?.setLockOpen : undefined;

  const handleSignOut = React.useCallback(async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
    } catch (err) {
      console.error("failed to sign out", err);
    } finally {
      setPopoverOpen(false);
      router.push("/sign-in");
    }
  }, [dispatch, router, setPopoverOpen]);

  React.useEffect(() => {
    if (!isSidebarVariant || !setLockOpen) {
      return;
    }
    if (popoverOpen) {
      setLockOpen(true);
      lockAppliedRef.current = true;
    } else if (lockAppliedRef.current) {
      setLockOpen(false);
      lockAppliedRef.current = false;
    }
    return () => {
      if (lockAppliedRef.current) {
        setLockOpen(false);
        lockAppliedRef.current = false;
      }
    };
  }, [popoverOpen, setLockOpen, isSidebarVariant]);

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            isSidebarVariant
              ? "h-[30px] w-full rounded-full p-0 flex items-center justify-start transition-all duration-200"
              : "h-9 w-9 rounded-full p-0 flex items-center justify-center transition-all duration-200",
            isSidebarVariant
              ? (sidebarOpen ? "gap-2 pl-0 pr-3" : "gap-0 pl-0 pr-0")
              : ""
          )}
        >
          <Avatar
            className={cn(
            "flex-shrink-0",
            isSidebarVariant ? "h-[30px] w-[30px]" : "h-9 w-9"
          )}
          >
            {avatarUrl ? <AvatarImage src={avatarUrl} /> : null}
            <AvatarFallback>{username.slice(0,2).toUpperCase()}</AvatarFallback>
          </Avatar>
          {isSidebarVariant && (
            <motion.span
              initial={false}
              animate={{
                opacity: sidebarOpen ? 1 : 0,
                maxWidth: sidebarOpen ? 120 : 0,
              }}
              transition={{ duration: 0.2 }}
              className="text-sm font-medium text-neutral-700 dark:text-neutral-200 overflow-hidden whitespace-nowrap"
            >
              {username}
            </motion.span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-62' align={isSidebarVariant ? "center" : "end"}>
        <PopoverHeader>
          <div className="flex items-center space-x-3">
            <Avatar className={cn(isSidebarVariant ? "h-12 w-12" : "h-10 w-10")}>
              {avatarUrl ? <AvatarImage src={avatarUrl} /> : null}
              <AvatarFallback>{username.slice(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <PopoverTitle>{username}</PopoverTitle>
              <PopoverDescription className='text-xs'>欢迎回来</PopoverDescription>
            </div>
          </div>
        </PopoverHeader>
        <PopoverBody className="space-y-1 px-2 py-1">
          <Button
            variant="ghost"
            className="w-full justify-start"
            size="sm"
            onClick={() => {
              setPopoverOpen(false);
              router.push('/profile');
            }}
          >
            <User className="mr-2 h-4 w-4" />
            查看资料
          </Button>
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            设置
          </Button>
        </PopoverBody>
        <PopoverFooter>
          <Button variant="outline" className="w-full bg-transparent" size="sm" onClick={handleSignOut}>
            退出登录
          </Button>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
}
