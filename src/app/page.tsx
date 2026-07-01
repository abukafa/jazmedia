"use client";

import { TaskCard } from "@/components/feed/TaskCard";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getTasks } from "@/lib/actions/task";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { ref, inView } = useInView();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['tasks'],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await getTasks({ pageParam });
      return res;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  // Fallback mock data if DB is empty or fails
  const showFallback = status === "success" && data.pages[0].data.length === 0;

  return (
    <div className="pt-4 pb-8">
      <div className="px-4">
        {status === "pending" ? (
          <div className="py-32 flex flex-col justify-center items-center gap-3 text-slate-400">
             <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
             <span className="text-sm font-medium">Memuat tugas terbaru...</span>
          </div>
        ) : status === "error" ? (
          <div className="py-20 text-center text-red-500 font-bold">Error mengambil data dari server. Pastikan MongoDB berjalan.</div>
        ) : (
          <>
            {data.pages.map((page, i) => (
              <div key={i}>
                {page.data.map((task: any) => (
                  <TaskCard key={task.id} {...task} />
                ))}
              </div>
            ))}

            {showFallback && (
              <div className="py-20 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">📭</span>
                </div>
                <p className="text-sm font-bold text-slate-900">Belum ada tugas</p>
                <p className="text-xs text-slate-500 mt-1">Jadilah yang pertama mengunggah tugas!</p>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Loading Indicator for Infinite Scroll */}
      {status === "success" && !showFallback && (
        <div ref={ref} className="py-8 flex justify-center items-center gap-2 text-slate-400 h-10">
          {isFetchingNextPage ? (
            <>
              <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-xs font-medium">Memuat postingan lama...</span>
            </>
          ) : hasNextPage ? (
            <span className="text-xs font-medium">Scroll untuk memuat lagi</span>
          ) : (
            <span className="text-xs font-medium">Tidak ada postingan lagi</span>
          )}
        </div>
      )}
    </div>
  );
}
