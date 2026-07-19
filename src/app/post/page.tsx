"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Image as ImageIcon,
  Video,
  FileText,
  CheckCircle2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitTask, getPostFormData } from "@/lib/actions/task";
import { createDriveUploadSession } from "@/lib/actions/upload";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAlert } from "@/components/providers/AlertProvider";
import Image from "next/image";

export default function PostTask() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { data: session, status } = useSession();
  const userRole = (session?.user as { role?: string })?.role;
  const [mediaType, setMediaType] = useState<
    "image" | "video" | "document" | null
  >(null);

  const [projects, setProjects] = useState<
    Array<{ id: string; title: string }>
  >([]);
  const [users, setUsers] = useState<
    Array<{ id: string; name: string; image?: string; username?: string }>
  >([]);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [collaborators, setCollaborators] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadPhase, setUploadPhase] = useState<string>("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/profile");
    } else if (status === "authenticated" && userRole === "guest") {
      showAlert({
        message: "Akun belum bisa posting, hubungi admin.",
        type: "warning",
      });
      router.push("/");
    }
  }, [status, userRole, router, showAlert]);

  useEffect(() => {
    if (status !== "authenticated") return;
    getPostFormData().then((res) => {
      if (res.success && res.data) {
        setProjects(res.data.projects);
        setUsers(res.data.users.filter((user) => user.username));
      }
    });
  }, [status]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);

      const filePreviews = selectedFiles.map((file) =>
        URL.createObjectURL(file),
      );
      setPreviews(filePreviews);
    }
  };

  const handleAddCollaborator = (userId: string) => {
    if (!userId) return;
    if (!collaborators.includes(userId)) {
      setCollaborators([...collaborators, userId]);
    }
  };

  const handleRemoveCollaborator = (userId: string) => {
    setCollaborators(collaborators.filter((id) => id !== userId));
  };

  const uploadFileToDrive = async (file: File, uploadUrl: string) => {
    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl, true);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(Math.round(percentComplete));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.id) resolve(response.id);
            else reject(new Error("ID tidak ditemukan di respon akhir"));
          } catch (e) {
            reject(new Error("Gagal membaca respon final Google Drive"));
          }
        } else {
          reject(new Error(`Gagal (Status: ${xhr.status}) saat mengunggah`));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Koneksi internet terputus di tengah jalan. Pastikan jaringan stabil."));
      };

      // Upload entire file seamlessly, browser handles streaming automatically
      xhr.send(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0 || !selectedProjectId || !mediaType) return;

    setIsSubmitting(true);
    setUploadProgress(0);
    setUploadPhase("Memulai unggahan...");

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("projectId", selectedProjectId);
    formData.append("mediaType", mediaType);
    formData.append("collaborators", JSON.stringify(collaborators));

    try {
      // Filter out files that are larger than 5MB to use Direct Upload (or all videos)
      // Let's just use Direct Upload for all videos for consistency
      if (
        mediaType === "video" ||
        mediaType === "image" ||
        mediaType === "document"
      ) {
        for (const file of files) {
          setUploadPhase(`Menyiapkan ${file.name}...`);
          const resSession = await createDriveUploadSession(
            file.name,
            file.type,
            file.size,
            mediaType + "s",
            typeof window !== "undefined" ? window.location.origin : undefined
          );

          if (!resSession.success || !resSession.uploadUrl) {
            throw new Error("Gagal membuat sesi upload: " + resSession.error);
          }

          setUploadPhase(`Mengunggah ${file.name}...`);
          const fileId = await uploadFileToDrive(file, resSession.uploadUrl);
          formData.append("preuploadedIds", fileId);
        }
      } else {
        // Fallback for smaller/other things if needed, but we do Direct for all now
        files.forEach((file) => formData.append("files", file));
      }

      setUploadPhase("Menyimpan postingan...");
      const res = await submitTask(formData);

      setIsSubmitting(false);
      setUploadPhase("");
      if (res.success) {
        router.push("/profile");
      } else {
        showAlert({
          message: "Gagal menyimpan postingan: " + res.error,
          type: "error",
        });
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setUploadPhase("");
      showAlert({
        message: err.message || "Terjadi kesalahan saat mengunggah",
        type: "error",
      });
    }
  };

  if (!mediaType) {
    return (
      <div className="pt-6 pb-8 px-4 bg-slate-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-black text-slate-900">
            Pilih Jenis Postingan
          </h1>
          <Link href="/" className="text-slate-500 text-xs font-bold mr-3">
            Cancel
          </Link>
        </div>
        <div className="grid gap-4">
          <Card
            onClick={() => setMediaType("image")}
            className="cursor-pointer hover:border-blue-500 hover:shadow-md transition-all border-slate-200 shadow-sm bg-white"
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Gambar / Karusel</h3>
                <p className="text-xs text-slate-500">
                  Unggah satu atau beberapa gambar sekaligus
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => setMediaType("video")}
            className="cursor-pointer hover:border-red-500 hover:shadow-md transition-all border-slate-200 shadow-sm bg-white"
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Video</h3>
                <p className="text-xs text-slate-500">
                  Unggah file video MP4 atau rekaman
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => setMediaType("document")}
            className="cursor-pointer hover:border-amber-500 hover:shadow-md transition-all border-slate-200 shadow-sm bg-white"
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Dokumen PDF</h3>
                <p className="text-xs text-slate-500">
                  Unggah laporan, presentasi, atau dokumen PDF
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 pb-24 px-4 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
          {mediaType === "image" && (
            <ImageIcon className="w-5 h-5 text-blue-600" />
          )}
          {mediaType === "video" && <Video className="w-5 h-5 text-red-600" />}
          {mediaType === "document" && (
            <FileText className="w-5 h-5 text-amber-600" />
          )}
          Upload {mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}
        </h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setMediaType(null);
            setFiles([]);
            setPreviews([]);
          }}
          className="text-slate-500 text-xs font-bold"
        >
          Ganti Tipe
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="grid gap-2">
            <Label className="text-xs font-bold">Pilih Proyek</Label>
            <Select
              value={selectedProjectId || null}
              onValueChange={setSelectedProjectId}
              required
            >
              <SelectTrigger className="w-full text-sm">
                <SelectValue placeholder="-- Pilih Proyek --">
                  {selectedProjectId
                    ? projects.find((p) => p.id === selectedProjectId)?.title
                    : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2 mt-4">
            <Label className="text-xs font-bold">Upload File</Label>
            <Input
              type="file"
              multiple={mediaType === "image"}
              accept={
                mediaType === "image"
                  ? "image/*"
                  : mediaType === "video"
                    ? "video/*"
                    : ".pdf"
              }
              onChange={handleFileChange}
              required
              className="file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
            />
          </div>

          {/* Preview Area */}
          {previews.length > 0 && (
            <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 mb-3">Preview</h4>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {previews.map((src, i) => (
                  <div
                    key={i}
                    className="shrink-0 relative rounded-xl overflow-hidden border border-slate-200 bg-black/5"
                    style={{ width: 120, height: 120 }}
                  >
                    {mediaType === "image" ? (
                      <img
                        src={src}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : mediaType === "video" ? (
                      <video src={src} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full h-full p-2 text-center text-[10px] text-slate-600 font-bold bg-white">
                        <FileText className="w-8 h-8 mb-2 text-red-500" />
                        <span className="truncate w-full block">
                          {files[i]?.name}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="grid gap-2">
            <Label className="text-xs font-bold">
              Caption / Catatan Tambahan
            </Label>
            <Textarea
              placeholder="Ceritakan proses pembuatan tugas ini..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="resize-none text-sm"
              rows={4}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="grid gap-2">
            <Label className="text-xs font-bold flex items-center justify-between">
              Kolaborator
              <span className="text-[10px] text-slate-400 font-normal">
                Optional
              </span>
            </Label>
            <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
              Tambahkan member lain yang ikut mengerjakan tugas ini.
            </p>

            {/* Added Collaborators Chips */}
            {collaborators.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {collaborators.map((id) => {
                  const user = users.find((u) => u.id === id);
                  return user ? (
                    <div
                      key={id}
                      className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-full text-xs font-bold border border-blue-100"
                    >
                      <img
                        src={user.image || "https://i.pravatar.cc/150"}
                        alt={user.name}
                        className="w-4 h-4 rounded-full"
                      />
                      {user.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveCollaborator(id)}
                        className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            )}

            <Select
              onValueChange={(value) => value && handleAddCollaborator(value)}
              value={undefined}
            >
              <SelectTrigger className="w-full text-sm">
                <SelectValue placeholder="Cari rekan tim..." />
              </SelectTrigger>
              <SelectContent>
                {users
                  .filter((u) => !collaborators.includes(u.id))
                  .map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      <div className="flex items-center gap-2">
                        <img
                          src={u.image || "https://i.pravatar.cc/150"}
                          alt={u.name}
                          className="w-5 h-5 rounded-full bg-slate-100"
                        />
                        <span className="font-medium">{u.name}</span>{" "}
                        <span className="text-[10px] text-slate-400">
                          (@{u.username})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                {users.filter((u) => !collaborators.includes(u.id)).length ===
                  0 && (
                  <div className="p-2 text-xs text-center text-slate-400">
                    Tidak ada pengguna lain.
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || files.length === 0 || !selectedProjectId}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 font-black shadow-lg shadow-slate-200 transition-all overflow-hidden relative"
        >
          {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
            <div
              className="absolute left-0 top-0 bottom-0 bg-blue-600/30 transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          )}

          <div className="relative z-10 flex items-center justify-center">
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin mr-2"></div>
                {uploadPhase || "Mengunggah..."}{" "}
                {uploadProgress > 0 && uploadProgress < 100
                  ? `(${uploadProgress}%)`
                  : ""}
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" /> Publikasikan Tugas
              </>
            )}
          </div>
        </Button>
      </form>
    </div>
  );
}
