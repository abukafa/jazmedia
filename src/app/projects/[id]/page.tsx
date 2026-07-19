"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProjectById } from "@/lib/actions/project";
import { 
  Loader2, 
  ArrowLeft, 
  Users, 
  Clock, 
  CheckCircle2,
  Video,
  FileTextIcon,
  Play
} from "lucide-react";
import { getDirectMediaUrl } from "@/lib/utils/media";
import { TaskCard } from "@/components/feed/TaskCard";

// Helper component for auto-scrolling
function AutoScroll({ refNode }: { refNode: React.RefObject<HTMLDivElement | null> }) {
  useEffect(() => {
    if (refNode.current) {
      refNode.current.scrollIntoView({ behavior: "instant", block: "start" });
    }
  }, [refNode]);
  return null;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const router = useRouter();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!projectId) return;

    const fetchProject = async () => {
      setLoading(true);
      const res = await getProjectById(projectId);
      if (res.success && res.data) {
        setProject(res.data);
      }
      setLoading(false);
    };

    fetchProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Proyek Tidak Ditemukan</h2>
        <p className="text-slate-500 text-sm mb-6">Proyek mungkin telah dihapus atau ID tidak valid.</p>
        <button 
          onClick={() => router.back()}
          className="px-6 py-2 bg-slate-900 text-white rounded-full font-bold text-sm"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="pb-10 bg-slate-50 min-h-screen">
      {/* Navbar Minimalis */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 h-14 flex items-center px-4">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="flex-1 text-center font-bold text-slate-900 mr-8 truncate px-4">
          Detail Proyek
        </h1>
      </div>

      {/* Profile/Header Proyek */}
      <div className="px-4 pt-6 pb-6 bg-white border-b border-slate-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 leading-tight">
              {project.title}
            </h1>
            <p className="text-sm text-slate-500 mt-2 flex items-center">
              <Users className="w-4 h-4 mr-2" /> Mentor:{" "}
              <strong className="ml-1 text-slate-700">{project.mentorName}</strong>
            </p>
            <div className="mt-2 flex items-center text-xs font-bold text-slate-500">
              <Clock className="w-4 h-4 mr-2" /> Dimulai:{" "}
              <span className="ml-1 text-slate-700">
                {new Date(project.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </span>
            </div>
          </div>
          <span
            className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shrink-0 shadow-sm ${project.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
          >
            {project.status}
          </span>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Deskripsi Proyek</h3>
          <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {project.description}
          </p>
        </div>
      </div>

      {/* Grid Galeri Tugas */}
      <div className="mt-6">
        <h3 className="text-sm font-black text-slate-900 mb-4 px-4 flex items-center">
          <CheckCircle2 className="w-4 h-4 mr-2 text-blue-600" />
          Galeri Tugas ({project.tasks?.length || 0})
        </h3>
        
        {project.tasks?.length > 0 ? (
          <div className="grid grid-cols-3 gap-1">
            {project.tasks.map((task: any, index: number) => (
              <div 
                key={task._id} 
                className="aspect-square relative group cursor-pointer overflow-hidden bg-slate-200 flex items-center justify-center"
                onClick={() => setSelectedTaskIndex(index)}
              >
                {task.mediaType === "image" ? (
                  <img
                    src={getDirectMediaUrl(task.mediaUrl, "image")}
                    alt={task.caption || "Task"}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : task.mediaType === "video" ? (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                    <Play className="w-8 h-8 text-white/50 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                ) : (
                  <div className="w-full h-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <FileTextIcon className="w-8 h-8 text-blue-300 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                )}
                
                {/* Overlay Indikator Status */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                <div className="absolute top-1 right-1">
                  {task.status === "approved" && <div className="w-2.5 h-2.5 bg-green-500 rounded-full border border-white shadow-sm" />}
                  {task.status === "reviewed" && <div className="w-2.5 h-2.5 bg-amber-500 rounded-full border border-white shadow-sm" />}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
              <FileTextIcon className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-700">Belum Ada Karya</p>
            <p className="text-xs text-slate-500 mt-1">Anggota proyek ini belum mengumpulkan tugas.</p>
          </div>
        )}
      </div>

      {/* Overlay Task Viewer */}
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
              Karya
            </h1>
          </div>
          <div className="flex-1 overflow-y-auto w-full px-4 scrollbar-hide">
            <div className="max-w-md mx-auto w-full pb-20 pt-4">
              {project.tasks.map((task: any, index: number) => {
                // Serialize format untuk TaskCard
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
                  project: {
                    id: project.id,
                    title: project.title,
                  },
                  projectTitle: project.title,
                  review: task.review ? {
                    grade: task.review.grade,
                    comment: task.review.comment,
                    mentorName: task.review.mentorId?.name || "Mentor",
                  } : undefined
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

      {/* Auto-scroll helper */}
      {selectedTaskIndex !== null && <AutoScroll refNode={scrollRef} />}
    </div>
  );
}
