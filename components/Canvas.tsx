import React, { useRef, useEffect, useState } from 'react';
import { Element, ElementType, BrushMode, ToolType } from '../types';
import { updateElement, getElementTemperatureColor, createElement } from '../services/elements';
import { useSandboxStore } from '../services/store';

interface CanvasProps {
  width: number;
  height: number;
  cellSize?: number;
}

const Canvas = React.forwardRef<HTMLCanvasElement, CanvasProps>(
  ({ width, height, cellSize = 4 }, forwardedRef) => {
    const internalRef = useRef<HTMLCanvasElement>(null);
    const canvasRef = (forwardedRef as React.MutableRefObject<HTMLCanvasElement | null>) || internalRef;
  const gridRef = useRef<(Element | null)[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [fps, setFps] = useState(0);

  const store = useSandboxStore();
  const {
    selectedElement,
    brushSize,
    brushMode,
    toolType,
    gravity,
    temperature,
    isPaused,
    particleQuality,
  } = store;

  const rows = Math.ceil(height / cellSize);
  const cols = Math.ceil(width / cellSize);

  useEffect(() => {
    gridRef.current = Array(rows)
      .fill(null)
      .map(() => Array(cols).fill(null));
  }, [rows, cols]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let frameCount = 0;
    let lastTime = Date.now();

    const render = () => {
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(0, 0, width, height);

      const grid = gridRef.current;

      if (!isPaused) {
        const qualityMultiplier = particleQuality === 'high' ? 1 : particleQuality === 'medium' ? 2 : 3;

        for (let y = rows - 1; y >= 0; y--) {
          for (let x = 0; x < cols; x++) {
            if (frameCount % qualityMultiplier === 0) {
              grid[y][x] = updateElement(grid[y][x], x, y, grid, gravity);
            }
          }
        }
      }

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const element = grid[y][x];
          if (element && element.type !== ElementType.EMPTY) {
            const color = getElementTemperatureColor(element);
            ctx.fillStyle = color;
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          }
        }
      }

      frameCount++;

      if (frameCount % 10 === 0) {
        const now = Date.now();
        const delta = now - lastTime;
        setFps(Math.round(1000 / (delta / 10)));
        lastTime = now;
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [width, height, rows, cols, cellSize, gravity, isPaused, particleQuality]);

  const drawBrush = (x: number, y: number, element: ElementType) => {
    const grid = gridRef.current;
    const radius = Math.ceil(brushSize / (2 * cellSize));

    switch (brushMode) {
      case BrushMode.POINT:
        grid[y]?.[x] = createElement(element, temperature);
        break;

      case BrushMode.CIRCLE:
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= radius) {
              const ny = y + dy;
              const nx = x + dx;
              if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
                grid[ny][nx] = createElement(element, temperature);
              }
            }
          }
        }
        break;

      case BrushMode.SPRAY:
        for (let i = 0; i < Math.ceil(radius * 2); i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * radius;
          const dx = Math.round(Math.cos(angle) * distance);
          const dy = Math.round(Math.sin(angle) * distance);
          const nx = x + dx;
          const ny = y + dy;
          if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
            grid[ny][nx] = createElement(element, temperature);
          }
        }
        break;

      case BrushMode.LINE:
        break;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDrawing(true);
    handleDraw(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDrawing) {
      handleDraw(e);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleDraw = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / width) * cols);
    const y = Math.floor(((e.clientY - rect.top) / height) * rows);

    if (x < 0 || x >= cols || y < 0 || y >= rows) return;

    switch (toolType) {
      case ToolType.DRAW:
        drawBrush(x, y, selectedElement);
        break;

      case ToolType.ERASE:
        drawBrush(x, y, ElementType.EMPTY);
        break;

      case ToolType.GRAB:
        const grid = gridRef.current;
        const radius = Math.ceil(brushSize / (2 * cellSize));
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const ny = y + dy;
            const nx = x + dx;
            if (ny >= 0 && ny < rows && nx >= 0 && nx < cols && grid[ny]?.[nx]) {
              if (grid[ny][nx]?.velocity) {
                grid[ny][nx]!.velocity!.y -= 2;
              }
            }
          }
        }
        break;
    }
  };

  const downloadCanvas = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.href = canvasRef.current.toDataURL('image/png');
    link.download = `sandbox-creation-${Date.now()}.png`;
    link.click();
  };

    return (
      <div className="flex flex-col gap-4">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="bg-gray-900 border-2 border-gray-700 rounded-lg cursor-crosshair shadow-2xl hover:border-blue-500 transition-colors"
        />
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>FPS: {fps}</span>
          <button
            onClick={downloadCanvas}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            Download
          </button>
        </div>
      </div>
    );
  }
);

Canvas.displayName = 'Canvas';

export default Canvas;
