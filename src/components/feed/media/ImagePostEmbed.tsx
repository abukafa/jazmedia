import { getDirectMediaUrl } from "@/lib/utils/media";

interface ImagePostEmbedProps {
  url: string;
  index: number;
  isFs?: boolean;
}

export function ImagePostEmbed({ url, index, isFs = false }: ImagePostEmbedProps) {
  const directUrl = getDirectMediaUrl(url, "image");
  
  return (
    <img 
      src={directUrl} 
      alt={`Task Media ${index + 1}`} 
      className={`w-full ${isFs ? 'h-full object-contain' : 'h-auto max-h-[85vh] object-contain'}`}
      loading="lazy"
    />
  );
}
