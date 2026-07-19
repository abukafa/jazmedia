import { getDirectMediaUrl } from "@/lib/utils/media";
import { useState, useRef, useEffect } from "react";
import { useInView } from "react-intersection-observer";

interface VideoPostEmbedProps {
  url: string;
  isFs?: boolean;
}

export function VideoPostEmbed({ url, isFs = false }: VideoPostEmbedProps) {
  const videoUrl = getDirectMediaUrl(url, "video");
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Extract ID if it's a Drive URL and use our local API route to stream
  let streamUrl = videoUrl;
  if (videoUrl.includes('drive.google.com/uc')) {
    const urlObj = new URL(videoUrl);
    const id = urlObj.searchParams.get('id');
    if (id) {
      streamUrl = `/api/drive/stream/${id}`;
    }
  }

  // 1. InView for Lazy Loading (loads slightly before entering viewport)
  const { ref: loadRef, inView: isNearViewport } = useInView({
    rootMargin: "400px 0px",
    triggerOnce: true,
  });

  // 2. InView for Autoplay (70% visible)
  const { ref: playRef, inView: isVisibleForPlay } = useInView({
    threshold: 0.7,
  });

  useEffect(() => {
    if (videoRef.current) {
      if (isVisibleForPlay) {
        videoRef.current.play().catch(error => {
          console.log("Autoplay prevented:", error);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isVisibleForPlay]);

  return (
    <div 
      ref={(node) => {
        loadRef(node);
        playRef(node);
      }}
      className={`w-full bg-black flex flex-col relative ${isFs ? 'h-full' : 'h-[60vh] min-h-[400px]'}`}
    >
      {isNearViewport ? (
        <video
          ref={videoRef}
          src={streamUrl}
          className="w-full h-full object-contain"
          controls
          controlsList="nodownload"
          playsInline
          preload="metadata"
          muted // Muted required for reliable autoplay on mobile
          loop
        />
      ) : (
        <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500 text-sm">
          Loading...
        </div>
      )}
    </div>
  );
}
