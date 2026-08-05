"use client";

import { useState, useRef } from "react";
import {
  UploadCloud,
  Image as ImageIcon,
  X,
  Loader2,
  Link2,
  CheckCircle2,
} from "lucide-react";
import { uploadToGDrive } from "@/lib/actions/upload";

interface CoverUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

export default function CoverUploader({ value, onChange }: CoverUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadToGDrive(file, "blogs");
      if (url) {
        onChange(url);
      }
    } catch (err) {
      alert("Gagal mengunggah gambar ke Google Drive.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    try {
      setIsUploading(true);
      const url = await uploadToGDrive(file, "blogs");
      if (url) {
        onChange(url);
      }
    } catch (err) {
      alert("Gagal mengunggah gambar ke Google Drive.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput("");
      setIsUrlMode(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-blue-600" />
          Cover / Hero Image
        </label>

        <button
          type="button"
          onClick={() => setIsUrlMode(!isUrlMode)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50/80 hover:bg-blue-100/80 px-2.5 py-1 rounded-full transition-colors"
        >
          <Link2 className="w-3.5 h-3.5" />
          {isUrlMode ? "Unggah Berkas" : "Gunakan URL Gambar"}
        </button>
      </div>

      {isUrlMode ? (
        <div className="flex gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            disabled={!urlInput.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            Terapkan
          </button>
        </div>
      ) : null}

      {value ? (
        <div className="relative h-60 sm:h-72 w-full rounded-3xl overflow-hidden border border-slate-200/80 bg-slate-900 group shadow-md">
          <img
            src={value}
            alt="Cover preview"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-white/90 hover:bg-white text-slate-900 text-xs font-bold rounded-xl shadow-lg backdrop-blur-sm transition-transform hover:scale-105"
            >
              Ganti Gambar
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-2 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl shadow-lg backdrop-blur-sm transition-transform hover:scale-105"
              title="Hapus gambar cover"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`h-60 sm:h-72 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
            isUploading
              ? "border-blue-400 bg-blue-50/50 cursor-wait"
              : "border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-blue-600">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm font-semibold">
                Mengunggah ke Google Drive...
              </p>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-center text-blue-600">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-800">
                  Klik atau seret gambar ke sini
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  PNG, JPG, WEBP • Upload ke Google Drive
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
