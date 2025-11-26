import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Icons } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInstruction: string;
  onSave: (instruction: string) => void;
}

const PRESETS = [
  {
    name: "Academic",
    prompt: "Adopt an academic tone. Focus on peer-reviewed sources, empirical evidence, and formal language. Structure responses like a research paper abstract where appropriate."
  },
  {
    name: "Explain Like I'm 5",
    prompt: "Explain complex topics simply, using analogies and easy-to-understand language suitable for a 5-year-old or a beginner."
  },
  {
    name: "Developer",
    prompt: "You are a senior software engineer. Focus on code quality, best practices, and scalability. Provide code snippets in TypeScript/Python where relevant."
  },
  {
    name: "Skeptic",
    prompt: "Critically analyze every claim. Highlight potential biases, logical fallacies, and gaps in the available evidence."
  }
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentInstruction, onSave }) => {
  const [instruction, setInstruction] = useState(currentInstruction);

  // Sync state when prop changes or modal opens
  useEffect(() => {
    setInstruction(currentInstruction);
  }, [currentInstruction, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(instruction);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-charcoal border border-neon/20 rounded-2xl shadow-[0_0_30px_rgba(102,252,241,0.1)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-obsidian/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-deep_teal/20 rounded-lg text-neon">
              <Icons.Settings />
            </div>
            <div>
               <h2 className="text-xl font-bold text-white font-mono tracking-wide">SYSTEM CONFIGURATION</h2>
               <p className="text-xs text-mist/60">Define custom behavioral protocols for Veritas AI.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Quick Select Presets */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-neon/70 mb-3 font-bold">Quick Protocols</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setInstruction(preset.prompt)}
                  className="px-3 py-2 text-xs text-left bg-white/5 hover:bg-neon/10 border border-white/5 hover:border-neon/30 rounded-lg transition-all text-gray-300 hover:text-neon"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <div className="flex-1">
            <label className="block text-xs uppercase tracking-widest text-neon/70 mb-3 font-bold">
              Custom Instruction
            </label>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Enter custom instructions (e.g., 'You are a sarcastic historian', 'Reply in haikus only'). This will layer on top of the core accuracy protocols."
              className="w-full h-48 bg-obsidian border border-white/10 rounded-xl p-4 text-sm text-gray-200 focus:outline-none focus:border-neon/50 focus:ring-1 focus:ring-neon/20 font-mono resize-none leading-relaxed"
            />
          </div>
          
          <div className="p-4 bg-deep_teal/10 rounded-lg border border-deep_teal/20">
             <div className="flex items-start gap-3">
                <Icons.Brain />
                <p className="text-xs text-mist leading-relaxed">
                   <span className="text-neon font-bold">NOTE:</span> Custom instructions act as a persona layer. 
                   Core protocols regarding 99.9% accuracy, source citation, and research depth will remain active to ensure system integrity.
                </p>
             </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-obsidian/50 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save Configuration</Button>
        </div>

      </div>
    </div>
  );
};