import { getPreviewUrl } from "@/lib/utils/media";

interface VideoPostEmbedProps {
  url: string;
  isFs?: boolean;
}

export function VideoPostEmbed({ url, isFs = false }: VideoPostEmbedProps) {
  const previewUrl = getPreviewUrl(url);

  return (
    <div className={`w-full bg-black flex flex-col relative ${isFs ? 'h-full' : 'h-[60vh] min-h-[400px]'}`}>
      <iframe 
        src={previewUrl} 
        className="w-full h-full border-none"
        title="Video Player"
        allow="autoplay; fullscreen"
        allowFullScreen
      />
    </div>
  );
}
