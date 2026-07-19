import { getDirectMediaUrl } from "@/lib/utils/media";
import { useState, useRef } from "react";

interface VideoPostEmbedProps {
  url: string;
  isFs?: boolean;
}

export function VideoPostEmbed({ url, isFs = false }: VideoPostEmbedProps) {
  const videoUrl = getDirectMediaUrl(url, "video");
  
  // Extract ID if it's a Drive URL and use our local API route to stream
  let streamUrl = videoUrl;
  if (videoUrl.includes('drive.google.com/uc')) {
    const urlObj = new URL(videoUrl);
    const id = urlObj.searchParams.get('id');
    if (id) {
      streamUrl = `/api/drive/stream/${id}`;
    }
  }

  return (
    <div className={`w-full bg-black flex flex-col relative ${isFs ? 'h-full' : 'h-[60vh] min-h-[400px]'}`}>
      <video
        src={streamUrl}
        className="w-full h-full object-contain"
        controls
        controlsList="nodownload"
        playsInline
        preload="metadata"
      />
    </div>
  );
}
