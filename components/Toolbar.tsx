import React from 'react';
import { BrushMode, ToolType } from '../types';
import { useSandboxStore } from '../services/store';
import { motion } from 'framer-motion';
import { Paintbrush, Eraser, Hand, Settings, Pause, Play } from 'lucide-react';

const Toolbar: React.FC = () => {
  const store = useSandboxStore();
  const {
    brushMode,
    setBrushMode,
    toolType,
    setToolType,
    isPaused,
    setIsPaused,
    brushSize,
    setBrushSize,
    setShowSettings,
  } = store;

  const tools = [
    { type: ToolType.DRAW, icon: Paintbrush, label: 'Draw' },
    { type: ToolType.ERASE, icon: Eraser, label: 'Erase' },
    { type: ToolType.GRAB, icon: Hand, label: 'Grab' },
  ];

  const brushModes = [
    { mode: BrushMode.POINT, label: 'Point' },
    { mode: BrushMode.CIRCLE, label: 'Circle' },
    { mode: BrushMode.SPRAY, label: 'Spray' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 bg-opacity-90 backdrop-blur-md border border-gray-700 rounded-lg p-4 shadow-xl">
        <h3 className="text-sm font-semibold text-gray-200 mb-3">Tools</h3>
        <div className="flex gap-2 mb-4">
          {tools.map(({ type, icon: Icon, label }) => (
            <motion.button
              key={type}
              onClick={() => setToolType(type)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={label}
              className={`p-2 rounded-lg transition-all duration-200 ${
                toolType === type
                  ? 'bg-blue-600 text-white border border-blue-400'
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
              }`}
            >
              <Icon size={20} />
            </motion.button>
          ))}
        </div>

        <h3 className="text-sm font-semibold text-gray-200 mb-2">Brush Mode</h3>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {brushModes.map(({ mode, label }) => (
            <motion.button
              key={mode}
              onClick={() => setBrushMode(mode)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-2 py-1 text-xs rounded transition-all duration-200 ${
                brushMode === mode
                  ? 'bg-blue-600 text-white border border-blue-400'
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
              }`}
            >
              {label}
            </motion.button>
          ))}
        </div>

        <h3 className="text-sm font-semibold text-gray-200 mb-2">Brush Size</h3>
        <div className="flex gap-2 items-center mb-4">
          <input
            type="range"
            min="5"
            max="100"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <span className="text-xs text-gray-400 min-w-[2rem]">{brushSize}</span>
        </div>

        <div className="flex gap-2">
          <motion.button
            onClick={() => setIsPaused(!isPaused)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded border border-gray-700 text-sm transition-colors flex items-center justify-center gap-2"
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
            {isPaused ? 'Play' : 'Pause'}
          </motion.button>

          <motion.button
            onClick={() => setShowSettings(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded border border-gray-700 transition-colors"
          >
            <Settings size={18} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
