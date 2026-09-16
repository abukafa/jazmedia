"use client";

import { useState } from "react";
import { ImagePostEmbed } from "./ImagePostEmbed";
import { VideoPostEmbed } from "./VideoPostEmbed";
import dynamic from "next/dynamic";
const DocumentPostEmbed = dynamic(() => import('./DocumentPostEmbed').then(mod => mod.DocumentPostEmbed), { ssr: false });

interface MediaCarouselProps {
  urls: string[];
  mediaType: "image" | "video" | "document";
  isFs?: boolean;
  activeSlide: number;
  onActiveSlideChange: (index: number) => void;
}

export function MediaCarousel({ urls, mediaType, isFs = false, activeSlide, onActiveSlideChange }: MediaCarouselProps) {
  const validUrls = (urls || []).filter(
    (url) => typeof url === "string" && url.trim().length > 0,
  );

  if (validUrls.length === 0) {
    return null;
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    if (width > 0) {
      onActiveSlideChange(Math.round(scrollLeft / width));
    }
  };

  const renderMedia = (url: string, index: number) => {
    if (mediaType === "video") {
      return <VideoPostEmbed key={`vid-${index}`} url={url} isFs={isFs} />;
    }
    
    if (mediaType === "document") {
      return <DocumentPostEmbed key={`doc-${index}`} url={url} isFs={isFs} />;
    }

    return <ImagePostEmbed key={`img-${index}`} url={url} index={index} isFs={isFs} />;
  };

  return (
    <>
      <div 
        className={`flex overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full ${isFs ? 'h-full items-center' : 'h-auto items-center'}`}
        onScroll={handleScroll}
      >
        {validUrls.map((url, index) => (
          <div key={`slide-${index}`} className={`flex-none w-full snap-center relative ${isFs ? 'h-full flex items-center justify-center' : 'h-auto'}`}>
            {renderMedia(url, index)}
          </div>
        ))}
      </div>

      {validUrls.length > 1 && (
        <div className={`absolute left-0 right-0 flex justify-center gap-1.5 z-20 pointer-events-none ${isFs ? 'bottom-6 gap-2' : 'bottom-3'}`}>
          {validUrls.map((_, i) => (
            <div 
              key={i} 
              className={`rounded-full transition-all duration-300 ${isFs ? 'w-2 h-2' : 'w-1.5 h-1.5'} ${
                activeSlide === i 
                  ? `bg-white scale-125 ${isFs ? 'shadow-[0_0_10px_rgba(255,255,255,0.8)]' : ''}` 
                  : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}
