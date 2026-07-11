import { getPreviewUrl } from "@/lib/utils/media";

interface DocumentPostEmbedProps {
  url: string;
  isFs?: boolean;
}

export function DocumentPostEmbed({ url, isFs = false }: DocumentPostEmbedProps) {
  const previewUrl = getPreviewUrl(url);
  
  return (
    <div className={`w-full bg-slate-100 flex flex-col relative ${isFs ? 'h-full' : 'h-[60vh] min-h-[400px]'}`}>
      <iframe 
        src={previewUrl} 
        className="w-full h-full border-none pointer-events-auto"
        title="Document Preview"
        allow="autoplay"
      />
    </div>
  );
}
