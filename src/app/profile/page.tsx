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
import { getUserProfile } from "@/lib/actions/user";
import Link from "next/link";
import { SKILL_ICONS, SkillIconName } from "@/components/ui/skill-icons";

const MOCK_GRID_TASKS = [
  "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?auto=format&fit=crop&q=80&w=300",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=300",
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=300",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=300",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=300",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=300",
];

const MOCK_TIMELINE_DATA = [
  { name: "Jan", grade: 75 },
  { name: "Feb", grade: 82 },
  { name: "Mar", grade: 80 },
  { name: "Apr", grade: 88 },
  { name: "May", grade: 85 },
  { name: "Jun", grade: 95 },
];

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
  const [dbUser, setDbUser] = useState<any>(null);

  useEffect(() => {
    if (session) {
      getUserProfile().then((data) => {
        if (data) setDbUser(data);
      });
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="pb-10 bg-white min-h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // UI saat user belum login
  if (!session) {
    return (
      <div className="pb-10 bg-white min-h-full flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-slate-100">
          <InstagramIcon className="w-10 h-10 text-pink-600" />
        </div>
        <h1 className="text-xl font-black text-slate-900 mb-2 text-center">
          Masuk ke Jazmedia
        </h1>
        <p className="text-sm text-slate-500 mb-8 text-center max-w-[280px]">
          Tautkan akun Instagram Anda untuk mulai membagikan tugas dan membangun
          portofolio.
        </p>

        <a
          href="/api/auth/instagram-login"
          className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold h-14 rounded-2xl shadow-md border-none flex items-center justify-center gap-3 transition-all"
        >
          <InstagramIcon className="w-5 h-5" />
          Lanjutkan dengan Instagram
        </a>

        {/* Akun cadangan/dummy jika belum setup kredensial IG */}
        <div className="mt-8 pt-8 border-t border-slate-100 w-full">
          <p className="text-[10px] text-slate-400 text-center mb-4 font-black uppercase tracking-widest">
            Atau masuk tanpa sandi (MVP)
          </p>
          <Button
            onClick={() =>
              signIn("credentials", {
                username: "member",
                callbackUrl: "/profile",
              })
            }
            variant="outline"
            className="w-full font-bold h-12 rounded-xl text-slate-700 border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            Masuk sebagai Member
          </Button>
        </div>
      </div>
    );
  }

  // UI saat user sudah login
  const user = session.user;
  const username = user?.name?.toLowerCase().replace(/\s+/g, "") || "user";
  const bio =
    dbUser?.bio ||
    "Halo! Saya menggunakan Jazmedia untuk membangun portofolio dan berbagi perjalanan belajar saya.";
  const skills = dbUser?.skills || [];
  const role = dbUser?.role || "member";

  return (
    <div className="pb-10 bg-white min-h-full">
      {/* Profile Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24 border-2 border-slate-100 shadow-sm relative">
            <AvatarImage
              src={user?.image || "https://i.pravatar.cc/150"}
              alt={user?.name || "User"}
            />
            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
            {role === "mentor" && (
              <div className="absolute -bottom-1 -right-1 bg-amber-100 text-amber-600 rounded-full p-1 border-2 border-white shadow-sm">
                <CheckCircle2 className="w-5 h-5 fill-amber-500 text-white" />
              </div>
            )}
          </Avatar>

          <div className="flex-1 flex justify-around text-center">
            <div className="flex flex-col">
              <span className="font-bold text-lg text-slate-900">42</span>
              <span className="text-xs text-slate-500">Tasks</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-slate-900">5</span>
              <span className="text-xs text-slate-500">Projects</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-slate-900">2</span>
              <span className="text-xs text-slate-500">Collabs</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              {user?.name}
              {role === "mentor" && (
                <span className="bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider">
                  Mentor
                </span>
              )}
            </h2>
            <p className="text-xs text-blue-600 font-medium mb-1">
              @{username}
            </p>
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

        {/* Skills */}
        {skills.length > 0 && (
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

      {/* Tabs */}
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
            value="collabs"
            className="flex-1 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-slate-900 rounded-none h-full transition-all"
          >
            <Users className="w-5 h-5" />
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
          <div className="grid grid-cols-3 gap-[2px]">
            {MOCK_GRID_TASKS.map((img, i) => (
              <div
                key={i}
                className="aspect-square bg-slate-100 relative group cursor-pointer overflow-hidden"
              >
                <img
                  src={img}
                  alt={`Task ${i}`}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="p-4">
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Folder className="w-12 h-12 text-slate-200 mb-3" strokeWidth={1} />
            <p className="text-sm font-medium text-slate-600">
              Belum ada proyek
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Proyek yang Anda ikuti akan muncul di sini.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="collabs" className="p-4">
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Users className="w-12 h-12 text-slate-200 mb-3" strokeWidth={1} />
            <p className="text-sm font-medium text-slate-600">
              Belum ada kolaborasi
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Tugas kolaboratif Anda akan muncul di sini.
            </p>
          </div>
        </TabsContent>

        <TabsContent
          value="insights"
          className="p-4 bg-slate-50/50 min-h-[300px]"
        >
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="border-none shadow-sm rounded-3xl bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col items-center justify-center text-center h-full">
                <span className="text-4xl font-black text-blue-600 mb-1 tracking-tighter">
                  5
                </span>
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                  Projects Done
                </span>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm rounded-3xl bg-gradient-to-br from-indigo-50 to-white hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col items-center justify-center text-center h-full">
                <span className="text-4xl font-black text-indigo-600 mb-1 tracking-tighter">
                  8.4
                </span>
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                  Tasks / Project
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
                    data={MOCK_TIMELINE_DATA}
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
                      tick={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }}
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
                      dataKey="grade"
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
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-amber-100/50">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-bold text-amber-700">
                    UI/UX Design Masterclass
                  </p>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                    95
                  </span>
                </div>
                <p className="text-sm text-slate-700 italic leading-relaxed">
                  "Desainnya sangat bersih dan rapi. Hierarki visualnya sudah
                  tepat sasaran. Pertahankan gaya minimalism-nya!"
                </p>
                <div className="text-xs font-bold text-slate-900 mt-3 flex items-center">
                  <div className="w-5 h-5 rounded-full bg-slate-200 mr-2 flex items-center justify-center text-[8px]">
                    KR
                  </div>
                  Kak Rio
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
