import React from 'react';
import { ElementType } from '../types';
import { ELEMENT_COLORS } from '../services/elements';
import { useSandboxStore } from '../services/store';
import { motion } from 'framer-motion';

const ELEMENTS = [
  { type: ElementType.SAND, label: 'Sand' },
  { type: ElementType.WATER, label: 'Water' },
  { type: ElementType.FIRE, label: 'Fire' },
  { type: ElementType.ICE, label: 'Ice' },
  { type: ElementType.STEAM, label: 'Steam' },
  { type: ElementType.LAVA, label: 'Lava' },
  { type: ElementType.STONE, label: 'Stone' },
  { type: ElementType.WOOD, label: 'Wood' },
  { type: ElementType.PLANT, label: 'Plant' },
  { type: ElementType.ACID, label: 'Acid' },
];

const ElementSelector: React.FC = () => {
  const { selectedElement, setSelectedElement } = useSandboxStore();

  return (
    <div className="bg-gray-900 bg-opacity-90 backdrop-blur-md border border-gray-700 rounded-lg p-4 shadow-xl">
      <h3 className="text-sm font-semibold text-gray-200 mb-3">Elements</h3>
      <div className="grid grid-cols-2 gap-2">
        {ELEMENTS.map(({ type, label }) => (
          <motion.button
            key={type}
            onClick={() => setSelectedElement(type)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative p-3 rounded-lg transition-all duration-200 flex items-center gap-2 ${
              selectedElement === type
                ? 'bg-blue-600 border-2 border-blue-400 shadow-lg shadow-blue-500/50'
                : 'bg-gray-800 border border-gray-700 hover:bg-gray-700'
            }`}
          >
            <div
              className="w-4 h-4 rounded-full border border-gray-600"
              style={{ backgroundColor: ELEMENT_COLORS[type] }}
            />
            <span className="text-xs text-gray-200">{label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default ElementSelector;
