import React, { useState, useEffect, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCcw, X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageZoomModalProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export default function ImageZoomModal({ images = [], initialIndex = 0, onClose }: ImageZoomModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    handleReset();
  }, [images.length]);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    handleReset();
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (images.length <= 1) return;
      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length, handlePrev, handleNext, onClose]);

  const currentUrl = images[currentIndex] || "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800";
  const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
  const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex flex-col justify-between select-none animate-fade-in"
      onMouseUp={handleMouseUp}
    >
      {/* Top Bar */}
      <div className="p-4 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-white backdrop-blur-md">
        <div className="flex flex-col">
          <span className="text-xs font-mono font-bold tracking-widest text-slate-400">VISOR DE IMÁGENES</span>
          {images.length > 1 && (
            <span className="text-[10px] font-mono text-slate-500 mt-0.5">
              Imagen {currentIndex + 1} de {images.length}
            </span>
          )}
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            title="Zoom Out"
            disabled={scale <= 0.5}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold w-12 text-center text-slate-300">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            title="Zoom In"
            disabled={scale >= 4}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            title="Restablecer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2 bg-rose-950/60 border border-rose-900/60 hover:bg-rose-900 rounded-lg text-rose-200 hover:text-white transition cursor-pointer"
          title="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Canvas Area */}
      <div 
        className="flex-1 relative overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        style={{ touchAction: "none" }}
      >
        {/* Navigation Buttons inside Canvas */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-10 p-3 bg-slate-900/60 hover:bg-slate-900/90 text-white rounded-full transition-all border border-slate-800 shadow-lg hover:scale-110 cursor-pointer active:scale-95 group"
              title="Anterior"
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-10 p-3 bg-slate-900/60 hover:bg-slate-900/90 text-white rounded-full transition-all border border-slate-800 shadow-lg hover:scale-110 cursor-pointer active:scale-95 group"
              title="Siguiente"
            >
              <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </>
        )}

        <img
          src={currentUrl}
          alt={`Zoomed - ${currentIndex + 1}`}
          className="max-w-[90vw] max-h-[75vh] object-contain transition-transform duration-75"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
        />

        {/* Preload adjacent images in browser cache */}
        {images.length > 1 && (
          <div className="hidden pointer-events-none" style={{ display: "none" }}>
            <img src={images[prevIndex]} alt="preload prev" />
            <img src={images[nextIndex]} alt="preload next" />
          </div>
        )}
      </div>

      {/* Bottom Info Banner */}
      <div className="p-3 bg-slate-900/40 text-center text-[10px] font-mono text-slate-500 border-t border-slate-900/60">
        Arrastra para mover la imagen • Usa los botones o flechas del teclado (← / →) para navegar • Zoom con botones superiores
      </div>
    </div>
  );
}
