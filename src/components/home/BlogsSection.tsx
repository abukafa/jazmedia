"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Heart, ArrowRight, Clock } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DUMMY_BLOGS } from "@/lib/data/blogs";

// Tripled array for infinite swipe: [0..4] (left buffer), [5..9] (middle set), [10..14] (right buffer)
const LOOP_BLOGS = [...DUMMY_BLOGS, ...DUMMY_BLOGS, ...DUMMY_BLOGS];
const SET_SIZE = DUMMY_BLOGS.length;

export default function BlogsSection() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitializedRef = useRef(false);

  // activeCardIndex tracks 0..14 (the exact card in viewport center)
  const [activeCardIndex, setActiveCardIndex] = useState(SET_SIZE);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  // Real 0..4 index for pagination dots & header counter
  const activeIndex = activeCardIndex % SET_SIZE;

  const updateCardStyles = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return 0;

    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;
    const maxDistance = containerRect.width * 0.75;

    let closestIndex = 0;
    let minDistance = Infinity;

    LOOP_BLOGS.forEach((_, index) => {
      const cardEl = cardRefs.current[index];
      if (!cardEl) return;
      const cardRect = cardEl.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distance = Math.abs(containerCenter - cardCenter);

      // Smooth scale and opacity calculated in real-time without CSS transition delay
      const progress = Math.min(1, distance / maxDistance);
      const scale = 1.05 - progress * 0.17; // 1.05 in center -> 0.88 on sides
      const opacity = 1 - progress * 0.25; // 1.0 in center -> 0.75 on sides

      cardEl.style.transform = `scale(${scale.toFixed(3)})`;
      cardEl.style.opacity = `${opacity.toFixed(2)}`;
      cardEl.style.zIndex = distance < maxDistance * 0.4 ? "10" : "1";

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== activeCardIndex) {
      setActiveCardIndex(closestIndex);
    }

    return closestIndex;
  }, [activeCardIndex]);

  const handleScroll = useCallback(() => {
    const closestIndex = updateCardStyles();

    // Silent infinite loop reset when scrolling pauses
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }

    resetTimeoutRef.current = setTimeout(() => {
      const el = scrollRef.current;
      if (!el) return;

      let targetIndex = -1;
      // If drifted into left clone group (indices 0..4)
      if (closestIndex < SET_SIZE) {
        targetIndex = closestIndex + SET_SIZE;
      }
      // If drifted into right clone group (indices 10..14)
      else if (closestIndex >= SET_SIZE * 2) {
        targetIndex = closestIndex - SET_SIZE;
      }

      if (targetIndex !== -1) {
        const currentCard = cardRefs.current[closestIndex];
        const targetCard = cardRefs.current[targetIndex];
        if (currentCard && targetCard) {
          const diff = targetCard.offsetLeft - currentCard.offsetLeft;
          // 1. Temporarily disable scroll-snap so browser doesn't animate jump
          el.style.scrollSnapType = "none";
          // 2. Reposition scrollLeft instantaneously
          el.scrollLeft += diff;
          // 3. Immediately update activeCardIndex & synchronously apply scale/opacity
          setActiveCardIndex(targetIndex);
          updateCardStyles();
          // 4. Restore scroll-snap cleanly on next frame
          requestAnimationFrame(() => {
            el.style.scrollSnapType = "";
          });
        }
      }
    }, 150);
  }, [updateCardStyles]);

  const scrollToCardInstant = useCallback((index: number) => {
    const cardEl = cardRefs.current[index];
    const container = scrollRef.current;
    if (cardEl && container) {
      const containerWidth = container.clientWidth;
      const cardWidth = cardEl.clientWidth;
      container.scrollLeft =
        cardEl.offsetLeft - (containerWidth - cardWidth) / 2;
    }
  }, []);

  useEffect(() => {
    if (!hasInitializedRef.current) {
      // Immediately center the first item of the middle set (index 5)
      scrollToCardInstant(SET_SIZE);
      hasInitializedRef.current = true;
      updateCardStyles();
    }

    window.addEventListener("resize", handleScroll);
    return () => window.removeEventListener("resize", handleScroll);
  }, [handleScroll, scrollToCardInstant, updateCardStyles]);

  const scrollToCard = (index: number) => {
    const cardEl = cardRefs.current[index];
    if (cardEl && scrollRef.current) {
      cardEl.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  const toggleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="my-3">
      <div className="flex items-center justify-between px-8 mb-1 py-2">
        <h2 className="text-xl sm:text-2xl font-bold text-blue-600 tracking-tight">
          Blogs &amp; Insights
        </h2>
        {/* {activeIndex + 1} of {SET_SIZE} -> link ke /blogs */}
        <Link
          href="/blogs"
          className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1 bg-slate-100 hover:bg-blue-50 px-2.5 py-1 rounded-full"
          title="Lihat semua artikel blog"
        >
          {activeIndex + 1} of {SET_SIZE}
        </Link>
      </div>

      {/* Swipeable Carousel Container with Infinite Swipe + Zero-Flicker Zoom-In/Out */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex items-center gap-3.5 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-[12.5%] py-6 -my-3 select-none"
      >
        {LOOP_BLOGS.map((blog, index) => {
          const isLiked = !!likedPosts[blog.id];
          // Use modulo so all clones of the active blog share the same border/shadow state (0 shadow flicker on jump)
          const isCenter = index % SET_SIZE === activeIndex;

          return (
            <div
              key={`${blog.id}-${index}`}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              onClick={() => router.push(`/blogs/${blog.id}`)}
              className="w-[75%] sm:w-[320px] flex-shrink-0 snap-center cursor-pointer rounded-3xl mb-4"
              style={{
                transformOrigin: "center center",
              }}
            >
              <div
                className={`flex flex-col h-[300px] sm:h-[315px] bg-white rounded-3xl overflow-hidden border ${
                  isCenter
                    ? "border-blue-200/80 shadow-2xl shadow-blue-500/15 ring-1 ring-blue-500/30"
                    : "border-slate-100 shadow-sm"
                }`}
              >
                {/* Landscape Image Header without hover scale jitter */}
                <div className="h-[150px] sm:h-[160px] relative overflow-hidden bg-slate-100 group">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    {blog.category}
                  </div>

                  {/* Heart / Like Button */}
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={(e) => toggleLike(e, blog.id)}
                    className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 backdrop-blur-md shadow-md flex items-center justify-center transition-colors ${
                      isLiked
                        ? "text-rose-600 bg-rose-50/95"
                        : "text-slate-400 hover:text-rose-500"
                    }`}
                    aria-label="Like post"
                  >
                    <Heart
                      className="w-4 h-4"
                      fill={isLiked ? "currentColor" : "none"}
                    />
                  </motion.button>

                  {/* Read time badge */}
                  <div className="absolute bottom-2.5 left-3 flex items-center gap-1 text-white/90 text-[11px] font-medium bg-black/30 backdrop-blur-sm px-2.5 py-0.5 rounded-full">
                    <Clock className="w-3 h-3" />
                    <span>{blog.readTime}</span>
                  </div>
                </div>

                {/* Content Footer */}
                <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between bg-white">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                      {blog.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100/80 mt-2">
                    <span className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                      read more
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>

                    <span className="text-[11px] font-medium text-slate-400">
                      {blog.date}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-1">
        {DUMMY_BLOGS.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              scrollToCard(idx + SET_SIZE); // Jump to corresponding card in middle set
            }}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === activeIndex
                ? "w-6 bg-blue-600"
                : "w-1.5 bg-slate-200 hover:bg-slate-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
