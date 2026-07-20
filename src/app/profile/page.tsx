"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Grid3X3,
  Folder,
  Users,
  LineChart,
  Award,
  LogOut,
  CheckCircle2,
} from "lucide-react";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TaskCard, TaskCardProps } from "@/components/feed/TaskCard";
import { getUserTasks } from "@/lib/actions/task";
import { ArrowLeft, Play, FileText as FileTextIcon } from "lucide-react";
import { useRef } from "react";
import { getDirectMediaUrl } from "@/lib/utils/media";
import { getUserProfile } from "@/lib/actions/user";
import Link from "next/link";
import { SKILL_ICONS, SkillIconName } from "@/components/ui/skill-icons";
import AdminDashboard from "@/components/profile/AdminDashboard";
import { ProjectManager } from "@/components/profile/ProjectManager";

import { useMemo } from "react";

const CircularProgress = ({
  percentage,
  icon,
  name,
}: {
  percentage: number;
  icon: SkillIconName;
  name: string;
}) => {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const IconComponent = SKILL_ICONS[icon] || SKILL_ICONS.Code;

  return (
    <div className="flex flex-col items-center gap-1.5 min-w-[72px]">
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Background Circle */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 64 64"
        >
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="3"
          />
          {/* Progress Circle */}
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Icon inside */}
        <div className="w-[42px] h-[42px] bg-slate-50 rounded-full flex items-center justify-center text-slate-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] border border-slate-100 font-medium">
          <IconComponent className="w-5 h-5" />
        </div>
      </div>
      <span className="text-[10px] font-bold text-slate-600 text-center leading-tight truncate max-w-[64px]">
        {name}
      </span>
    </div>
  );
};

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dbUser, setDbUser] = useState<any>(null);
  const [userTasks, setUserTasks] = useState<TaskCardProps[]>([]);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number | null>(
    null,
  );

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (session) {
      getUserProfile().then((data: any) => {
        if (data) setDbUser(data);
      });
      const userId = (session.user as any).id;
      if (userId) {
        getUserTasks(userId).then((res) => {
          if (res.success && res.data) {
            setUserTasks(res.data);
          }
        });
      }
    }
  }, [session, status, router]);

  // --- Dynamic Insights Calculations ---
  const { averageGrade, mediaDistribution, topReviews, chartData } =
    useMemo(() => {
      // Average Grade
      const validGrades = userTasks
        .filter((t) => t.review?.grade)
        .map((t) => t.review!.grade);
      const averageGrade =
        validGrades.length > 0
          ? Math.round(
              validGrades.reduce((a, b) => a + b, 0) / validGrades.length,
            )
          : 0;

      // Media Type Distribution
      const imageCount = userTasks.filter(
        (t) => t.mediaType === "image",
      ).length;
      const videoCount = userTasks.filter(
        (t) => t.mediaType === "video",
      ).length;
      const documentCount = userTasks.filter(
        (t) => t.mediaType === "document",
      ).length;
      const totalMedia = imageCount + videoCount + documentCount;

      const mediaDistribution =
        totalMedia > 0
          ? [
              {
                name: "Image",
                percentage: Math.round((imageCount / totalMedia) * 100),
                icon: "PenTool" as SkillIconName,
              },
              {
                name: "Video",
                percentage: Math.round((videoCount / totalMedia) * 100),
                icon: "Monitor" as SkillIconName,
              },
              {
                name: "Document",
                percentage: Math.round((documentCount / totalMedia) * 100),
                icon: "Database" as SkillIconName,
              },
            ].filter((m) => m.percentage > 0)
          : [];

      // Top Reviews
      const topReviews = [...userTasks]
        .filter((t) => t.review?.grade)
        .sort((a, b) => b.review!.grade - a.review!.grade)
        .slice(0, 2);

      // Timeline (Last 6 months)
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const timelineData = monthNames.map((month) => ({
        name: month,
        tasks: 0,
      }));

      userTasks.forEach((task) => {
        if (task.createdAt) {
          const date = new Date(task.createdAt);
          timelineData[date.getMonth()].tasks += 1;
        }
      });

      const currentMonthIndex = new Date().getMonth();
      const startMonthIndex = (currentMonthIndex - 5 + 12) % 12;
      const chartData = [];
      for (let i = 0; i < 6; i++) {
        const idx = (startMonthIndex + i) % 12;
        chartData.push(timelineData[idx]);
      }

      return { averageGrade, mediaDistribution, topReviews, chartData };
    }, [userTasks]);

  if (status === "loading" || status === "unauthenticated" || !session) {
    return (
      <div className="pb-10 bg-white min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // UI saat user sudah login
  const sessionUser = session.user as any;
  const name = dbUser?.name || sessionUser?.name || "User";
  const username = dbUser?.username || "";
  const image =
    dbUser?.image || sessionUser?.image || "https://i.pravatar.cc/150";
  const bio = dbUser
    ? dbUser.bio
    : "Halo! Saya menggunakan Jazmedia untuk membangun portofolio dan berbagi perjalanan belajar saya.";
  const skills = dbUser?.skills || [];
  const role = dbUser?.role || sessionUser?.role || "member";

  return (
    <div className="pb-10 bg-white min-h-full">
      {/* Profile Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24 border-2 border-slate-100 shadow-sm relative">
            <AvatarImage src={image} alt={name} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            {role === "mentor" && (
              <div className="absolute -bottom-1 -right-1 bg-amber-100 text-amber-600 rounded-full p-1 border-2 border-white shadow-sm">
                <CheckCircle2 className="w-5 h-5 fill-amber-500 text-white" />
              </div>
            )}
            {role === "admin" && (
              <div className="absolute -bottom-1 -right-1 bg-red-100 text-red-600 rounded-full p-1 border-2 border-white shadow-sm">
                <CheckCircle2 className="w-5 h-5 fill-red-500 text-white" />
              </div>
            )}
            {role === "member" && (
              <div className="absolute -bottom-1 -right-1 bg-blue-100 text-blue-600 rounded-full p-1 border-2 border-white shadow-sm">
                <CheckCircle2 className="w-5 h-5 fill-blue-500 text-white" />
              </div>
            )}
          </Avatar>

          <div className="flex-1 flex justify-around text-center">
            <div className="flex flex-col">
              <span className="font-bold text-lg text-slate-900">
                {userTasks.length}
              </span>
              <span className="text-xs text-slate-500">Tasks</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-slate-900">
                {topReviews.length}
              </span>
              <span className="text-xs text-slate-500">Top Reviews</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-slate-900">
                {averageGrade || "-"}
              </span>
              <span className="text-xs text-slate-500">Avg Grade</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              {name}
              {role === "mentor" && (
                <span className="bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider">
                  Mentor
                </span>
              )}
              {role === "admin" && (
                <span className="bg-red-100 text-red-800 text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider">
                  Admin
                </span>
              )}
              {role === "member" && (
                <span className="bg-blue-100 text-blue-800 text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider flex items-center gap-1">
                  Member{" "}
                  <CheckCircle2 className="w-2.5 h-2.5 fill-blue-500 text-blue-100" />
                </span>
              )}
              {role === "guest" && (
                <span className="bg-slate-100 text-slate-600 text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider">
                  Guest
                </span>
              )}
            </h2>
            {username && (
              <p className="text-xs text-blue-600 font-medium mb-1">
                @{username}
              </p>
            )}
          </div>
        </div>
        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed mt-2">
          {bio}
        </p>

        <div className="mt-5 flex gap-2">
          <Link href="/profile/edit" className="flex-1">
            <Button className="w-full font-bold bg-slate-100 hover:bg-slate-200 text-slate-900 border-none shadow-none rounded-xl h-10 transition-colors">
              Edit Profile
            </Button>
          </Link>
          <Button
            onClick={() => signOut()}
            variant="outline"
            className="w-10 h-10 p-0 font-bold border-slate-200 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-xl transition-colors shrink-0"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Highlights / Skills */}
        {skills && skills.length > 0 && (
          <div className="mt-6">
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide px-1">
              {skills.map((skill: any, index: number) => (
                <CircularProgress
                  key={index}
                  name={skill.name}
                  icon={skill.icon}
                  percentage={skill.percentage}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Conditional Rendering: Admin Dashboard vs Normal Feed */}
      {role === "admin" ? (
        <AdminDashboard currentUserId={dbUser?.id || ""} />
      ) : (
        <Tabs defaultValue="tasks" className="w-full mt-2">
          <TabsList className="w-full justify-between h-12 bg-white rounded-none border-b border-slate-100 px-0">
            <TabsTrigger
              value="tasks"
              className="flex-1 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-slate-900 rounded-none h-full transition-all"
            >
              <Grid3X3 className="w-5 h-5" />
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="flex-1 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-slate-900 rounded-none h-full transition-all"
            >
              <Folder className="w-5 h-5" />
            </TabsTrigger>
            <TabsTrigger
              value="insights"
              className="flex-1 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-slate-900 rounded-none h-full transition-all"
            >
              <LineChart className="w-5 h-5" />
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="tasks"
            className="m-0 border-none outline-none mt-1"
          >
            {userTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Grid3X3
                  className="w-12 h-12 text-slate-200 mb-3"
                  strokeWidth={1}
                />
                <p className="text-sm font-medium text-slate-600">
                  Belum ada tugas
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Postingan dan tugas Anda akan muncul di sini.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-[2px]">
                {userTasks.map((task, i) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTaskIndex(i)}
                    className="aspect-square bg-slate-100 relative group cursor-pointer overflow-hidden flex items-center justify-center"
                  >
                    {task.mediaType === "image" ? (
                      <img
                        src={getDirectMediaUrl(task.mediaUrl, "image")}
                        alt={`Task ${i}`}
                        className={`object-cover w-full h-full group-hover:scale-110 transition-transform duration-500 ${task.status === 'rejected' ? 'grayscale opacity-90' : ''}`}
                        loading="lazy"
                      />
                    ) : task.mediaType === "video" ? (
                      <div className={`w-full h-full flex items-center justify-center ${task.status === 'rejected' ? 'bg-slate-700 grayscale' : 'bg-slate-800'}`}>
                        <Play className="w-8 h-8 text-white/50" />
                      </div>
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${task.status === 'rejected' ? 'bg-slate-200 grayscale' : 'bg-blue-50'}`}>
                        <FileTextIcon className={`w-8 h-8 ${task.status === 'rejected' ? 'text-slate-400' : 'text-blue-300'}`} />
                      </div>
                    )}
                    
                    {task.status === "rejected" && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 bg-black/10">
                        <div className="bg-red-600 text-white font-black text-[10px] sm:text-xs tracking-widest px-2 py-0.5 uppercase rotate-[-12deg] shadow-lg rounded-sm">
                          REJECTED
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="projects" className="p-4">
            <ProjectManager
              currentUserId={dbUser?.id || ""}
              isAdmin={false}
              readonly={role !== "mentor"}
            />
          </TabsContent>

          <TabsContent
            value="insights"
            className="p-4 bg-slate-50/50 min-h-[300px]"
          >
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card className="border-none shadow-sm rounded-3xl bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex flex-col items-center justify-center text-center h-full">
                  <span className="text-4xl font-black text-blue-600 mb-1 tracking-tighter">
                    {userTasks.filter((t) => t.review?.grade).length}
                  </span>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    Karya Dinilai
                  </span>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm rounded-3xl bg-gradient-to-br from-indigo-50 to-white hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex flex-col items-center justify-center text-center h-full">
                  <span className="text-4xl font-black text-indigo-600 mb-1 tracking-tighter">
                    {averageGrade || "-"}
                  </span>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    Rata-rata Nilai
                  </span>
                </CardContent>
              </Card>
            </div>

            <Card className="border-none shadow-sm rounded-3xl mb-6 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                    <LineChart className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  Grade Timeline
                </h3>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={chartData}
                      margin={{ top: 5, right: 5, bottom: 5, left: -20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 11,
                          fill: "#64748b",
                          fontWeight: 500,
                        }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 11,
                          fill: "#64748b",
                          fontWeight: 500,
                        }}
                        domain={["dataMin - 10", "auto"]}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "16px",
                          border: "none",
                          boxShadow:
                            "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
                        }}
                        labelStyle={{
                          fontWeight: "bold",
                          color: "#0f172a",
                          marginBottom: "4px",
                        }}
                        itemStyle={{ color: "#2563eb", fontWeight: 600 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="tasks"
                        stroke="#2563eb"
                        strokeWidth={4}
                        dot={{
                          r: 5,
                          fill: "#fff",
                          strokeWidth: 3,
                          stroke: "#2563eb",
                        }}
                        activeDot={{ r: 7, strokeWidth: 0 }}
                        animationDuration={1500}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {topReviews.length > 0 && (
              <Card className="border-none shadow-sm rounded-3xl bg-gradient-to-br from-amber-50 to-white relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute -right-6 -top-6 opacity-[0.07] group-hover:scale-110 transition-transform duration-500">
                  <Award className="w-40 h-40 text-amber-500" />
                </div>
                <CardContent className="p-6 relative">
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center">
                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center mr-2">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    Best Review
                  </h3>
                  <div className="space-y-3">
                    {topReviews.map((reviewData, i) => (
                      <div
                        key={i}
                        className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-amber-100/50"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-xs font-bold text-amber-700">
                            {reviewData.projectTitle}
                          </p>
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                            {reviewData.review!.grade}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 italic leading-relaxed">
                          "{reviewData.review!.comment}"
                        </p>
                        <div className="text-xs font-bold text-slate-900 mt-3 flex items-center">
                          <div className="w-5 h-5 rounded-full bg-slate-200 mr-2 flex items-center justify-center text-[8px] uppercase">
                            {reviewData.review!.mentorName.substring(0, 2)}
                          </div>
                          {reviewData.review!.mentorName}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
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
              {userTasks.map((task, index) => (
                <div
                  key={task.id}
                  ref={index === selectedTaskIndex ? scrollRef : null}
                  className="mb-6"
                >
                  <TaskCard {...task} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Auto-scroll effect */}
      {selectedTaskIndex !== null && <AutoScroll refNode={scrollRef} />}
    </div>
  );
}

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
