"use client";

import { useEffect, useState } from "react";
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead 
} from "@/lib/actions/notification";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  CheckCheck, 
  MessageSquare, 
  CheckCircle, 
  Info,
  Loader2,
  ChevronLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const router = useRouter();

  const fetchNotifications = async (type: string) => {
    setLoading(true);
    const res = await getNotifications(type);
    if (res.success) {
      setNotifications(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications(activeTab);
  }, [activeTab]);

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    fetchNotifications(activeTab);
  };

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      await markAsRead(notif._id);
    }
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const getIcon = (type: string, isRead: boolean) => {
    const className = `w-5 h-5 ${isRead ? 'text-slate-400' : 'text-blue-500'}`;
    switch (type) {
      case "task": return <CheckCircle className={className} />;
      case "review": return <MessageSquare className={className} />;
      case "system": return <Info className={className} />;
      default: return <Bell className={className} />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return "Baru saja";
    if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="pt-6 pb-24 bg-slate-50 min-h-screen">
      <div className="px-4 mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="mr-3 p-2 -ml-2 rounded-full hover:bg-slate-200 text-slate-700 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notifikasi</h1>
        </div>
        <button 
          onClick={handleMarkAllRead}
          className="p-2 rounded-full hover:bg-blue-50 text-blue-600 transition-colors"
          title="Tandai semua dibaca"
        >
          <CheckCheck className="w-5 h-5" />
        </button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-between h-14 bg-white rounded-none border-b border-slate-200 px-4 shadow-sm sticky top-0 z-10">
          <TabsTrigger value="all" className="flex-1 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none h-full transition-all text-slate-500 font-bold">
            Semua
          </TabsTrigger>
          <TabsTrigger value="task" className="flex-1 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none h-full transition-all text-slate-500 font-bold">
            Tasks
          </TabsTrigger>
          <TabsTrigger value="review" className="flex-1 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none h-full transition-all text-slate-500 font-bold">
            Reviews
          </TabsTrigger>
          <TabsTrigger value="system" className="flex-1 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none h-full transition-all text-slate-500 font-bold">
            Sistem
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-2">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-900">Belum ada notifikasi</p>
              <p className="text-xs text-slate-500 mt-1">Anda sudah melihat semuanya.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notif) => (
                <div 
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`flex gap-4 p-4 cursor-pointer transition-colors hover:bg-slate-100 ${notif.isRead ? 'bg-white opacity-70' : 'bg-blue-50/30'}`}
                >
                  <div className="flex-shrink-0 relative">
                    {notif.senderId?.image ? (
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={notif.senderId.image} />
                        <AvatarFallback>{notif.senderId.name.substring(0,2)}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center">
                        {getIcon(notif.type, notif.isRead)}
                      </div>
                    )}
                    {!notif.isRead && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 font-medium">
                      {notif.senderId && <span className="font-bold">{notif.senderId.name} </span>}
                      {notif.title}
                    </p>
                    <p className={`text-xs mt-0.5 line-clamp-2 ${notif.isRead ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>
                      {notif.message}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                      {formatTime(notif.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}
