import React from 'react';
import { useSandboxStore } from '../services/store';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const SettingsPanel: React.FC = () => {
  const store = useSandboxStore();
  const {
    showSettings,
    setShowSettings,
    gravity,
    setGravity,
    temperature,
    setTemperature,
    soundEnabled,
    setSoundEnabled,
    particleQuality,
    setParticleQuality,
    theme,
    setTheme,
  } = store;

  return (
    <AnimatePresence>
      {showSettings && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSettings(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-md max-h-96 overflow-y-auto">
              <div className="sticky top-0 flex justify-between items-center p-4 border-b border-gray-700 bg-gray-900">
                <h2 className="text-lg font-semibold text-gray-100">Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 hover:bg-gray-800 rounded transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="p-4 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Gravity: {gravity.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={gravity}
                    onChange={(e) => setGravity(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Temperature: {temperature.toFixed(0)}°C
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Particle Quality
                  </label>
                  <select
                    value={particleQuality}
                    onChange={(e) => setParticleQuality(e.target.value as any)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as any)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200 text-sm"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="text-sm text-gray-300">Sound Enabled</span>
                </label>

                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors font-medium"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel;
