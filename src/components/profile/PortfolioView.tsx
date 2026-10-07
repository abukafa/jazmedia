import React, { useState, useRef, useEffect } from "react";
import FeedLayout from "@/components/layout/FeedLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Briefcase,
  MapPin,
  Award,
  Video,
  FileText as FileTextIcon,
  Image as ImageIcon,
  ArrowLeft,
  CheckCircle2,
  Mail,
  Phone,
  Globe,
} from "lucide-react";
import { TaskCard } from "@/components/feed/TaskCard";
import { getDirectMediaUrl } from "@/lib/utils/media";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

const AutoScroll = ({
  refNode,
}: {
  refNode: React.RefObject<HTMLDivElement | null>;
}) => {
  useEffect(() => {
    if (refNode.current) {
      refNode.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [refNode]);
  return null;
};

export default function PortfolioView({
  loading,
  profile,
  tasks,
  sessionUserId,
}: {
  loading: boolean;
  profile: any;
  tasks: any[];
  sessionUserId?: string;
}) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number | null>(
    null,
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  if (loading) {
    return (
      <FeedLayout hideLeft={true} hideRight={true}>
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4" />
          <p className="font-bold">Memuat Portofolio...</p>
        </div>
      </FeedLayout>
    );
  }

  if (!profile) {
    return (
      <FeedLayout hideLeft={true} hideRight={true}>
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <p className="font-bold">Profil tidak ditemukan.</p>
        </div>
      </FeedLayout>
    );
  }

  const parsedSkills = (() => {
    const raw = profile.skills;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed)
          ? parsed
          : raw
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean);
      } catch {
        return raw
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
      }
    }
    return [];
  })();

  const chartData = parsedSkills.map((skill: any, idx: number) => ({
    name: typeof skill === "string" ? skill : skill?.name || "Skill",
    value:
      typeof skill === "object" && typeof skill?.percentage === "number"
        ? skill.percentage
        : 100,
    color: COLORS[idx % COLORS.length],
  }));

  const projectsTimeline = Array.from(
    new Map(
      tasks
        .filter((t) => t.projectId || t.projectTitle)
        .map((t) => {
          const id =
            typeof t.projectId === "object"
              ? t.projectId._id?.toString()
              : t.projectId || t.projectTitle;
          const title =
            t.projectTitle ||
            (typeof t.projectId === "object" ? t.projectId.title : "Proyek");
          return [
            id,
            {
              id,
              title,
              status: "Active",
              tasks: tasks.filter((task) => {
                const taskId =
                  typeof task.projectId === "object"
                    ? task.projectId._id?.toString()
                    : task.projectId || task.projectTitle;
                return taskId === id;
              }),
            },
          ];
        }),
    ).values(),
  )
    .map((p: any) => {
      const dates = p.tasks.map((t: any) => new Date(t.createdAt).getTime());
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      return {
        ...p,
        startDate: minDate,
        endDate: maxDate,
        taskCount: p.tasks.length,
      };
    })
    .sort((a, b) => b.endDate.getTime() - a.endDate.getTime());

  const displayedTasks = selectedProjectId
    ? tasks.filter((t) => {
        const id =
          typeof t.projectId === "object"
            ? t.projectId._id?.toString()
            : t.projectId || t.projectTitle;
        return id === selectedProjectId;
      })
    : tasks;

  const rightSidebarContent = (
    <div className="space-y-4">
      {/* Keahlian Card - Doughnut Chart */}
      <div className="bg-white md:rounded-3xl p-5 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-2 text-base">Skills</h3>
        {chartData.length > 0 ? (
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value}%`, name]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  }}
                  itemStyle={{ color: "#1e293b", fontWeight: "bold" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Belum ada keahlian.</p>
        )}
      </div>

      {/* Pendidikan (Education) */}
      {profile.education && profile.education.length > 0 && (
        <div className="bg-white md:rounded-3xl p-5 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-4">Education</h3>
          <div className="relative border-l-2 border-slate-100 ml-3 space-y-4 pb-2">
            {profile.education.map((edu: any, idx: number) => (
              <div key={idx} className="relative pl-5">
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 bg-white border-4 border-slate-300 rounded-full" />
                <h4 className="text-sm font-bold leading-tight text-slate-900">
                  {edu.school}
                </h4>
                <div className="text-xs text-slate-600 font-medium mt-0.5">
                  {edu.major} {edu.degree && `• ${edu.degree}`}
                </div>
                <div className="text-[11px] text-slate-400 font-bold mt-1">
                  {edu.year}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proyek (Experience) - Interactive Timeline */}
      <div className="bg-white md:rounded-3xl p-5 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base mb-4">Projects</h3>
        {projectsTimeline.length > 0 ? (
          <div className="relative border-l-2 border-slate-100 ml-3 space-y-6 pb-2">
            {projectsTimeline.map((p: any) => {
              const isSelected = selectedProjectId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProjectId(isSelected ? null : p.id)}
                  className={`relative pl-5 cursor-pointer group transition-all duration-300 ${selectedProjectId && !isSelected ? "opacity-40 hover:opacity-70" : "opacity-100"}`}
                >
                  <div
                    className={`absolute -left-[9px] top-1.5 w-4 h-4 bg-white border-4 rounded-full transition-colors ${isSelected ? "border-blue-600" : "border-slate-300 group-hover:border-blue-400"}`}
                  />

                  <h4
                    className={`text-sm font-bold leading-tight transition-colors ${isSelected ? "text-blue-700" : "text-slate-900 group-hover:text-blue-600"}`}
                  >
                    {p.title}
                  </h4>
                  <div className="text-[11px] text-slate-500 my-1 font-medium flex items-center gap-1">
                    <span>
                      {p.startDate.toLocaleDateString("id-ID", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span>-</span>
                    <span>
                      {p.endDate.toLocaleDateString("id-ID", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 rounded text-[10px] font-bold text-slate-500 border border-slate-100 mt-1">
                    <Briefcase className="w-3 h-3" />
                    <span>{p.taskCount} tasks</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Belum tergabung di proyek.</p>
        )}
      </div>
    </div>
  );

  return (
    <FeedLayout hideLeft={true} rightSidebar={rightSidebarContent}>
      <div className="space-y-4">
        {/* Profile Hero Card */}
        <div className="bg-white md:rounded-3xl border-y md:border-x border-slate-100 shadow-sm relative md:overflow-hidden">
          {/* Cover Photo Area */}
          <div className="h-32 sm:h-48 relative overflow-hidden bg-slate-200">
            {profile.banner_image ? (
              <img
                src={profile.banner_image}
                className="w-full h-full object-cover"
                alt="Banner"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-16 blur-2xl" />
                <div className="absolute bottom-0 left-10 w-40 h-40 bg-black/10 rounded-full translate-y-20 blur-xl" />
              </div>
            )}
          </div>

          <div className="px-6 pb-6 relative">
            <div className="flex justify-between items-end -mt-12 sm:-mt-16 mb-4">
              <div className="relative inline-block">
                <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-white shadow-md bg-white">
                  <AvatarImage src={profile.image || `/no-photo.png`} />
                  <AvatarFallback className="text-2xl">
                    {profile.name?.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-white ring-[2px] ring-offset-1 ring-offset-white shadow-sm ${profile.role === "student" ? "bg-blue-100" : "bg-rose-100"}`}
                >
                  <CheckCircle2
                    className={`w-6 h-6 ${profile.role === "student" ? "fill-blue-500" : "fill-rose-500"} text-white`}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">
                    {profile.name}
                  </h2>
                  {profile.role && (
                    <span
                      className={`text-[8px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        profile.role === "student"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {profile.role === "student" ? "Student" : "Mentor"}
                    </span>
                  )}
                </div>

                {profile.headline && (
                  <p className="text-[15px] font-bold text-slate-700 mt-1 mb-2 leading-snug">
                    {profile.headline}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 mb-3 mt-3">
                  <span className="text-blue-600 font-bold hover:underline cursor-pointer">
                    @
                    {profile.username ||
                      profile.name.replace(/\s/g, "").toLowerCase()}
                  </span>
                  {profile.address_detail && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-slate-400" />{" "}
                      {profile.address_detail}
                    </span>
                  )}
                  {profile.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <a
                        href={`mailto:${profile.email}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {profile.email}
                      </a>
                    </span>
                  )}
                  {profile.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <a
                        href={`tel:${profile.phone}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {profile.phone}
                      </a>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {profile.instagramId && (
                    <a
                      href={`https://instagram.com/${
                        profile.instagramId.match(/^[0-9]+$/)
                          ? profile.username ||
                            profile.name.replace(/\s/g, "").toLowerCase()
                          : profile.instagramId.replace("@", "")
                      }`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-100 text-pink-600 hover:bg-pink-200 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-instagram"
                      >
                        <rect
                          width="20"
                          height="20"
                          x="2"
                          y="2"
                          rx="5"
                          ry="5"
                        />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                      </svg>
                    </a>
                  )}
                  {profile.linkedin && (
                    <a
                      href={
                        profile.linkedin.startsWith("http")
                          ? profile.linkedin
                          : `https://${profile.linkedin}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-linkedin"
                      >
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                        <rect width="4" height="12" x="2" y="9" />
                        <circle cx="4" cy="4" r="2" />
                      </svg>
                    </a>
                  )}
                  {profile.github && (
                    <a
                      href={
                        profile.github.startsWith("http")
                          ? profile.github
                          : `https://${profile.github}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-github"
                      >
                        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                        <path d="M9 18c-4.51 2-5-2-7-2" />
                      </svg>
                    </a>
                  )}
                  {profile.website && (
                    <a
                      href={
                        profile.website.startsWith("http")
                          ? profile.website
                          : `https://${profile.website}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          {profile.bio && (
            <>
              <hr className="border-slate-100" />
              <div className="px-6 py-6">
                <h3 className="font-bold text-slate-900 mb-3 text-lg">
                  About Me
                </h3>
                <p className="text-[15px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {profile.bio}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Dashboard Card */}
        <div className="bg-white md:rounded-3xl p-4 md:p-6 border-y md:border-x border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-1 text-base">Dashboard</h3>
          <p className="text-sm text-slate-500 mb-4 italic">
            Publicly visible stats
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-blue-600">
                {tasks.length}
              </span>
              <span className="text-xs font-bold text-slate-500 mt-1">
                Total Tasks
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-indigo-600">
                {projectsTimeline.length}
              </span>
              <span className="text-xs font-bold text-slate-500 mt-1">
                Projects
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-emerald-600">
                {tasks.filter((t) => t.status === "approved").length}
              </span>
              <span className="text-xs font-bold text-slate-500 mt-1">
                Approved
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-amber-600">
                {tasks.reduce((sum, t) => sum + (t.likes?.length || 0), 0)}
              </span>
              <span className="text-xs font-bold text-slate-500 mt-1">
                Total Likes
              </span>
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        {profile.recommendations && profile.recommendations.length > 0 && (
          <div className="bg-white md:rounded-3xl border-y md:border-x border-slate-100 p-6 shadow-sm mb-4">
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Recommendations
            </h3>
            <div className="space-y-4">
              {profile.recommendations.map((rec: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-100 rounded-2xl p-5"
                >
                  <p className="text-sm text-slate-700 italic leading-relaxed mb-3">
                    "{rec.text}"
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-[10px] uppercase">
                        {rec.author_name
                          ? rec.author_name.substring(0, 2)
                          : "??"}
                      </div>
                      <span className="text-xs font-bold text-slate-900">
                        {rec.author_name || "Member"}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {rec.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="block lg:hidden space-y-4">{rightSidebarContent}</div>

        {/* Portofolio & Activity (Tasks Grid) */}
        <div className="bg-white md:rounded-3xl p-4 md:p-6 border-y md:border-x border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4 text-base">
            Portfolio Tasks & Evidence
          </h3>

          {displayedTasks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {displayedTasks.map((task, index) => (
                <div
                  key={task.id || task._id || index}
                  className="aspect-square rounded-2xl relative group cursor-pointer overflow-hidden bg-slate-100 border border-slate-200/50"
                  onClick={() => setSelectedTaskIndex(index)}
                >
                  {task.mediaType === "image" ? (
                    <img
                      src={getDirectMediaUrl(task.mediaUrl, "image")}
                      alt={task.caption || "Task"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : task.mediaType === "video" ? (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      <Video className="w-8 h-8 text-white/50" />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-blue-50 flex flex-col items-center justify-center group-hover:scale-105 transition-transform duration-500 p-2 text-center">
                      <FileTextIcon className="w-8 h-8 text-blue-300 mb-2" />
                      <span className="text-[10px] font-bold text-slate-400 line-clamp-2">
                        {task.caption || "Dokumen"}
                      </span>
                    </div>
                  )}
                  {task.status === "rejected" && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 bg-black/10">
                      <div className="bg-red-600 text-white font-black text-[10px] tracking-widest px-8 py-0.5 uppercase rotate-[-35deg] shadow-lg rounded-sm">
                        REJECTED
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                <ImageIcon className="w-5 h-5 text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-400">
                No portfolio or tasks available.
              </p>
            </div>
          )}
        </div>
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
              Post
            </h1>
          </div>
          <div className="flex-1 overflow-y-auto w-full px-4">
            <div className="max-w-md mx-auto w-full pb-20 pt-4">
              {displayedTasks.map((task, index) => {
                const serializedTask = {
                  id: task._id?.toString() || task.id,
                  caption: task.caption,
                  mediaUrl: task.mediaUrl,
                  mediaUrls: task.mediaUrls || [task.mediaUrl],
                  mediaType: task.mediaType || "image",
                  likesCount: task.likes ? task.likes.length : 0,
                  createdAt: task.createdAt,
                  timeAgo: new Date(task.createdAt).toLocaleDateString("id-ID"),
                  author: {
                    id: task.authorId?._id?.toString() || task.authorId?.id,
                    name: task.authorId?.name || "Unknown",
                    image: task.authorId?.image || "",
                    username: task.authorId?.username,
                  },
                  project:
                    typeof task.projectId === "object"
                      ? {
                          id: task.projectId._id?.toString(),
                          title: task.projectId.title,
                        }
                      : undefined,
                  projectTitle:
                    task.projectTitle ||
                    (typeof task.projectId === "object"
                      ? task.projectId.title
                      : "Unknown Project"),
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
                    key={task.id || task._id || index}
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
    </FeedLayout>
  );
}
