"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Trophy,
  AlertTriangle,
  BookOpen,
  Compass,
  Heart,
  Eye,
  BarChart3,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useAlert } from "@/components/providers/AlertProvider";
import {
  submitReflection,
  getStudentsForSelect,
  StudentSelectItem,
} from "@/lib/actions/reflection";
import { getMetricColor } from "@/lib/utils/metric-color";

export default function CreateReflectionPage() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { data: session, status } = useSession();

  const userRole = ((session?.user as any)?.role || "").toLowerCase();
  const isAdmin = userRole === "admin" || userRole === "mentor";
  const [students, setStudents] = useState<StudentSelectItem[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null,
  );
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      setIsLoadingStudents(true);
      getStudentsForSelect()
        .then((res) => {
          if (res.success) {
            setStudents(res.data);
          }
        })
        .finally(() => setIsLoadingStudents(false));
    }
  }, [isAdmin]);

  const [date, setDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });

  // 5 Metrics states
  const [achVal, setAchVal] = useState<number>(75);
  const [achDesc, setAchDesc] = useState<string>("");

  const [obsVal, setObsVal] = useState<number>(30);
  const [obsDesc, setObsDesc] = useState<string>("");

  const [lesVal, setLesVal] = useState<number>(80);
  const [lesDesc, setLesDesc] = useState<string>("");

  const [prioVal, setPrioVal] = useState<number>(85);
  const [prioDesc, setPrioDesc] = useState<string>("");

  const [hlthVal, setHlthVal] = useState<number>(90);
  const [hlthDesc, setHlthDesc] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/profile");
    }
  }, [status, router]);

  // Dynamic colors based on values
  const achColor = getMetricColor(achVal);
  const obsColor = getMetricColor(obsVal, true);
  const lesColor = getMetricColor(lesVal);
  const prioColor = getMetricColor(prioVal);
  const hlthColor = getMetricColor(hlthVal);
  const avgScore = Math.round(
    (achVal + obsVal + lesVal + prioVal + hlthVal) / 5,
  );
  const avgColor = getMetricColor(avgScore);

  // Generate live narrative paragraph matching backend formatter
  const generateNarrative = () => {
    const parts: string[] = [];
    if (achDesc.trim()) {
      const clean = achDesc.trim().replace(/\.+$/, "");
      parts.push(
        `Minggu ini, saya berhasil ${clean.charAt(0).toLowerCase() + clean.slice(1)}.`,
      );
    }
    if (obsDesc.trim()) {
      const clean = obsDesc.trim().replace(/\.+$/, "");
      parts.push(
        `Kendala yang dihadapi: ${clean.charAt(0).toLowerCase() + clean.slice(1)}.`,
      );
    }
    if (lesDesc.trim()) {
      const clean = lesDesc.trim().replace(/\.+$/, "");
      parts.push(
        `Pelajaran yang dipetik adalah ${clean.charAt(0).toLowerCase() + clean.slice(1)}.`,
      );
    }
    if (prioDesc.trim()) {
      const clean = prioDesc.trim().replace(/\.+$/, "");
      parts.push(
        `Fokus prioritas ke depan adalah ${clean.charAt(0).toLowerCase() + clean.slice(1)}.`,
      );
    }
    if (hlthDesc.trim()) {
      const clean = hlthDesc.trim().replace(/\.+$/, "");
      parts.push(
        `Kondisi kesehatan dan stamina: ${clean.charAt(0).toLowerCase() + clean.slice(1)}.`,
      );
    }
    return parts.join(" ");
  };

  const narrativePreview = generateNarrative();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      showAlert({
        message: "Silakan pilih tanggal refleksi.",
        type: "warning",
      });
      return;
    }

    if (
      !achDesc.trim() &&
      !obsDesc.trim() &&
      !lesDesc.trim() &&
      !prioDesc.trim() &&
      !hlthDesc.trim()
    ) {
      showAlert({
        message:
          "Harap isi minimal salah satu deskripsi capaian, kendala, pelajaran, prioritas, atau kesehatan.",
        type: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitReflection({
        date,
        admin_student_id:
          isAdmin && selectedStudentId ? selectedStudentId : undefined,
        achievement: { nilai: achVal, deskripsi: achDesc },
        obstacles: { nilai: obsVal, deskripsi: obsDesc },
        lessons: { nilai: lesVal, deskripsi: lesDesc },
        priority: { nilai: prioVal, deskripsi: prioDesc },
        health: { nilai: hlthVal, deskripsi: hlthDesc },
      });

      if (res.success) {
        showAlert({
          message: "Refleksi berhasil disimpan!",
          type: "success",
        });
        router.push("/reflections");
      } else {
        showAlert({
          message: res.error || "Gagal menyimpan refleksi.",
          type: "error",
        });
      }
    } catch (err: any) {
      showAlert({
        message: err.message || "Terjadi kesalahan saat menyimpan refleksi.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-6 pb-12 px-4 max-w-2xl mx-auto bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/post"
            className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              Refleksi Mingguan
            </h1>
            <p className="text-xs text-slate-500">
              5 aspek performa & progres mu
            </p>
          </div>
        </div>

        <Link
          href="/reflections"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
        >
          Lihat Feed
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Khusus Admin: Pilih Siswa */}
        {isAdmin && (
          <div className="bg-white rounded-2xl border border-indigo-200/80 p-4 shadow-sm bg-gradient-to-br from-indigo-50/40 via-white to-white space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" />
                Target Student
              </label>
              <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-100/80 px-2.5 py-0.5 rounded-full">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Refleksi atas nama siswa. Jika tidak dipilih akan disimpan a/n
              admin.
            </p>
            {isLoadingStudents ? (
              <div className="text-xs text-slate-400 py-2">
                Memuat daftar siswa...
              </div>
            ) : (
              <select
                value={selectedStudentId ?? ""}
                onChange={(e) =>
                  setSelectedStudentId(
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                className="w-full h-11 px-3 rounded-xl bg-slate-50/70 border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              >
                <option value="">-- Admin (Default) --</option>
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Tanggal Refleksi */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Tanggal Refleksi (Pekan Ini)
          </label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full h-11 rounded-xl bg-slate-50/70 border-slate-200 font-medium text-slate-800"
          />
        </div>

        {/* 1. Capaian (Achievement) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg ${achColor.iconBg} flex items-center justify-center transition-colors duration-300`}
              >
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  1. Achievement
                </h3>
                <p className="text-[11px] text-slate-500">
                  Pencapaian terbesar kamu di pekan ini
                </p>
              </div>
            </div>
            <div
              className={`px-2.5 py-1 rounded-full border text-xs font-bold transition-colors duration-300 ${achColor.badge}`}
            >
              {achVal}%
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-500 mb-1">
              <span>Rendah (0%)</span>
              <span className="font-semibold text-slate-700">
                Skor Perform: {achVal}%
              </span>
              <span>Maksimal (100%)</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={achVal}
              onChange={(e) => setAchVal(Number(e.target.value))}
              className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer ${achColor.accent} transition-all`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Deskripsi Pencapaian
            </label>
            <Textarea
              value={achDesc}
              onChange={(e) => setAchDesc(e.target.value)}
              placeholder="Contoh: menyelesaikan hafalan juz 26, mengerti coding basic dan algoritma..."
              rows={2}
              className="w-full text-xs rounded-xl bg-slate-50/70 border-slate-200 focus:bg-white resize-none"
            />
          </div>
        </div>

        {/* 2. Kendala (Obstacles) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg ${obsColor.iconBg} flex items-center justify-center transition-colors duration-300`}
              >
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  2. Obstacles
                </h3>
                <p className="text-[11px] text-slate-500">
                  Kesulitan yang dialami dan cara mu mengatasinya
                </p>
              </div>
            </div>
            <div
              className={`px-2.5 py-1 rounded-full border text-xs font-bold transition-colors duration-300 ${obsColor.badge}`}
            >
              {obsVal}%
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-500 mb-1">
              <span>Lancar (0%)</span>
              <span className="font-semibold text-slate-700">
                Tingkat Kendala: {obsVal}%
              </span>
              <span>Berat (100%)</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={obsVal}
              onChange={(e) => setObsVal(Number(e.target.value))}
              className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer ${obsColor.accent} transition-all`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Deskripsi Kendala
            </label>
            <Textarea
              value={obsDesc}
              onChange={(e) => setObsDesc(e.target.value)}
              placeholder="Contoh: murojaah hafalan lama, mengerjakan perkalian dengan penjumlahan ganda..."
              rows={2}
              className="w-full text-xs rounded-xl bg-slate-50/70 border-slate-200 focus:bg-white resize-none"
            />
          </div>
        </div>

        {/* 3. Pelajaran (Lessons) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg ${lesColor.iconBg} flex items-center justify-center transition-colors duration-300`}
              >
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">3. Lessons</h3>
                <p className="text-[11px] text-slate-500">
                  Pemahaman dan ilmu baru yang diperoleh
                </p>
              </div>
            </div>
            <div
              className={`px-2.5 py-1 rounded-full border text-xs font-bold transition-colors duration-300 ${lesColor.badge}`}
            >
              {lesVal}%
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-500 mb-1">
              <span>Dasar (0%)</span>
              <span className="font-semibold text-slate-700">
                Tingkat Serapan: {lesVal}%
              </span>
              <span>Mendalam (100%)</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={lesVal}
              onChange={(e) => setLesVal(Number(e.target.value))}
              className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer ${lesColor.accent} transition-all`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Deskripsi Pelajaran
            </label>
            <Textarea
              value={lesDesc}
              onChange={(e) => setLesDesc(e.target.value)}
              placeholder="Contoh: pentingnya membaca dalam hafalan, memahami konsep dasar cryptografi..."
              rows={2}
              className="w-full text-xs rounded-xl bg-slate-50/70 border-slate-200 focus:bg-white resize-none"
            />
          </div>
        </div>

        {/* 4. Prioritas (Priority) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg ${prioColor.iconBg} flex items-center justify-center transition-colors duration-300`}
              >
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  4. Focus & Priority
                </h3>
                <p className="text-[11px] text-slate-500">
                  Target persiapan minggu selanjutnya
                </p>
              </div>
            </div>
            <div
              className={`px-2.5 py-1 rounded-full border text-xs font-bold transition-colors duration-300 ${prioColor.badge}`}
            >
              {prioVal}%
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-500 mb-1">
              <span>Santai (0%)</span>
              <span className="font-semibold text-slate-700">
                Kesiapan Fokus: {prioVal}%
              </span>
              <span>Prioritas Tinggi (100%)</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={prioVal}
              onChange={(e) => setPrioVal(Number(e.target.value))}
              className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer ${prioColor.accent} transition-all`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Deskripsi Prioritas
            </label>
            <Textarea
              value={prioDesc}
              onChange={(e) => setPrioDesc(e.target.value)}
              placeholder="Contoh: menyelesaikan tasmi juz 26, menyelesaikan 75% persiapan lomba coding..."
              rows={2}
              className="w-full text-xs rounded-xl bg-slate-50/70 border-slate-200 focus:bg-white resize-none"
            />
          </div>
        </div>

        {/* 5. Kesehatan (Health) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg ${hlthColor.iconBg} flex items-center justify-center transition-colors duration-300`}
              >
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">5. Health</h3>
                <p className="text-[11px] text-slate-500">
                  Kondisi fisik, mental, dan energi belajar
                </p>
              </div>
            </div>
            <div
              className={`px-2.5 py-1 rounded-full border text-xs font-bold transition-colors duration-300 ${hlthColor.badge}`}
            >
              {hlthVal}%
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-500 mb-1">
              <span>Kurang Fit (0%)</span>
              <span className="font-semibold text-slate-700">
                Tingkat Kebugaran: {hlthVal}%
              </span>
              <span>Sangat Prima (100%)</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={hlthVal}
              onChange={(e) => setHlthVal(Number(e.target.value))}
              className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer ${hlthColor.accent} transition-all`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Deskripsi Kondisi Fisik & Mental
            </label>
            <Textarea
              value={hlthDesc}
              onChange={(e) => setHlthDesc(e.target.value)}
              placeholder="Contoh: kondisi fisik prima, waktu tidur terjaga dengan baik, masih sering overthinking..."
              rows={2}
              className="w-full text-xs rounded-xl bg-slate-50/70 border-slate-200 focus:bg-white resize-none"
            />
          </div>
        </div>

        {/* Live Preview: 1 Paragraf Rapi & Grafik 6 Nilai Dinamis */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Live Preview
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              Otomatis Terangkum
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal italic">
            {narrativePreview ||
              "Ketik deskripsi pada formulir di atas untuk melihat bagaimana kelima data dirangkum menjadi 1 paragraf narasi mengalir yang elegan."}
          </p>

          {/* Mini 6-Metric Progress Bars with Dynamic Colors */}
          <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300">Capaian</span>
                <span className={`font-bold ${achColor.text}`}>{achVal}%</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`${achColor.bar} h-full rounded-full transition-all duration-300`}
                  style={{ width: `${achVal}%` }}
                />
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300">Kendala</span>
                <span className={`font-bold ${obsColor.text}`}>{obsVal}%</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`${obsColor.bar} h-full rounded-full transition-all duration-300`}
                  style={{ width: `${obsVal}%` }}
                />
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300">Pelajaran</span>
                <span className={`font-bold ${lesColor.text}`}>{lesVal}%</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`${lesColor.bar} h-full rounded-full transition-all duration-300`}
                  style={{ width: `${lesVal}%` }}
                />
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300">Prioritas</span>
                <span className={`font-bold ${prioColor.text}`}>
                  {prioVal}%
                </span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`${prioColor.bar} h-full rounded-full transition-all duration-300`}
                  style={{ width: `${prioVal}%` }}
                />
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300">Kesehatan</span>
                <span className={`font-bold ${hlthColor.text}`}>
                  {hlthVal}%
                </span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`${hlthColor.bar} h-full rounded-full transition-all duration-300`}
                  style={{ width: `${hlthVal}%` }}
                />
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-2.5 border border-white/20">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-200 font-semibold">Rata-rata</span>
                <span className={`font-bold ${avgColor.text}`}>
                  {avgScore}%
                </span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`${avgColor.bar} h-full rounded-full transition-all duration-300`}
                  style={{ width: `${avgScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center gap-3 pt-2">
          <Link
            href="/post"
            className="w-1/3 text-center py-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition"
          >
            Batal
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-indigo-200 border-t-white rounded-full animate-spin"></div>
                <span>Menyimpan Refleksi...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Publikasikan Refleksi</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
