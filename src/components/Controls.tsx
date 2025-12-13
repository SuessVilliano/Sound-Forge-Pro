import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, RotateCw, RefreshCw } from 'lucide-react';
import { Direction } from '../types';

interface ControlsProps {
  onReset: () => void;
  onMove: (dir: Direction) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ 
  onReset, 
  onMove, 
  onUndo, 
  onRedo, 
  canUndo, 
  canRedo 
}) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-4 mb-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-3 rounded-full transition-colors ${
            canUndo ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
        >
          <RotateCcw size={20} />
        </button>
        <button
          onClick={onReset}
          className="p-3 bg-red-900/50 hover:bg-red-900/80 rounded-full transition-colors text-red-200"
          title="Reset Level (R)"
        >
          <RefreshCw size={20} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-3 rounded-full transition-colors ${
            canRedo ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Y)"
        >
          <RotateCw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div />
        <button
          className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg active:scale-95 transition-transform"
          onClick={() => onMove('UP')}
        >
          <ArrowUp size={24} />
        </button>
        <div />
        <button
          className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg active:scale-95 transition-transform"
          onClick={() => onMove('LEFT')}
        >
          <ArrowLeft size={24} />
        </button>
        <button
          className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg active:scale-95 transition-transform"
          onClick={() => onMove('DOWN')}
        >
          <ArrowDown size={24} />
        </button>
        <button
          className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg active:scale-95 transition-transform"
          onClick={() => onMove('RIGHT')}
        >
          <ArrowRight size={24} />
        </button>
      </div>
    </div>
  );
};
