import React, { useRef, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Canvas from './components/Canvas';
import ElementSelector from './components/ElementSelector';
import Toolbar from './components/Toolbar';
import SettingsPanel from './components/SettingsPanel';
import SaveModal from './components/SaveModal';
import { useSandboxStore } from './services/store';
import { Save, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const store = useSandboxStore();

  const handleSave = async (
    title: string,
    description: string,
    isPublic: boolean,
    canvasData: string
  ) => {
    console.log('Saving creation:', { title, description, isPublic });
  };

  const handleClear = () => {
    if (window.confirm('Clear the canvas? This cannot be undone.')) {
      location.reload();
    }
  };

  return (
    <div className={`w-full h-screen overflow-hidden transition-colors duration-300 ${
      store.theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
    }`}>
      <Toaster position="top-center" />

      <div className="flex h-full gap-4 p-4">
        {/* Left Panel */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex flex-col gap-4 w-72 overflow-y-auto"
        >
          <ElementSelector />
          <Toolbar />
        </motion.div>

        {/* Center Canvas */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex-1 flex flex-col"
        >
          <div className="flex-1 flex items-center justify-center">
            <Canvas ref={canvasRef} width={1200} height={700} cellSize={4} />
          </div>
          <div className="mt-4 flex gap-2 justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClear}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg border border-gray-700 transition-colors flex items-center gap-2 text-sm"
            >
              <RotateCcw size={16} />
              Clear
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSaveModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <Save size={16} />
              Save Creation
            </motion.button>
          </div>
        </motion.div>
      </div>

      <SettingsPanel />
      <SaveModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSave}
        canvasRef={canvasRef}
      />
    </div>
  );
};

export default App;