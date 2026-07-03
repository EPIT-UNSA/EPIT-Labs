/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw, X } from "lucide-react";

interface ImageZoomModalProps {
  imageUrl: string;
  onClose: () => void;
}

export default function ImageZoomModal({ imageUrl, onClose }: ImageZoomModalProps) {
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

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex flex-col justify-between select-none animate-fade-in"
      onMouseUp={handleMouseUp}
    >
      {/* Top Bar */}
      <div className="p-4 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-white backdrop-blur-md">
        <span className="text-xs font-mono font-bold tracking-widest text-slate-400">VISOR DE IMÁGENES</span>
        
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
        <img
          src={imageUrl}
          alt="Zoomed"
          className="max-w-[90vw] max-h-[75vh] object-contain transition-transform duration-75 pointer-events-none select-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
        />
      </div>

      {/* Bottom Info Banner */}
      <div className="p-3 bg-slate-900/40 text-center text-[10px] font-mono text-slate-500 border-t border-slate-900/60">
        Arrastra para mover la imagen • Usa los botones superiores para ajustar el zoom
      </div>
    </div>
  );
}
