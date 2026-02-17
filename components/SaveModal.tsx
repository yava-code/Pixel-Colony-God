import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, description: string, isPublic: boolean, canvasData: string) => Promise<void>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const SaveModal: React.FC<SaveModalProps> = ({ isOpen, onClose, onSave, canvasRef }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setIsLoading(true);
    try {
      const canvasData = canvasRef.current?.toDataURL() || '';
      await onSave(title, description, isPublic, canvasData);
      toast.success('Creation saved!');
      setTitle('');
      setDescription('');
      setIsPublic(false);
      onClose();
    } catch (error) {
      toast.error('Failed to save creation');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-md">
              <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                  <Save size={20} />
                  Save Creation
                </h2>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-800 rounded transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="My awesome creation..."
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What inspired this creation?"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none h-24"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="text-sm text-gray-300">Share with community</span>
                </label>

                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded transition-colors font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Save size={16} />
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SaveModal;
