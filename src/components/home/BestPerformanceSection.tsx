"use client";

import { useQuery } from "@tanstack/react-query";
import { getBestPerformanceTasks } from "@/lib/actions/task";
import { TaskCard } from "@/components/feed/TaskCard";

function getTimeAgo(dateString: string) {
  if (!dateString) return "Baru saja";
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Baru saja";

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} jam lalu`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} hari lalu`;

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks} minggu lalu`;

  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} bulan lalu`;
}

export default function BestPerformanceSection() {
  const { data: tasks = [], isLoading: loading } = useQuery({
    queryKey: ["home", "bestTasks"],
    queryFn: async () => {
      const res = await getBestPerformanceTasks();
      return res?.success && res.data ? res.data : [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (loading) {
    return (
      <div className="my-6 px-5 flex justify-center">
        <div className="w-full h-[180px] rounded-3xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 mb-0">
      <div className="flex flex-col gap-4 px-5 py-2 pb-4">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className="w-full relative"
          >
            {/* Ranking Badge */}
            <div className="absolute -top-3 -left-2 w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white font-bold flex items-center justify-center shadow-lg border-2 border-white z-20">
              #{index + 1}
            </div>

            <TaskCard {...task} timeAgo={getTimeAgo(task.createdAt)} />
          </div>
        ))}
      </div>
    </div>
  );
}
