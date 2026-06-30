"use client";

import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function PostTask() {
  const router = useRouter();

  return (
    <div className="pt-4 pb-10 px-4 flex flex-col z-[100] relative bg-white min-h-full">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
        <h1 className="text-base font-bold text-slate-900">Post a Task</h1>
        <Button variant="ghost" className="text-blue-600 font-bold hover:bg-blue-50 hover:text-blue-700 -mr-2 px-3">
          Bagikan
        </Button>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        {/* Upload Area */}
        <div className="w-full aspect-square bg-white rounded-[2rem] border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-colors shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-blue-500">
            <ImagePlus className="w-8 h-8" />
          </div>
          <p className="font-bold text-sm text-slate-900">Tap untuk Upload Media</p>
          <p className="text-xs mt-1 font-medium text-slate-400">Gambar atau Video (Max 50MB)</p>
        </div>

        {/* Caption */}
        <div>
          <textarea 
            placeholder="Tulis caption atau cerita proses kerjamu..." 
            className="w-full bg-white border border-slate-200 rounded-3xl p-5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none h-36 shadow-sm"
          ></textarea>
        </div>

        {/* Select Project */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 px-2 uppercase tracking-wide">Pilih Proyek Terkait</label>
          <select defaultValue="" className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none shadow-sm cursor-pointer">
            <option value="" disabled>Pilih proyek...</option>
            <option value="1">UI/UX Design Masterclass</option>
            <option value="2">Frontend Web Development</option>
          </select>
        </div>
      </div>
    </div>
  );
}
