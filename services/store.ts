import { create } from 'zustand';
import { ElementType, BrushMode, ToolType, SandboxSettings } from '../types';

interface SandboxStore {
  selectedElement: ElementType;
  setSelectedElement: (element: ElementType) => void;

  brushSize: number;
  setBrushSize: (size: number) => void;

  brushMode: BrushMode;
  setBrushMode: (mode: BrushMode) => void;

  toolType: ToolType;
  setToolType: (tool: ToolType) => void;

  gravity: number;
  setGravity: (gravity: number) => void;

  temperature: number;
  setTemperature: (temp: number) => void;

  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;

  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;

  showSettings: boolean;
  setShowSettings: (show: boolean) => void;

  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;

  particleQuality: 'low' | 'medium' | 'high';
  setParticleQuality: (quality: 'low' | 'medium' | 'high') => void;
}

export const useSandboxStore = create<SandboxStore>((set) => ({
  selectedElement: ElementType.SAND,
  setSelectedElement: (element) => set({ selectedElement: element }),

  brushSize: 20,
  setBrushSize: (size) => set({ brushSize: Math.max(5, Math.min(100, size)) }),

  brushMode: BrushMode.POINT,
  setBrushMode: (mode) => set({ brushMode: mode }),

  toolType: ToolType.DRAW,
  setToolType: (tool) => set({ toolType: tool }),

  gravity: 1,
  setGravity: (gravity) => set({ gravity: Math.max(0, Math.min(2, gravity)) }),

  temperature: 20,
  setTemperature: (temp) => set({ temperature: Math.max(0, Math.min(100, temp)) }),

  soundEnabled: true,
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),

  isPaused: false,
  setIsPaused: (paused) => set({ isPaused: paused }),

  showSettings: false,
  setShowSettings: (show) => set({ showSettings: show }),

  theme: 'dark',
  setTheme: (theme) => set({ theme }),

  particleQuality: 'high',
  setParticleQuality: (quality) => set({ particleQuality: quality }),
}));
