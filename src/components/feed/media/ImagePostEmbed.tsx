import { getDirectMediaUrl } from "@/lib/utils/media";

interface ImagePostEmbedProps {
  url: string;
  index: number;
  isFs?: boolean;
}

export function ImagePostEmbed({ url, index, isFs = false }: ImagePostEmbedProps) {
  if (!url || typeof url !== "string" || !url.trim()) {
    return null;
  }

  const directUrl = getDirectMediaUrl(url, "image");
  if (!directUrl || !directUrl.trim()) {
    return null;
  }
  
  return (
    <img 
      src={directUrl} 
      alt={`Task Media ${index + 1}`} 
      className={`w-full ${isFs ? 'h-full object-contain' : 'h-auto max-h-[85vh] object-contain'}`}
      loading="lazy"
    />
  );
}
