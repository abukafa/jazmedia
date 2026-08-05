"use client";

import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { getDirectMediaUrl } from "@/lib/utils/media";
import { Loader2 } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set worker from CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentPostEmbedProps {
  url: string;
  isFs?: boolean;
}

export function DocumentPostEmbed({ url, isFs = false }: DocumentPostEmbedProps) {
  const directUrl = getDirectMediaUrl(url, "document");
  const proxiedUrl = `/api/proxy-pdf?url=${encodeURIComponent(directUrl)}`;
  const [numPages, setNumPages] = useState<number | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Resize observer to keep the PDF pages responsive
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    // Limit to 30 pages maximum as requested
    setNumPages(Math.min(numPages, 30));
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    if (width > 0) {
      setActiveSlide(Math.round(scrollLeft / width));
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`w-full bg-slate-100 flex flex-col relative overflow-hidden ${isFs ? 'h-full' : 'h-auto min-h-[400px]'}`}
    >
      <Document
        file={proxiedUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="text-xs font-bold">Memuat dokumen...</span>
          </div>
        }
        error={
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs font-bold px-4 text-center">
            Gagal memuat dokumen
          </div>
        }
        className="w-full h-full flex"
      >
        {numPages && (
          <div 
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full h-full items-center"
            onScroll={handleScroll}
          >
            {Array.from(new Array(numPages), (el, index) => (
              <div key={`page-${index + 1}`} className="flex-none w-full snap-center flex justify-center items-center p-2 pb-8">
                <Page
                  pageNumber={index + 1}
                  width={containerWidth ? containerWidth - 16 : undefined} // minus padding
                  className="shadow-md rounded-md overflow-hidden bg-white"
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </div>
            ))}
          </div>
        )}
      </Document>

      {/* Navigation Dots */}
      {numPages && numPages > 1 && (
        <div className="absolute left-0 right-0 bottom-2 flex justify-center gap-1.5 z-20 pointer-events-none flex-wrap px-4">
          {Array.from(new Array(numPages), (_, i) => (
            <div 
              key={i} 
              className={`rounded-full transition-all duration-300 w-1.5 h-1.5 ${
                activeSlide === i 
                  ? 'bg-blue-600 scale-125' 
                  : 'bg-slate-300/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
