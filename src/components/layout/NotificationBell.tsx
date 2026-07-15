"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getUnreadCount } from "@/lib/actions/notification";
import { useSession } from "next-auth/react";

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      // Ambil count saat pertama kali dimuat
      getUnreadCount().then(setUnreadCount);

      // Polling setiap 30 detik untuk pembaruan realtime-ish
      const interval = setInterval(() => {
        getUnreadCount().then(setUnreadCount);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [session]);

  return (
    <Link href="/notifications" className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors">
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 flex items-center justify-center h-4 w-4 text-[9px] font-bold text-white rounded-full bg-red-500 border-2 border-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
