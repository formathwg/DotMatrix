import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { HalftoneSettings } from '../types';

export interface HalftoneCanvasHandle {
  generateSVG: () => void;
}

interface HalftoneCanvasProps {
  imageSrc: string | null;
  settings: HalftoneSettings;
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
  t: any; // Localization object
}

export const HalftoneCanvas = forwardRef<HalftoneCanvasHandle, HalftoneCanvasProps>(({ imageSrc, settings, onCanvasReady, t }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);

  // Handle window resize to keep canvas responsive within container
  useEffect(() => {
    const updateSize = () => {
      // Logic for resize if needed
    };
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Expose SVG generation function to parent
  useImperativeHandle(ref, () => ({
    generateSVG: () => {
      if (!sourceImageRef.current) return;

      const img = sourceImageRef.current;
      const width = img.width; 
      const height = img.height;
      
      const offCanvas = document.createElement('canvas');
      offCanvas.width = width;
      offCanvas.height = height;
      const offCtx = offCanvas.getContext('2d');
      if (!offCtx) return;

      offCtx.drawImage(img, 0, 0, width, height);
      const imageData = offCtx.getImageData(0, 0, width, height);
      const data = imageData.data;

      const { gridSize, maxRadiusScale, minRadius, invert, contrast, dotColor, backgroundColor } = settings;
      
      let svgContent = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
      svgContent += `<rect width="100%" height="100%" fill="${backgroundColor}"/>`;

      const cellRadius = gridSize / 2;
      const maxR = cellRadius * maxRadiusScale;
      const effectiveMinRadiusScale = Math.min(minRadius, maxRadiusScale);
      const minR = cellRadius * effectiveMinRadiusScale;

      for (let y = 0; y < height; y += gridSize) {
        for (let x = 0; x < width; x += gridSize) {
          const centerX = Math.min(x + Math.floor(gridSize / 2), width - 1);
          const centerY = Math.min(y + Math.floor(gridSize / 2), height - 1);
          
          const i = (centerY * width + centerX) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          let brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          brightness = (brightness - 0.5) * contrast + 0.5;
          brightness = Math.max(0, Math.min(1, brightness));

          let sizeFactor;
          if (invert) {
             sizeFactor = brightness;
          } else {
             sizeFactor = 1 - brightness;
          }

          const radius = minR + (maxR - minR) * sizeFactor;

          if (radius > 0.1) {
            svgContent += `<circle cx="${centerX}" cy="${centerY}" r="${radius.toFixed(2)}" fill="${dotColor}"/>`;
          }
        }
      }

      svgContent += `</svg>`;

      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dotmatrix-${Date.now()}.svg`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }));

  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    img.onload = () => {
      // 1. Setup dimensions
      const maxDimension = 2400; 
      let width = img.width;
      let height = img.height;
      
      if (width > maxDimension || height > maxDimension) {
        const ratio = width / height;
        if (width > height) {
          width = maxDimension;
          height = maxDimension / ratio;
        } else {
          height = maxDimension;
          width = maxDimension * ratio;
        }
      }

      // Store modified image object for SVG export use
      img.width = width;
      img.height = height;
      sourceImageRef.current = img;

      canvas.width = width;
      canvas.height = height;
      
      onCanvasReady(canvas);

      // 2. Create offscreen canvas to read pixel data
      const offCanvas = document.createElement('canvas');
      offCanvas.width = width;
      offCanvas.height = height;
      const offCtx = offCanvas.getContext('2d');
      if (!offCtx) return;

      offCtx.drawImage(img, 0, 0, width, height);
      
      // Get pixel data
      const imageData = offCtx.getImageData(0, 0, width, height);
      const data = imageData.data;

      // 3. Clear main canvas
      ctx.fillStyle = settings.backgroundColor;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = settings.dotColor;

      // 4. Halftone Algorithm
      const { gridSize, maxRadiusScale, minRadius, invert, contrast } = settings;
      
      const cellRadius = gridSize / 2;
      const maxR = cellRadius * maxRadiusScale;
      const effectiveMinRadiusScale = Math.min(minRadius, maxRadiusScale);
      const minR = cellRadius * effectiveMinRadiusScale;

      for (let y = 0; y < height; y += gridSize) {
        for (let x = 0; x < width; x += gridSize) {
          
          const centerX = Math.min(x + Math.floor(gridSize / 2), width - 1);
          const centerY = Math.min(y + Math.floor(gridSize / 2), height - 1);
          
          const i = (centerY * width + centerX) * 4;
          
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          let brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

          brightness = (brightness - 0.5) * contrast + 0.5;
          brightness = Math.max(0, Math.min(1, brightness));

          let sizeFactor;
          if (invert) {
             sizeFactor = brightness;
          } else {
             sizeFactor = 1 - brightness;
          }

          const radius = minR + (maxR - minR) * sizeFactor;

          if (radius > 0.1) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };
  }, [imageSrc, settings, onCanvasReady]);

  if (!imageSrc) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/50 m-8">
        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-lg font-medium">{t.startPrompt}</p>
        <p className="text-sm">{t.dropPrompt}</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-slate-900 overflow-hidden relative p-4">
       <canvas 
        ref={canvasRef} 
        className="max-w-full max-h-full shadow-2xl shadow-black border border-slate-800"
        style={{ objectFit: 'contain' }}
      />
    </div>
  );
});

HalftoneCanvas.displayName = "HalftoneCanvas";