"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPublicProfile } from "@/lib/actions/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  ArrowLeft,
  Image as ImageIcon,
  Video,
  FileTextIcon,
} from "lucide-react";
import { TaskCard } from "@/components/feed/TaskCard";
import { getDirectMediaUrl } from "@/lib/utils/media";
import { useSession } from "next-auth/react";

// Komponen bantu untuk memicu scroll otomatis saat dirender
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

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const { data: session } = useSession();
  const sessionUserId = (session?.user as any)?.id;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);

  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number | null>(
    null,
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) return;

    getPublicProfile(userId).then((res) => {
      if (res.success && res.data) {
        setProfile(res.data.user);
        setTasks(res.data.tasks);
      }
      setLoading(false);
    });
  }, [userId]);

  if (loading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col h-[100dvh] items-center justify-center bg-slate-50 px-4 text-center">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
          <span className="text-2xl">😕</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">
          User Tidak Ditemukan
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Profil yang Anda cari mungkin telah dihapus atau ID tidak valid.
        </p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-slate-900 text-white font-bold rounded-full text-sm"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 pb-20 relative">
      {/* Header Back Button */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 h-14 flex items-center px-4">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="flex-1 text-center font-bold text-slate-900 mr-8 truncate">
          Profil @{profile.username || profile.name.split(" ")[0].toLowerCase()}
        </h1>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden mb-6">
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-blue-50 to-white" />

          <div className="relative flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg mb-4">
              <AvatarImage
                src={
                  profile.image ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}`
                }
              />
              <AvatarFallback>{profile.name?.substring(0, 2)}</AvatarFallback>
            </Avatar>

            <h2 className="text-xl font-black text-slate-900">
              {profile.name}
            </h2>
            <p className="text-sm text-slate-500 font-medium mb-1">
              @
              {profile.username ||
                profile.name.replace(/\s/g, "").toLowerCase()}
            </p>

            <div className="inline-flex items-center justify-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold capitalize mt-2 mb-4">
              {profile.role}
            </div>

            {profile.bio && (
              <p className="text-sm text-slate-600 mt-2 px-4 leading-relaxed">
                {profile.bio}
              </p>
            )}

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="w-full mt-6 text-left">
                <h3 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">
                  Keahlian
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {profile.skills.map((skill: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-slate-50 rounded-xl p-3 border border-slate-100"
                    >
                      <div className="flex justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-slate-700 truncate">
                          {skill.name}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {skill.percentage}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${skill.percentage >= 90 ? "bg-blue-500" : skill.percentage >= 70 ? "bg-green-500" : "bg-amber-300"} rounded-full`}
                          style={{ width: `${skill.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tasks Grid */}
        <h3 className="text-sm font-black text-slate-900 mb-4 px-2">
          Portofolio & Tugas ({tasks.length})
        </h3>

        {tasks.length > 0 ? (
          <div className="grid grid-cols-3 gap-1">
            {tasks.map((task, index) => (
              <div
                key={task._id}
                className="aspect-square relative group cursor-pointer overflow-hidden bg-slate-100"
                onClick={() => setSelectedTaskIndex(index)}
              >
                {task.mediaType === "image" ? (
                  <img
                    src={getDirectMediaUrl(task.mediaUrl, "image")}
                    alt={task.caption || "Task"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : task.mediaType === "video" ? (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    <Video className="w-8 h-8 text-white/50" />
                  </div>
                ) : (
                  <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                    <FileTextIcon className="w-8 h-8 text-blue-300" />
                  </div>
                )}
                {task.status === "rejected" && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 bg-black/10">
                    <div className="bg-red-600 text-white font-black text-[10px] sm:text-xs tracking-widest px-30 py-0.5 uppercase rotate-[-35deg] shadow-lg rounded-sm">
                      REJECTED
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 bg-white rounded-3xl border border-slate-100 border-dashed">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <ImageIcon className="w-5 h-5 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-400">
              Belum ada postingan.
            </p>
          </div>
        )}
      </div>

      {/* Detail Post Overlay */}
      {selectedTaskIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col">
          <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 h-14 flex items-center px-4">
            <button
              onClick={() => setSelectedTaskIndex(null)}
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="flex-1 text-center font-bold text-slate-900 mr-8">
              Postingan
            </h1>
          </div>
          <div className="flex-1 overflow-y-auto w-full px-4">
            <div className="max-w-md mx-auto w-full pb-20 pt-4">
              {tasks.map((task, index) => {
                const serializedTask = {
                  id: task._id.toString(),
                  caption: task.caption,
                  mediaUrl: task.mediaUrl,
                  mediaUrls: task.mediaUrls || [task.mediaUrl],
                  mediaType: task.mediaType || "image",
                  likesCount: task.likes ? task.likes.length : 0,
                  createdAt: task.createdAt,
                  timeAgo: new Date(task.createdAt).toLocaleDateString("id-ID"),
                  author: {
                    id: task.authorId?._id?.toString(),
                    name: task.authorId?.name || "Unknown",
                    image: task.authorId?.image || "",
                    username: task.authorId?.username,
                  },
                  project: task.projectId
                    ? {
                        id: task.projectId._id?.toString(),
                        title: task.projectId.title,
                      }
                    : undefined,
                  projectTitle: task.projectId?.title || "Unknown Project",
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
                  commentsCount: 0, // Fallback since we don't fetch counts in user profile
                };

                return (
                  <div
                    key={task._id}
                    ref={index === selectedTaskIndex ? scrollRef : null}
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
      {selectedTaskIndex !== null && <AutoScroll refNode={scrollRef} />}
    </div>
  );
}
