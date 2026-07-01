"use client";

import { ImagePlus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { submitTask } from "@/lib/actions/task";

export default function PostTask() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [projectId, setProjectId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async () => {
    if (!file || !caption || !projectId) {
      alert("Harap lengkapi media, caption, dan proyek.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("caption", caption);
      formData.append("projectId", projectId);
      
      const res = await submitTask(formData);
      if (res.success) {
        alert("Berhasil mengunggah tugas!");
        router.push("/");
      } else {
        alert("Gagal mengunggah: " + res.error);
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-4 pb-10 px-4 flex flex-col z-[100] relative bg-white min-h-full">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-600 hover:bg-slate-200 rounded-full transition-colors disabled:opacity-50" disabled={isSubmitting}>
          <X className="w-6 h-6" />
        </button>
        <h1 className="text-base font-bold text-slate-900">Post a Task</h1>
        <Button 
          variant="ghost" 
          onClick={handleSubmit} 
          disabled={isSubmitting || !file || !caption || !projectId}
          className="text-blue-600 font-bold hover:bg-blue-50 hover:text-blue-700 -mr-2 px-3"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Bagikan"}
        </Button>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        {/* Upload Area */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*,video/*"
          onChange={handleFileSelect}
        />
        
        <div 
          onClick={() => !isSubmitting && fileInputRef.current?.click()}
          className={`w-full aspect-square bg-white rounded-[2rem] border-2 border-dashed ${file ? 'border-transparent overflow-hidden' : 'border-slate-300 hover:bg-slate-50 hover:border-blue-400'} flex flex-col items-center justify-center text-slate-500 cursor-pointer transition-colors shadow-sm relative`}
        >
          {previewUrl ? (
            file?.type.startsWith('video/') ? (
              <video src={previewUrl} className="w-full h-full object-cover rounded-[2rem]" controls />
            ) : (
              <img src={previewUrl} className="w-full h-full object-cover rounded-[2rem]" alt="Preview" />
            )
          ) : (
            <>
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-blue-500">
                <ImagePlus className="w-8 h-8" />
              </div>
              <p className="font-bold text-sm text-slate-900">Tap untuk Upload Media</p>
              <p className="text-xs mt-1 font-medium text-slate-400">Gambar atau Video (Max 50MB)</p>
            </>
          )}
        </div>

        {/* Caption */}
        <div>
          <textarea 
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={isSubmitting}
            placeholder="Tulis caption atau cerita proses kerjamu..." 
            className="w-full bg-white border border-slate-200 rounded-3xl p-5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none h-36 shadow-sm disabled:opacity-50"
          ></textarea>
        </div>

        {/* Select Project */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 px-2 uppercase tracking-wide">Pilih Proyek Terkait</label>
          <select 
            defaultValue=""
            onChange={(e) => setProjectId(e.target.value)}
            disabled={isSubmitting}
            className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none shadow-sm cursor-pointer disabled:opacity-50"
          >
            <option value="" disabled>Pilih proyek...</option>
            {/* Mock Project ID for testing */}
            <option value="66827f311c1d9b3b8c3a1e88">UI/UX Design Masterclass</option>
            <option value="66827f311c1d9b3b8c3a1e89">Frontend Web Development</option>
          </select>
        </div>
      </div>
    </div>
  );
}
