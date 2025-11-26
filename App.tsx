import React, { useState, useRef, useEffect } from 'react';
import { Message, ResearchLevel, MemoryItem } from './types';
import { streamGeminiResponse } from './services/geminiService';
import { Icons, APP_NAME } from './constants';
import { Button } from './components/Button';
import { ResearchSelector } from './components/ResearchSelector';
import { MessageBubble } from './components/MessageBubble';
import { SettingsModal } from './components/SettingsModal';
import { MemoryModal } from './components/MemoryModal';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Greetings. I am Veritas. Select your research depth required for today's inquiry.",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [researchLevel, setResearchLevel] = useState<ResearchLevel>(ResearchLevel.MODERATE);
  
  // Custom Instruction State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customInstruction, setCustomInstruction] = useState('');

  // Neural Core (Memory) State
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [newlyLearned, setNewlyLearned] = useState<boolean>(false); // Notification trigger
  
  // Lens (Image) State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Load memories on mount
  useEffect(() => {
    const saved = localStorage.getItem('veritas_memory');
    if (saved) {
      try {
        setMemories(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load memory core");
      }
    }
  }, []);

  // Save memories on change
  useEffect(() => {
    localStorage.setItem('veritas_memory', JSON.stringify(memories));
  }, [memories]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const addMemory = (fact: string) => {
    const newItem: MemoryItem = {
      id: Date.now().toString(),
      fact: fact,
      timestamp: Date.now(),
      category: 'fact'
    };
    setMemories(prev => [newItem, ...prev]);
    setNewlyLearned(true);
    setTimeout(() => setNewlyLearned(false), 3000);
  };

  const removeMemory = (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset file input so the same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim(),
      image: selectedImage || undefined,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSelectedImage(null); // Clear image after sending
    setIsLoading(true);

    // Create placeholder for AI response
    const aiMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: aiMsgId,
      role: 'model',
      text: '', // Start empty for streaming
      isThinking: true,
      timestamp: Date.now()
    }]);

    await streamGeminiResponse(
      userMsg.text || "Analyze this image.", // Fallback text if only image is sent
      messages, // Pass full history (without current message, as per standard practice, but formatHistory handles new turn if separate)
                // Note: In this architecture, 'messages' is the OLD history. The new message is passed via 'prompt' and 'image' args.
      researchLevel,
      (partialText) => {
        // Strip memory tags from real-time display to avoid visual clutter
        const cleanText = partialText.replace(/\[\[MEMORY:.*?\]\]/g, '');
        setMessages(prev => prev.map(msg => 
          msg.id === aiMsgId 
            ? { ...msg, text: cleanText, isThinking: false } 
            : msg
        ));
      },
      (fullText, sources) => {
        // Parse for self-learning tags: [[MEMORY: ...]]
        const memoryRegex = /\[\[MEMORY:\s*(.*?)\]\]/g;
        let match;
        const foundMemories: string[] = [];
        
        // Find all matches
        while ((match = memoryRegex.exec(fullText)) !== null) {
          foundMemories.push(match[1]);
        }

        // Add found memories to core
        if (foundMemories.length > 0) {
          foundMemories.forEach(fact => addMemory(fact));
        }

        // Clean text for final display
        const cleanText = fullText.replace(/\[\[MEMORY:.*?\]\]/g, '').trim();

        setMessages(prev => prev.map(msg => 
          msg.id === aiMsgId 
            ? { ...msg, text: cleanText, sources: sources, isThinking: false } 
            : msg
        ));
        setIsLoading(false);
      },
      customInstruction,
      memories, // Pass current memory state
      userMsg.image // Pass the image for this turn
    );
  };

  return (
    <div className="flex flex-col h-screen w-full bg-obsidian text-gray-200 overflow-hidden relative">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-deep_teal/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-neon/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-obsidian/80 backdrop-blur-lg">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
               <Icons.Logo />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-[0.2em] text-white font-mono">{APP_NAME}</h1>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-neon rounded-full animate-pulse shadow-[0_0_8px_#66FCF1]"></div>
                 <span className="text-[10px] uppercase text-neon/70 tracking-widest">System Online</span>
              </div>
            </div>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setIsMemoryOpen(true)}
             className={`
               p-2 rounded-lg border transition-all duration-300 group relative
               ${isMemoryOpen
                 ? 'bg-neon/10 border-neon/50 text-neon' 
                 : 'bg-transparent border-white/10 text-gray-400 hover:text-white hover:border-white/30'}
             `}
             title="Neural Core (Memory)"
           >
              <Icons.Database />
              {newlyLearned && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-neon rounded-full animate-ping"></span>
              )}
              {newlyLearned && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-neon rounded-full"></span>
              )}
           </button>
           <button 
             onClick={() => setIsSettingsOpen(true)}
             className={`
               p-2 rounded-lg border transition-all duration-300 group
               ${customInstruction 
                 ? 'bg-neon/10 border-neon/50 text-neon shadow-[0_0_10px_rgba(102,252,241,0.2)]' 
                 : 'bg-transparent border-white/10 text-gray-400 hover:text-white hover:border-white/30'}
             `}
             title="Configure System Persona"
           >
              <Icons.Settings />
           </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 relative z-10 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 scroll-smooth">
        <div className="max-w-4xl mx-auto min-h-full flex flex-col justify-end">
           {messages.length === 0 && (
             <div className="flex flex-col items-center justify-center h-[50vh] opacity-50">
               <Icons.Logo />
               <p className="mt-4 font-mono text-sm text-gray-500">Initiate Research Protocol</p>
             </div>
           )}
           
           {messages.map((msg) => (
             <MessageBubble key={msg.id} message={msg} />
           ))}
           <div ref={bottomRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="relative z-20 p-4 pb-8 bg-gradient-to-t from-obsidian via-obsidian to-transparent">
        <div className="max-w-4xl mx-auto">
          
          <ResearchSelector 
            currentLevel={researchLevel} 
            onSelect={setResearchLevel} 
            disabled={isLoading}
          />
          
          {/* Image Preview */}
          {selectedImage && (
            <div className="mb-3 relative inline-block group animate-in slide-in-from-bottom-2 fade-in duration-300">
               <div className="relative rounded-xl overflow-hidden border border-neon/50 shadow-[0_0_15px_rgba(102,252,241,0.2)]">
                  <img src={selectedImage} alt="Analysis Target" className="h-20 w-auto object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
               </div>
               <button 
                 onClick={() => setSelectedImage(null)}
                 className="absolute -top-2 -right-2 bg-charcoal border border-white/20 rounded-full p-1 text-gray-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 transition-all shadow-lg"
               >
                 <Icons.X />
               </button>
               <div className="absolute bottom-1 left-2 flex items-center gap-1">
                 <div className="w-1.5 h-1.5 bg-neon rounded-full animate-pulse"></div>
                 <span className="text-[8px] font-mono text-white tracking-wider uppercase">Lens Active</span>
               </div>
            </div>
          )}

          <form onSubmit={handleSend} className="relative group flex gap-3 items-end">
            <input 
               type="file" 
               accept="image/*" 
               ref={fileInputRef} 
               onChange={handleImageSelect} 
               className="hidden" 
            />
            
            <div className="flex-1 relative">
               <input
                 type="text"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 placeholder={isLoading ? "Analyzing data streams..." : "Enter research query..."}
                 disabled={isLoading}
                 className="w-full bg-charcoal/50 border border-white/10 text-white rounded-2xl py-4 pl-12 pr-16 
                            focus:outline-none focus:border-neon/50 focus:ring-1 focus:ring-neon/20 focus:bg-charcoal
                            placeholder:text-gray-600 transition-all shadow-lg backdrop-blur-md"
               />
               
               {/* Lens Button inside Input */}
               <div className="absolute left-3 top-1/2 -translate-y-1/2">
                 <button
                   type="button"
                   onClick={() => fileInputRef.current?.click()}
                   className={`
                     p-2 rounded-lg transition-all duration-300
                     ${selectedImage 
                       ? 'text-neon bg-neon/10' 
                       : 'text-gray-500 hover:text-neon hover:bg-white/5'}
                   `}
                   title="Activate Lens (Upload Image)"
                   disabled={isLoading}
                 >
                    <Icons.Lens />
                 </button>
               </div>

               <div className="absolute right-2 top-2 bottom-2">
                 <Button 
                   type="submit" 
                   variant="primary" 
                   disabled={(!input.trim() && !selectedImage) || isLoading}
                   className="h-full !px-4 !py-0 rounded-xl"
                 >
                   {isLoading ? '' : <Icons.Send />}
                 </Button>
               </div>
            </div>
          </form>
          
          <div className="text-center mt-3 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
             <p className="text-[10px] text-gray-700 font-mono">
               Gemini 2.5 Flash & 3.0 Pro • 99.9% Target Precision
             </p>
             
             {/* Status Indicators */}
             <div className="flex gap-2">
                {customInstruction && (
                  <span className="text-[10px] text-neon/70 font-mono border border-neon/20 px-2 py-0.5 rounded flex items-center gap-1 bg-neon/5">
                    <span className="w-1 h-1 bg-neon rounded-full"></span>
                    PERSONA ACTIVE
                  </span>
                )}
                {memories.length > 0 && (
                  <span className="text-[10px] text-deep_teal/70 font-mono border border-deep_teal/20 px-2 py-0.5 rounded flex items-center gap-1 bg-deep_teal/5">
                    <Icons.Database />
                    CORE ONLINE ({memories.length})
                  </span>
                )}
             </div>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        currentInstruction={customInstruction}
        onSave={setCustomInstruction}
      />

      {/* Memory Modal */}
      <MemoryModal
        isOpen={isMemoryOpen}
        onClose={() => setIsMemoryOpen(false)}
        memories={memories}
        onAdd={addMemory}
        onDelete={removeMemory}
      />

      {/* Toast Notification for Learning */}
      {newlyLearned && (
         <div className="fixed bottom-24 right-6 z-50 animate-bounce">
            <div className="bg-neon text-obsidian px-4 py-2 rounded-lg shadow-[0_0_20px_#66FCF1] font-bold text-xs flex items-center gap-2">
              <Icons.Brain />
              <span>New Neural Pathway Established</span>
            </div>
         </div>
      )}

    </div>
  );
};

export default App;