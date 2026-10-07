"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getUnreadCount } from "@/lib/actions/notification";
import { useSession } from "next-auth/react";

export default function NotificationBell({ desktop = false, isActive = false }: { desktop?: boolean, isActive?: boolean }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      getUnreadCount().then(setUnreadCount);
      const interval = setInterval(() => {
        getUnreadCount().then(setUnreadCount);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const userRole = (session?.user as any)?.role || "member";
  const targetTab = userRole === "mentor" || userRole === "admin" ? "tasks" : "reviews";

  if (desktop) {
    return (
      <Link
        href={`/notifications?tab=${targetTab}`}
        className={`flex flex-col items-center justify-center h-14 min-w-[60px] border-b-2 transition-colors ${
          isActive 
            ? "border-slate-900 text-slate-900" 
            : "border-transparent text-slate-500 hover:text-slate-900"
        }`}
      >
        <div className="relative mb-1">
          <Bell className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-2 flex items-center justify-center h-4 w-4 text-[9px] pt-0.5 font-bold text-white rounded-full bg-red-500 border-2 border-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
        <span className="text-[10px] hidden lg:block font-medium">Notifications</span>
      </Link>
    );
  }

  return (
    <Link
      href={`/notifications?tab=${targetTab}`}
      className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors md:hidden"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 flex items-center justify-center h-4 w-4 text-[9px] pt-0.5 font-bold text-white rounded-full bg-red-500 border-2 border-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
