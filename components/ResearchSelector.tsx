import React from 'react';
import { ResearchLevel } from '../types';
import { MODE_DESCRIPTIONS, Icons } from '../constants';

interface ResearchSelectorProps {
  currentLevel: ResearchLevel;
  onSelect: (level: ResearchLevel) => void;
  disabled?: boolean;
}

export const ResearchSelector: React.FC<ResearchSelectorProps> = ({ currentLevel, onSelect, disabled }) => {
  return (
    <div className="flex flex-col gap-2 w-full max-w-2xl mx-auto mb-6">
      <div className="flex bg-charcoal/50 p-1 rounded-xl backdrop-blur-sm border border-white/5">
        {(Object.values(ResearchLevel) as ResearchLevel[]).map((level) => {
          const isActive = currentLevel === level;
          
          let Icon = Icons.Sparkles;
          if (level === ResearchLevel.MODERATE) Icon = Icons.Globe;
          if (level === ResearchLevel.DEEP) Icon = Icons.Brain;

          return (
            <button
              key={level}
              onClick={() => onSelect(level)}
              disabled={disabled}
              className={`
                flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-300
                ${isActive 
                  ? 'bg-deep_teal/20 text-neon shadow-[0_0_10px_rgba(102,252,241,0.1)] border border-neon/30' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <Icon />
              <span className="uppercase tracking-widest text-xs">{level}</span>
            </button>
          );
        })}
      </div>
      <div className="text-center h-6">
         <p className="text-xs text-mist/60 animate-pulse font-mono">{MODE_DESCRIPTIONS[currentLevel]}</p>
      </div>
    </div>
  );
};