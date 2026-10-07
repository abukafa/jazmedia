"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getPublicProjects } from "@/lib/actions/project";

export default function RightSidebar() {
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ["sidebar-projects"],
    queryFn: async () => {
      const res = await getPublicProjects("active");
      if (res.success && Array.isArray(res.data)) {
        return res.data.slice(0, 3);
      }
      return [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const courses = [
    { title: "Case Study UI/UX Design about medical app", author: "Peter Wilson", id: 1 },
    { title: "How to make animation in Figma", author: "Rose Stratton", id: 2 },
    { title: "Make illustration in Blender", author: "Brandon Steward", id: 3 },
  ];

  return (
    <div className="sticky top-[80px] space-y-4">
      {/* Best Projects */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 text-sm">Best Projects</h3>
          <span className="text-slate-400 cursor-pointer hover:text-slate-600">→</span>
        </div>
        
        {isLoadingProjects ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-10 h-10 bg-slate-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-2 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((proj: any) => (
              <div key={proj.id || proj._id} className="flex gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0 uppercase">
                  {(proj.name || proj.title || "?").charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900 truncate">
                    {proj.name || proj.title}
                  </h4>
                  <p className="text-xs text-slate-500 truncate">
                    {proj.status || "Active Project"}
                  </p>
                  <Link href={`/projects/${proj.id || proj._id || ""}`}>
                    <button className="mt-1 flex items-center justify-center gap-1 border border-slate-500 text-slate-600 rounded-full px-3 py-1 text-xs font-semibold hover:bg-slate-50 hover:border-slate-700 hover:text-slate-900 transition-colors">
                      <Plus className="w-3 h-3" />
                      Join
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <Link href="/projects" className="mt-4 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors w-full text-left flex items-center">
          View all projects →
        </Link>
      </div>

      {/* Today's top courses */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
         <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 text-sm">Today's top courses</h3>
          <span className="text-slate-400 cursor-pointer hover:text-slate-600">→</span>
        </div>
        
        <div className="space-y-4">
          {courses.map((course, idx) => (
            <div key={course.id} className="flex gap-2">
              <span className="text-sm font-semibold text-slate-700">{idx + 1}.</span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-900 leading-tight">{course.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{course.author}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Links */}
      <div className="px-4 py-2 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px] text-slate-500">
         <Link href="#" className="hover:text-blue-600 hover:underline">About</Link>
         <Link href="#" className="hover:text-blue-600 hover:underline">Accessibility</Link>
         <Link href="#" className="hover:text-blue-600 hover:underline">Help Center</Link>
         <Link href="#" className="hover:text-blue-600 hover:underline">Privacy & Terms</Link>
      </div>
      <div className="text-center text-[10px] text-slate-400">
        Jazmedia Corporation © {new Date().getFullYear()}
      </div>
    </div>
  );
}
