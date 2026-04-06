import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader } from 'lucide-react';

const AIImagePanel: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);

    const encoded = encodeURIComponent(prompt.trim());
    const seed = Math.floor(Math.random() * 1_000_000);
    const url = `https://image.pollinations.ai/prompt/${encoded}?model=flux&width=512&height=512&nologo=false&seed=${seed}`;
    const img = new Image();
    img.onload = () => {
      setImageUrl(url);
      setLoading(false);
    };
    img.onerror = () => {
      setError('Failed to generate image. Please try again.');
      setLoading(false);
    };
    img.src = url;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') generateImage();
  };

  return (
    <div className="bg-gray-900 bg-opacity-90 backdrop-blur-md border border-gray-700 rounded-lg p-4 shadow-xl">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-purple-400" />
        <h3 className="text-sm font-semibold text-gray-200">AI Image</h3>
      </div>

      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe an image…"
        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200 text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500 mb-2"
      />

      <motion.button
        onClick={generateImage}
        disabled={loading || !prompt.trim()}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="w-full px-3 py-2 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader size={14} className="animate-spin" />
            Generating…
          </>
        ) : (
          <>
            <Sparkles size={14} />
            Generate
          </>
        )}
      </motion.button>

      {error && (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      )}

      {imageUrl && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3"
        >
          <img
            src={imageUrl}
            alt={prompt}
            className="w-full rounded border border-gray-700 pixel-art"
          />
          <p className="mt-1 text-xs text-gray-500 truncate" title={prompt}>{prompt}</p>
        </motion.div>
      )}

      <a
        href="https://pollinations.ai"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-purple-400 transition-colors"
      >
        Powered by pollinations.ai
      </a>
    </div>
  );
};

export default AIImagePanel;
