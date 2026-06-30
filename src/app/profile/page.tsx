"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Grid3X3, Folder, Users, LineChart, Award } from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const MOCK_USER = {
  name: "Budi Santoso",
  username: "budisntso",
  bio: "Mahasiswa Sistem Informasi | Web Developer Enthusiast | UI/UX Learner",
  avatar: "https://i.pravatar.cc/150?u=budi",
  stats: {
    tasks: 42,
    projects: 5,
    collabs: 2,
  },
  highlights: ["ReactJS", "Next.js", "Figma", "Tailwind CSS"],
};

const MOCK_GRID_TASKS = [
  "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?auto=format&fit=crop&q=80&w=300",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=300",
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=300",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=300",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=300",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=300",
];

const MOCK_TIMELINE_DATA = [
  { name: 'Jan', grade: 75 },
  { name: 'Feb', grade: 82 },
  { name: 'Mar', grade: 80 },
  { name: 'Apr', grade: 88 },
  { name: 'May', grade: 85 },
  { name: 'Jun', grade: 95 },
];

export default function Profile() {
  return (
    <div className="pb-10 bg-white">
      {/* Profile Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24 border-2 border-slate-100 shadow-sm">
            <AvatarImage src={MOCK_USER.avatar} alt={MOCK_USER.name} />
            <AvatarFallback>{MOCK_USER.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 flex justify-around text-center">
            <div className="flex flex-col">
              <span className="font-bold text-lg text-slate-900">{MOCK_USER.stats.tasks}</span>
              <span className="text-xs text-slate-500">Tasks</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-slate-900">{MOCK_USER.stats.projects}</span>
              <span className="text-xs text-slate-500">Projects</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-slate-900">{MOCK_USER.stats.collabs}</span>
              <span className="text-xs text-slate-500">Collabs</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="font-bold text-base text-slate-900">{MOCK_USER.name}</h2>
          <p className="text-xs text-blue-600 font-medium mb-1">@{MOCK_USER.username}</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{MOCK_USER.bio}</p>
        </div>

        <div className="mt-4">
          <Button className="w-full font-bold bg-slate-100 hover:bg-slate-200 text-slate-900 border-none shadow-none rounded-xl h-10">
            Edit Profile
          </Button>
        </div>
        
        {/* Highlights */}
        <div className="mt-6">
          <h3 className="text-xs font-bold text-slate-900 mb-2 px-1">Highlights</h3>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide px-1">
            {MOCK_USER.highlights.map((skill, index) => (
              <div key={index} className="flex flex-col items-center gap-1.5 min-w-[64px]">
                <div className="w-16 h-16 rounded-full border border-slate-200 flex items-center justify-center p-1 cursor-pointer hover:border-blue-300 transition-colors">
                  <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 text-center leading-tight shadow-inner">
                    {skill}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tasks" className="w-full mt-2">
        <TabsList className="w-full justify-between h-12 bg-white rounded-none border-b border-slate-100 px-0">
          <TabsTrigger value="tasks" className="flex-1 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-slate-900 rounded-none h-full transition-all">
            <Grid3X3 className="w-5 h-5" />
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex-1 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-slate-900 rounded-none h-full transition-all">
            <Folder className="w-5 h-5" />
          </TabsTrigger>
          <TabsTrigger value="collabs" className="flex-1 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-slate-900 rounded-none h-full transition-all">
            <Users className="w-5 h-5" />
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex-1 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-slate-900 rounded-none h-full transition-all">
            <LineChart className="w-5 h-5" />
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="m-0 border-none outline-none mt-1">
          <div className="grid grid-cols-3 gap-[2px]">
            {MOCK_GRID_TASKS.map((img, i) => (
              <div key={i} className="aspect-square bg-slate-100 relative group cursor-pointer overflow-hidden">
                <img src={img} alt={`Task ${i}`} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="projects" className="p-4">
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Folder className="w-12 h-12 text-slate-200 mb-3" strokeWidth={1} />
            <p className="text-sm font-medium text-slate-600">Belum ada proyek</p>
            <p className="text-xs text-slate-400 mt-1">Proyek yang Anda ikuti akan muncul di sini.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="collabs" className="p-4">
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Users className="w-12 h-12 text-slate-200 mb-3" strokeWidth={1} />
            <p className="text-sm font-medium text-slate-600">Belum ada kolaborasi</p>
            <p className="text-xs text-slate-400 mt-1">Tugas kolaboratif Anda akan muncul di sini.</p>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="p-4 bg-slate-50/50 min-h-[300px]">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="border-none shadow-sm rounded-3xl bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col items-center justify-center text-center h-full">
                <span className="text-4xl font-black text-blue-600 mb-1 tracking-tighter">5</span>
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Projects Done</span>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm rounded-3xl bg-gradient-to-br from-indigo-50 to-white hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col items-center justify-center text-center h-full">
                <span className="text-4xl font-black text-indigo-600 mb-1 tracking-tighter">8.4</span>
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Tasks / Project</span>
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
                  <RechartsLineChart data={MOCK_TIMELINE_DATA} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} domain={['dataMin - 10', 'auto']} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
                      itemStyle={{ color: '#2563eb', fontWeight: 600 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="grade" 
                      stroke="#2563eb" 
                      strokeWidth={4} 
                      dot={{ r: 5, fill: '#fff', strokeWidth: 3, stroke: '#2563eb' }} 
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
                  <p className="text-xs font-bold text-amber-700">UI/UX Design Masterclass</p>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full">95</span>
                </div>
                <p className="text-sm text-slate-700 italic leading-relaxed">"Desainnya sangat bersih dan rapi. Hierarki visualnya sudah tepat sasaran. Pertahankan gaya minimalism-nya!"</p>
                <div className="text-xs font-bold text-slate-900 mt-3 flex items-center">
                  <div className="w-5 h-5 rounded-full bg-slate-200 mr-2 flex items-center justify-center text-[8px]">KR</div>
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
