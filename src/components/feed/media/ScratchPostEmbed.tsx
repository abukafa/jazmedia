import { useMemo } from "react";
import { Gamepad2 } from "lucide-react";

interface ScratchPostEmbedProps {
  url: string;
  isFs?: boolean;
}

export function ScratchPostEmbed({ url, isFs = false }: ScratchPostEmbedProps) {
  // Extract project ID from URL
  // Matches URLs like https://scratch.mit.edu/projects/1383552834/ or https://scratch.mit.edu/projects/1383552834/embed
  const projectId = useMemo(() => {
    if (!url) return null;
    const match = url.match(/scratch\.mit\.edu\/projects\/(\d+)/);
    return match ? match[1] : null;
  }, [url]);

  if (!projectId) {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-100 rounded-xl overflow-hidden w-full ${isFs ? "h-full" : "aspect-video"}`}>
        <Gamepad2 className="w-12 h-12 text-slate-300 mb-2" />
        <p className="text-slate-500 text-sm font-medium">Link Scratch tidak valid</p>
      </div>
    );
  }

  const embedUrl = `https://scratch.mit.edu/projects/${projectId}/embed`;

  return (
    <div className={`relative w-full flex items-center justify-center ${isFs ? "h-full" : "aspect-[485/402]"}`}>
      <iframe 
        src={embedUrl} 
        width="485" 
        height="402" 
        frameBorder="0" 
        scrolling="no" 
        allowFullScreen
        className={`max-w-full max-h-full ${isFs ? "w-[485px] h-[402px] object-contain" : ""}`}
      ></iframe>
    </div>
  );
}
