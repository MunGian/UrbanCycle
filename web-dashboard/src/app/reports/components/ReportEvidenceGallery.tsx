import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportEvidenceGalleryProps {
  images?: string[];
  title?: string;
}

export function ReportEvidenceGallery({
  images = [],
  title = "Evidence",
}: ReportEvidenceGalleryProps) {
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);

  if (!images || images.length === 0) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <div className="w-full h-24 flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-gray-200 border-dashed text-gray-400">
          <p className="text-xs">No images attached</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          {title}
          <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {images.length}
          </span>
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200 snap-x">
          {images.slice(0, 3).map((img, idx) => (
            <div
              key={idx}
              onClick={() => setGalleryIndex(idx)}
              className="relative h-24 w-24 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity snap-start group"
            >
              <img
                src={img}
                alt={`${title} ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              {idx === 2 && images.length > 3 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-sm backdrop-blur-[1px]">
                  +{images.length - 3}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Overlay */}
      {galleryIndex !== null && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
          {/* Close Button */}
          <button
            onClick={() => setGalleryIndex(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20 z-50 cursor-pointer"
            aria-label="Close gallery"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Previous Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setGalleryIndex((prev) =>
                prev !== null && prev > 0 ? prev - 1 : images.length - 1,
              );
            }}
            className="absolute left-4 sm:left-8 p-2 text-white/50 hover:text-white transition-colors hover:scale-110 active:scale-95 duration-200 z-50 cursor-pointer"
            aria-label="Previous image"
          >
            <div className="bg-white/10 p-2 md:p-3 rounded-full backdrop-blur-md border border-white/10">
              <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
            </div>
          </button>

          {/* Main Image */}
          <div
            className="flex items-center justify-center w-full h-full p-4 md:p-12"
            onClick={() => setGalleryIndex(null)}
          >
            <img
              src={images[galleryIndex]}
              alt={`${title} ${galleryIndex + 1}`}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Next Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setGalleryIndex((prev) =>
                prev !== null && prev < images.length - 1 ? prev + 1 : 0,
              );
            }}
            className="absolute right-4 sm:right-8 p-2 text-white/50 hover:text-white transition-colors hover:scale-110 active:scale-95 duration-200 z-50 cursor-pointer"
            aria-label="Next image"
          >
            <div className="bg-white/10 p-2 md:p-3 rounded-full backdrop-blur-md border border-white/10">
              <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
            </div>
          </button>

          {/* Counter */}
          <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
            <span className="bg-black/50 text-white/80 px-4 py-1.5 rounded-full text-sm font-medium border border-white/10 backdrop-blur-md">
              Image {galleryIndex + 1} of {images.length}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
