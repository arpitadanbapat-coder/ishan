import React, { useState } from 'react';
import { Button } from './Button';
import { Icons } from '../constants';
import { MemoryItem } from '../types';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: MemoryItem[];
  onAdd: (fact: string) => void;
  onDelete: (id: string) => void;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({ isOpen, onClose, memories, onAdd, onDelete }) => {
  const [newMemory, setNewMemory] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (newMemory.trim()) {
      onAdd(newMemory.trim());
      setNewMemory('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl bg-charcoal border border-neon/30 rounded-2xl shadow-[0_0_50px_rgba(102,252,241,0.15)] overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neon/20 bg-gradient-to-r from-obsidian via-charcoal to-obsidian">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neon/10 rounded-lg text-neon animate-pulse">
              <Icons.Database />
            </div>
            <div>
               <h2 className="text-xl font-bold text-white font-mono tracking-widest uppercase">Neural Core</h2>
               <p className="text-xs text-neon/60 font-mono">Self-Development & Memory Matrix</p>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Add New */}
          <div className="bg-obsidian/50 p-4 rounded-xl border border-white/5">
             <label className="block text-xs uppercase tracking-widest text-neon/50 mb-2 font-bold">Inject New Knowledge</label>
             <div className="flex gap-2">
               <input 
                  type="text" 
                  value={newMemory}
                  onChange={(e) => setNewMemory(e.target.value)}
                  placeholder="Teach Veritas a new fact, rule, or preference..."
                  className="flex-1 bg-charcoal border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-neon/50 focus:outline-none focus:ring-1 focus:ring-neon/20 font-mono"
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
               />
               <Button onClick={handleAdd} disabled={!newMemory.trim()} variant="primary" className="!px-4">
                 Inject
               </Button>
             </div>
             <p className="text-[10px] text-gray-500 mt-2 ml-1">
               Facts added here will permanently override standard training data.
             </p>
          </div>

          {/* Memory List */}
          <div>
            <div className="flex items-center justify-between mb-3">
               <label className="block text-xs uppercase tracking-widest text-mist/50 font-bold">Active Axioms ({memories.length})</label>
            </div>
            
            {memories.length === 0 ? (
               <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                 <div className="inline-block p-4 rounded-full bg-white/5 mb-3 text-gray-600">
                    <Icons.Brain />
                 </div>
                 <p className="text-gray-500 font-mono text-sm">Neural Core Empty</p>
                 <p className="text-xs text-gray-700 mt-1">Veritas has not yet developed unique memories.</p>
               </div>
            ) : (
              <div className="space-y-3">
                {memories.map((mem) => (
                  <div key={mem.id} className="group flex items-start justify-between gap-4 p-4 bg-white/5 border border-white/5 hover:border-neon/30 hover:bg-neon/5 rounded-xl transition-all duration-300">
                     <div className="flex items-start gap-3">
                       <div className="mt-1 w-2 h-2 rounded-full bg-neon shadow-[0_0_8px_#66FCF1]"></div>
                       <div>
                         <p className="text-sm text-gray-200 font-mono leading-relaxed">{mem.fact}</p>
                         <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-wider">
                           Learned: {new Date(mem.timestamp).toLocaleDateString()}
                         </p>
                       </div>
                     </div>
                     <button 
                       onClick={() => onDelete(mem.id)}
                       className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                       title="Delete Memory"
                     >
                       <Icons.Trash />
                     </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};