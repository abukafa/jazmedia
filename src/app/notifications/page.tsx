"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getPendingTaskNotifications,
  getReviewedTaskNotifications,
  getSystemReminders,
} from "@/lib/actions/notification";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, ChevronLeft, Star, Loader2, AlertCircle, Download } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TaskCard } from "@/components/feed/TaskCard";
import Link from "next/link";
import { useSession } from "next-auth/react";

function AutoScroll({
  refNode,
}: {
  refNode: React.RefObject<HTMLDivElement | null>;
}) {
  useEffect(() => {
    if (refNode.current) {
      refNode.current.scrollIntoView({ behavior: "instant", block: "start" });
    }
  }, [refNode]);
  return null;
}

function NotificationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "tasks";
  const { data: session } = useSession();
  const sessionUserId = (session?.user as any)?.id;

  const [activeTab, setActiveTab] = useState(defaultTab);

  const [overlayData, setOverlayData] = useState<{
    type: "tasks" | "reviews";
    activeIndex: number;
  } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const [isPwaInstallable, setIsPwaInstallable] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).deferredPWAPrompt) {
      setIsPwaInstallable(true);
    }
    const handleInstallable = () => setIsPwaInstallable(true);
    window.addEventListener("pwaInstallable", handleInstallable);
    return () => window.removeEventListener("pwaInstallable", handleInstallable);
  }, []);

  const handleInstallPWA = async () => {
    const deferredPrompt = (window as any).deferredPWAPrompt;
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsPwaInstallable(false);
      (window as any).deferredPWAPrompt = null;
    }
  };

  const { data: pendingTasks = [], isFetching: loadingTasks } = useQuery({
    queryKey: ["notifications", "tasks"],
    queryFn: async () => {
      const res = await getPendingTaskNotifications();
      return res.success ? res.data : [];
    },
  });

  const { data: reviewedTasks = [], isFetching: loadingReviews } = useQuery({
    queryKey: ["notifications", "reviews"],
    queryFn: async () => {
      const res = await getReviewedTaskNotifications();
      return res.success ? res.data : [];
    },
  });

  const { data: systemReminders = [], isFetching: loadingSystem } = useQuery({
    queryKey: ["notifications", "system"],
    queryFn: async () => {
      const res = await getSystemReminders();
      return res.success ? res.data : [];
    },
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return "Baru saja";
    if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  const currentOverlayTasks =
    overlayData?.type === "tasks" ? pendingTasks : reviewedTasks;

  return (
    <div className="pt-6 pb-24 bg-slate-50 min-h-screen relative">
      <div className="px-4 mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-3 p-2 -ml-2 rounded-full hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Notifikasi
          </h1>
        </div>
      </div>

      <Tabs
        defaultValue="tasks"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full justify-between h-14 bg-white rounded-none border-b border-slate-200 px-4 shadow-sm sticky top-0 z-10">
          <TabsTrigger
            value="tasks"
            className="flex-1 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none h-full transition-all text-slate-500 font-bold"
          >
            Tasks {pendingTasks.length > 0 && `(${pendingTasks.length})`}
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="flex-1 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none h-full transition-all text-slate-500 font-bold"
          >
            Reviews {reviewedTasks.length > 0 && `(${reviewedTasks.length})`}
          </TabsTrigger>
          <TabsTrigger
            value="system"
            className="flex-1 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none h-full transition-all text-slate-500 font-bold relative"
          >
            Sistem
            {(systemReminders.length > 0 || isPwaInstallable) && (
              <div className="absolute top-2 right-3 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </TabsTrigger>
        </TabsList>

        {/* TASKS TAB */}
        <TabsContent value="tasks" className="mt-0">
          {loadingTasks ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : pendingTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-900">
                Belum ada tugas baru
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingTasks.map((task: any, index: number) => (
                <div
                  key={task._id}
                  onClick={() =>
                    setOverlayData({ type: "tasks", activeIndex: index })
                  }
                  className="flex gap-4 p-4 cursor-pointer transition-colors bg-white hover:bg-slate-50"
                >
                  <Avatar className="w-12 h-12 flex-shrink-0">
                    <AvatarImage src={task.authorId?.image} />
                    <AvatarFallback>
                      {task.authorId?.name?.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 font-medium line-clamp-1">
                      <span className="font-bold">{task.authorId?.name}</span>
                      {task.collaborators?.length > 0 &&
                        ` & ${task.collaborators.length} lainnya`}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                      Tugas baru di project:{" "}
                      <span className="font-bold">{task.projectId?.title}</span>
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
                      {formatTime(task.createdAt)}
                    </p>
                  </div>

                  <div className="flex-shrink-0 flex items-center justify-center">
                    <Star
                      className="w-6 h-6 text-slate-300"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* REVIEWS TAB */}
        <TabsContent value="reviews" className="mt-0">
          {loadingReviews ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : reviewedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-900">
                Belum ada tugas direview
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {reviewedTasks.map((task: any, index: number) => (
                <div
                  key={task._id}
                  onClick={() =>
                    setOverlayData({ type: "reviews", activeIndex: index })
                  }
                  className="flex gap-4 p-4 cursor-pointer transition-colors bg-white hover:bg-slate-50"
                >
                  <Avatar className="w-12 h-12 flex-shrink-0">
                    <AvatarImage src={task.authorId?.image} />
                    <AvatarFallback>
                      {task.authorId?.name?.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 font-medium line-clamp-1">
                      <span className="font-bold">{task.authorId?.name}</span>
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                      {task.status === "rejected" ? "Ditolak oleh:" : "Direview oleh:"}{" "}
                      <span className="font-bold">
                        {task.review?.mentorId?.name}
                      </span>
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
                      {task.review?.reviewedAt
                        ? formatTime(task.review.reviewedAt)
                        : formatTime(task.updatedAt)}
                    </p>
                  </div>

                  <div className="flex-shrink-0 flex flex-col items-center justify-center">
                    {task.status === "rejected" ? (
                      <div className="flex items-center text-red-500">
                        <AlertCircle className="w-5 h-5 fill-red-100" />
                      </div>
                    ) : (
                      <div className="flex items-center text-amber-500">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="font-black text-sm ml-1">
                          {task.review?.grade}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* SYSTEM TAB */}
        <TabsContent value="system" className="mt-0">
          {loadingSystem ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : systemReminders.length === 0 && !isPwaInstallable ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-900">
                Sistem berjalan optimal
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Tidak ada reminder saat ini.
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {isPwaInstallable && (
                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-blue-700">
                        Install Jazmedia
                      </h4>
                      <p className="text-xs text-blue-600 mt-0.5">
                        Dapatkan pengalaman aplikasi yang lebih cepat & ringan!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleInstallPWA}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shrink-0 whitespace-nowrap"
                  >
                    Install App
                  </button>
                </div>
              )}

              {systemReminders.map((reminder: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-red-50/50 border border-red-100 p-4 rounded-2xl flex gap-3"
                >
                  <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-red-700 capitalize">
                      {reminder.type.replace("_", " ")}
                    </h4>
                    <p className="text-xs text-red-600 mt-1">
                      {reminder.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* OVERLAY VIEWER */}
      {overlayData !== null && (
        <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col">
          <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 h-14 flex items-center px-4">
            <button
              onClick={() => setOverlayData(null)}
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="flex-1 text-center font-bold text-slate-900 mr-8 capitalize">
              {overlayData.type === "tasks" ? "Tugas Baru" : "Hasil Review"}
            </h1>
          </div>

          <div className="flex-1 overflow-y-auto w-full px-4 scrollbar-hide pb-20 pt-4">
            <div className="max-w-md mx-auto w-full">
              {currentOverlayTasks.map((task: any, index: number) => {
                const serializedTask = {
                  id: task._id.toString(),
                  caption: task.caption,
                  mediaUrl: task.mediaUrl,
                  mediaUrls: task.mediaUrls || [task.mediaUrl],
                  mediaType: task.mediaType || "image",
                  likesCount: task.likes ? task.likes.length : 0,
                  createdAt: task.createdAt,
                  timeAgo: formatTime(task.createdAt),
                  author: {
                    id: task.authorId?._id?.toString(),
                    name: task.authorId?.name || "Unknown",
                    image: task.authorId?.image || "",
                    username: task.authorId?.username,
                  },
                  project: task.projectId
                    ? {
                        id: task.projectId._id.toString(),
                        title: task.projectId.title,
                        managerId: task.projectId.projectManagerId?.toString(),
                      }
                    : undefined,
                  projectTitle: task.projectId?.title || "",
                  review: task.review
                    ? {
                        grade: task.review.grade,
                        comment: task.review.comment,
                        mentorName: task.review.mentorId?.name || "Mentor",
                      }
                    : undefined,
                  status: task.status,
                  collaborators: task.collaborators || [],
                  isLikedByMe: sessionUserId
                    ? task.likes?.some((id: string) => id === sessionUserId)
                    : false,
                  commentsCount: 0,
                };

                return (
                  <div
                    key={task._id}
                    ref={index === overlayData.activeIndex ? scrollRef : null}
                    className="mb-6"
                  >
                    <TaskCard {...serializedTask} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Auto-scroll effect */}
      {overlayData !== null && <AutoScroll refNode={scrollRef} />}
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <NotificationsContent />
    </Suspense>
  );
}
