"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Sparkles,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Trophy,
  AlertTriangle,
  Compass,
  Heart,
  BarChart3,
  ArrowRight,
  Filter,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils/avatar";
import {
  getReflections,
  getMyReflections,
  ReflectionItem,
} from "@/lib/actions/reflection";
import { getMetricColor } from "@/lib/utils/metric-color";

export default function ReflectionsFeedPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");
  const [reflections, setReflections] = useState<ReflectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState<
    Record<string, boolean>
  >({});

  const loadData = async (tab: "all" | "mine", pageNum = 1, append = false) => {
    setIsLoading(true);
    try {
      if (tab === "mine") {
        const res = await getMyReflections();
        if (res.success) {
          setReflections(res.data);
          setHasMore(false);
        }
      } else {
        const res = await getReflections({ page: pageNum, perPage: 10 });
        if (res.success) {
          if (append) {
            setReflections((prev) => [...prev, ...res.data]);
          } else {
            setReflections(res.data);
          }
          setHasMore(Boolean(res.pagination?.hasMore));
        }
      }
    } catch (err) {
      console.error("Failed to load reflections:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    loadData(activeTab, 1, false);
  }, [activeTab]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadData(activeTab, nextPage, true);
  };

  const toggleDetail = (id: string) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderDeltaBadge = (delta: number | null, isObstacle = false) => {
    if (delta === null) {
      return (
        <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
          Baru
        </span>
      );
    }

    if (delta === 0) {
      return (
        <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
          <Minus className="w-2.5 h-2.5 mr-0.5" /> 0%
        </span>
      );
    }

    const isPositiveDelta = delta > 0;
    // For obstacle/kendala, decrease (-delta) is actually a good thing (less obstacles), but we display numeric delta clearly
    const isGood = isObstacle ? !isPositiveDelta : isPositiveDelta;

    const bgClass = isGood
      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
      : "bg-rose-50 text-rose-700 border border-rose-200/60";

    return (
      <span
        className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${bgClass}`}
      >
        {isPositiveDelta ? (
          <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
        ) : (
          <TrendingDown className="w-2.5 h-2.5 mr-0.5" />
        )}
        {isPositiveDelta ? `${delta}%` : `${delta}%`}
      </span>
    );
  };

  return (
    <div className="pt-6 pb-16 px-4 max-w-2xl mx-auto bg-slate-50 min-h-screen">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Feed Refleksi
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Catatan pencapaian dan grafik progres
          </p>
        </div>

        <Link
          href="/reflections/create"
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tulis Refleksi</span>
        </Link>
      </div>

      {/* Tabs Filter: Semua vs Refleksi Saya */}
      <div className="flex items-center bg-slate-200/60 p-1 rounded-xl mb-6 max-w-xs">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === "all"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Semua Refleksi
        </button>
        <button
          onClick={() => setActiveTab("mine")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === "mine"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Refleksi Saya
        </button>
      </div>

      {/* Content Feed */}
      {isLoading && reflections.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm animate-pulse space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200" />
                <div className="space-y-1.5 flex-1">
                  <div className="w-32 h-3.5 bg-slate-200 rounded" />
                  <div className="w-20 h-2.5 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-full h-3 bg-slate-100 rounded" />
                <div className="w-5/6 h-3 bg-slate-100 rounded" />
                <div className="w-4/6 h-3 bg-slate-100 rounded" />
              </div>
              <div className="h-20 bg-slate-50 rounded-xl" />
            </div>
          ))}
        </div>
      ) : reflections.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Belum Ada Refleksi
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {activeTab === "mine"
              ? "Anda belum pernah menulis refleksi mingguan. Mulai evaluasi progres belajar Anda sekarang."
              : "Belum ada postingan refleksi dari siswa. Jadilah yang pertama membagikan refleksi minggu ini!"}
          </p>
          <Link
            href="/reflections/create"
            className="inline-flex items-center gap-1.5 mt-5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            Isi Refleksi Pertama
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reflections.map((ref) => {
            const isExpanded = !!expandedDetails[ref.id];

            const achColor = getMetricColor(ref.metrics.achievement.value);
            const obsColor = getMetricColor(ref.metrics.obstacles.value, true);
            const lesColor = getMetricColor(ref.metrics.lessons.value);
            const prioColor = getMetricColor(ref.metrics.priority.value);
            const hlthColor = getMetricColor(ref.metrics.health?.value ?? 0);
            const avgValue =
              ref.metrics.average?.value ??
              Number(
                (
                  (ref.metrics.achievement.value +
                    ref.metrics.obstacles.value +
                    ref.metrics.lessons.value +
                    ref.metrics.priority.value +
                    (ref.metrics.health?.value ?? 0)) /
                  5
                ).toFixed(1),
              );
            const avgColor = getMetricColor(avgValue);

            return (
              <article
                key={ref.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all space-y-3.5"
              >
                {/* Author Header (Twitter/X style) */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar size="lg">
                      <AvatarImage
                        src={ref.author.image}
                        alt={ref.author.name}
                      />
                      <AvatarFallback>
                        {getInitials(ref.author.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 hover:underline">
                          {ref.author.name}
                        </span>
                        <span className="text-xs text-slate-400">
                          @{ref.author.username}
                        </span>
                        {ref.author.role && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                            {ref.author.role}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {ref.formattedDate || ref.date}
                        </span>
                        <span>•</span>
                        <span>{ref.timeAgo}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1 Paragraf Narasi Rapi */}
                <div className="pt-1">
                  <p className="text-sm text-slate-800 leading-relaxed font-normal selection:bg-indigo-100 selection:text-indigo-900">
                    {ref.narrative || "Refleksi mingguan siswa."}
                  </p>
                </div>

                {/* Card Grafik 6 Nilai & Progres Mingguan Dinamis */}
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Grafik Metrik & Progres</span>
                    </div>

                    <button
                      onClick={() => toggleDetail(ref.id)}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                    >
                      {isExpanded ? (
                        <>
                          Ringkas <ChevronUp className="w-3 h-3" />
                        </>
                      ) : (
                        <>
                          Rincian <ChevronDown className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* 6 Metric Visual Progress Bars with Unified Dynamic Colors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* 1. Capaian */}
                    <div className="bg-white rounded-lg p-2.5 border border-slate-100 shadow-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                          <Trophy className={`w-3 h-3 ${achColor.text}`} />{" "}
                          Capaian
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs font-black ${achColor.text}`}
                          >
                            {ref.metrics.achievement.value}%
                          </span>
                          {renderDeltaBadge(ref.metrics.achievement.delta)}
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`${achColor.bar} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${ref.metrics.achievement.value}%` }}
                        />
                      </div>
                      {isExpanded && ref.metrics.achievement.description && (
                        <p className="mt-2 text-[11px] text-slate-600 border-t border-slate-100 pt-1.5 italic">
                          "{ref.metrics.achievement.description}"
                        </p>
                      )}
                    </div>

                    {/* 2. Kendala */}
                    <div className="bg-white rounded-lg p-2.5 border border-slate-100 shadow-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                          <AlertTriangle
                            className={`w-3 h-3 ${obsColor.text}`}
                          />{" "}
                          Kendala
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs font-black ${obsColor.text}`}
                          >
                            {ref.metrics.obstacles.value}%
                          </span>
                          {renderDeltaBadge(ref.metrics.obstacles.delta, true)}
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`${obsColor.bar} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${ref.metrics.obstacles.value}%` }}
                        />
                      </div>
                      {isExpanded && ref.metrics.obstacles.description && (
                        <p className="mt-2 text-[11px] text-slate-600 border-t border-slate-100 pt-1.5 italic">
                          "{ref.metrics.obstacles.description}"
                        </p>
                      )}
                    </div>

                    {/* 3. Pelajaran */}
                    <div className="bg-white rounded-lg p-2.5 border border-slate-100 shadow-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                          <BookOpen className={`w-3 h-3 ${lesColor.text}`} />{" "}
                          Pelajaran
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs font-black ${lesColor.text}`}
                          >
                            {ref.metrics.lessons.value}%
                          </span>
                          {renderDeltaBadge(ref.metrics.lessons.delta)}
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`${lesColor.bar} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${ref.metrics.lessons.value}%` }}
                        />
                      </div>
                      {isExpanded && ref.metrics.lessons.description && (
                        <p className="mt-2 text-[11px] text-slate-600 border-t border-slate-100 pt-1.5 italic">
                          "{ref.metrics.lessons.description}"
                        </p>
                      )}
                    </div>

                    {/* 4. Prioritas */}
                    <div className="bg-white rounded-lg p-2.5 border border-slate-100 shadow-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                          <Compass className={`w-3 h-3 ${prioColor.text}`} />{" "}
                          Prioritas
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs font-black ${prioColor.text}`}
                          >
                            {ref.metrics.priority.value}%
                          </span>
                          {renderDeltaBadge(ref.metrics.priority.delta)}
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`${prioColor.bar} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${ref.metrics.priority.value}%` }}
                        />
                      </div>
                      {isExpanded && ref.metrics.priority.description && (
                        <p className="mt-2 text-[11px] text-slate-600 border-t border-slate-100 pt-1.5 italic">
                          "{ref.metrics.priority.description}"
                        </p>
                      )}
                    </div>

                    {/* 5. Kesehatan */}
                    {ref.metrics.health && (
                      <div className="bg-white rounded-lg p-2.5 border border-slate-100 shadow-xs">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                            <Heart className={`w-3 h-3 ${hlthColor.text}`} />{" "}
                            Kesehatan
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-xs font-black ${hlthColor.text}`}
                            >
                              {ref.metrics.health.value}%
                            </span>
                            {renderDeltaBadge(ref.metrics.health.delta)}
                          </div>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`${hlthColor.bar} h-full rounded-full transition-all duration-500`}
                            style={{ width: `${ref.metrics.health.value}%` }}
                          />
                        </div>
                        {isExpanded && ref.metrics.health.description && (
                          <p className="mt-2 text-[11px] text-slate-600 border-t border-slate-100 pt-1.5 italic">
                            "{ref.metrics.health.description}"
                          </p>
                        )}
                      </div>
                    )}

                    {/* 6. Rata-rata Skor */}
                    {(() => {
                      const avgDelta = ref.metrics.average?.delta ?? null;

                      return (
                        <div className="bg-slate-900 text-white rounded-lg p-2.5 border border-slate-800 shadow-xs">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1">
                              Rata-rata
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-xs font-black ${avgColor.text}`}
                              >
                                {Math.round(avgValue)}%
                              </span>
                              {renderDeltaBadge(avgDelta)}
                            </div>
                          </div>
                          <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`${avgColor.bar} h-full rounded-full transition-all duration-500`}
                              style={{ width: `${Math.min(avgValue, 100)}%` }}
                            />
                          </div>
                          {isExpanded && (
                            <p className="mt-2 text-[11px] text-slate-400 border-t border-white/10 pt-1.5 italic">
                              "Jumlah rata-rata refleksi"
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </article>
            );
          })}

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-4">
              <Button
                onClick={handleLoadMore}
                disabled={isLoading}
                variant="outline"
                className="rounded-xl px-6 py-2 text-xs font-bold border-slate-200 hover:bg-slate-100"
              >
                {isLoading ? "Memuat..." : "Muat Lebih Banyak Refleksi"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
