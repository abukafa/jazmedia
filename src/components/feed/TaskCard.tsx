"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, Star, Maximize2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MediaCarousel } from "./media/MediaCarousel";

export interface TaskCardProps {
  id: string;
  author: {
    name: string;
    image: string;
  };
  collaborators?: {
    name: string;
    image: string;
  }[];
  projectTitle: string;
  mediaUrl: string;
  mediaUrls?: string[];
  mediaType: "image" | "video" | "document";
  caption: string;
  review?: {
    grade: number;
    comment: string;
    mentorName: string;
  };
  timeAgo: string;
}

export function TaskCard({
  author,
  collaborators = [],
  projectTitle,
  mediaUrl,
  mediaUrls = [],
  mediaType,
  caption,
  review,
  timeAgo,
}: TaskCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const urls = mediaUrls.length > 0 ? mediaUrls : [mediaUrl];

  const getDisplayNames = () => {
    if (!collaborators || collaborators.length === 0) return author.name;
    const names = [author.name, ...collaborators.map((c) => c.name)];
    if (names.length <= 2) {
      return names.slice(0, -1).join(", ") + " dan " + names[names.length - 1];
    }
    return names.slice(0, 1).join(", ") + ` dan ${names.length - 1} lainnya`;
  };

  return (
    <>
      <Card className="mb-6 overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white transition-all rounded-3xl">
        <CardHeader className="flex flex-row items-center gap-3 px-4 pb-3 py-0">
          <div className="flex -space-x-3">
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100 relative z-30">
              <AvatarImage src={author.image} alt={author.name} />
              <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {collaborators.slice(0, 2).map((collab, i) => (
              <Avatar
                key={i}
                className={`h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100 relative ${
                  i === 0 ? "z-20" : "z-10"
                }`}
              >
                <AvatarImage src={collab.image} alt={collab.name} />
                <AvatarFallback>{collab.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <div className="flex flex-col flex-1">
            <p className="text-sm font-bold text-slate-900 leading-none truncate">
              {getDisplayNames()}
            </p>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {projectTitle} • {timeAgo}
            </p>
          </div>
          {review && (
            <Badge
              variant="secondary"
              className="bg-amber-100 text-amber-800 hover:bg-amber-200 font-extrabold px-2 py-1 shadow-sm border border-amber-200/50"
            >
              <Star className="w-3.5 h-3.5 mr-1 fill-amber-500 text-amber-500" />
              {review.grade}
            </Badge>
          )}
        </CardHeader>

        <div
          className="relative w-full overflow-hidden group cursor-pointer bg-black"
          onDoubleClick={() => setIsLiked(true)}
        >
          {/* Main Media Carousel extracted to component */}
          <MediaCarousel
            urls={urls}
            mediaType={mediaType}
            activeSlide={activeSlide}
            onActiveSlideChange={setActiveSlide}
          />

          {/* Fullscreen Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreen(true);
            }}
            className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-md transition-colors z-20"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Like animation overlay */}
          <AnimatePresence>
            {isLiked && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1.2 }}
                exit={{ opacity: 0, scale: 1 }}
                onAnimationComplete={() =>
                  setTimeout(() => setIsLiked(false), 800)
                }
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
              >
                <Heart className="w-28 h-28 text-white fill-white drop-shadow-2xl opacity-90" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <CardContent className="px-4 pt-3 py-0">
          <div className="flex items-center gap-4 mb-3">
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={() => setIsLiked(!isLiked)}
              className="focus:outline-none"
            >
              <Heart
                className={`w-7 h-7 transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-slate-800 hover:text-slate-600"}`}
              />
            </motion.button>
            <button className="focus:outline-none text-slate-800 hover:text-slate-600 transition-colors">
              <MessageCircle className="w-7 h-7" />
            </button>
            <button className="focus:outline-none text-slate-800 hover:text-slate-600 transition-colors ml-auto">
              <Share2 className="w-6 h-6" />
            </button>
          </div>

          <p className="text-sm text-slate-800 leading-relaxed">
            <span className="font-bold mr-2 text-slate-900">{author.name}</span>
            {caption}
          </p>
        </CardContent>

        {review && (
          <div className="px-4 pb-0 mt-3">
            <button
              onClick={() => setShowReview(!showReview)}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              {showReview
                ? "Sembunyikan ulasan mentor"
                : "Lihat ulasan mentor..."}
            </button>

            <AnimatePresence>
              {showReview && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-xl relative shadow-inner">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-indigo-500 rounded-l-xl"></div>
                    <p className="text-xs font-bold text-slate-900 mb-1.5 flex items-center">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500 mr-1" />
                      {review.mentorName}{" "}
                      <span className="text-slate-500 font-medium ml-1">
                        mengulas:
                      </span>
                    </p>
                    <p className="text-sm text-slate-700 italic">
                      "{review.comment}"
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </Card>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 z-50 text-white/70 hover:text-white p-2 rounded-full bg-black/20 hover:bg-black/50 transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex-1 w-full h-full flex flex-col justify-center items-center relative">
              <MediaCarousel
                urls={urls}
                mediaType={mediaType}
                activeSlide={activeSlide}
                onActiveSlideChange={setActiveSlide}
                isFs={true}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
