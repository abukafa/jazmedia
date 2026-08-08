"use client";

import { useState, useEffect, useRef } from "react";
import { Trophy } from "lucide-react";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    async function loadBestTasks() {
      const res = await getBestPerformanceTasks();
      if (res && res.success && res.data) {
        setTasks(res.data);
      }
      setLoading(false);
    }
    loadBestTasks();
  }, []);

  // Auto-swipe right (moving items right, scrolling left)
  useEffect(() => {
    if (tasks.length === 0 || isHovered) return;

    const timer = setInterval(() => {
      const container = scrollRef.current;
      if (!container) return;

      const cardWidth =
        container.querySelector("div.shrink-0")?.clientWidth || 0;
      if (cardWidth === 0) return;

      // Scroll left by one card width
      if (container.scrollLeft <= 0) {
        // If at the start, jump to the end
        container.scrollTo({
          left: container.scrollWidth,
          behavior: "smooth",
        });
      } else {
        container.scrollBy({
          left: -(cardWidth + 16), // width + gap
          behavior: "smooth",
        });
      }
    }, 4500);

    return () => clearInterval(timer);
  }, [tasks.length, isHovered]);

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
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
        className="flex items-start gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-5 py-4 pb-12 -my-2"
        style={{ scrollBehavior: "auto" }}
      >
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className="w-[85vw] sm:w-[380px] shrink-0 snap-center relative"
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
