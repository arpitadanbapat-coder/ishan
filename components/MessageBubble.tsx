import React from 'react';
import { Message, Role } from '../types';
import { Icons } from '../constants';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isThinking = message.isThinking;
  const hasSources = message.sources && message.sources.length > 0;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-8 group`}>
      <div className={`max-w-[90%] lg:max-w-[75%] flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1
          ${isUser ? 'bg-mist text-obsidian' : 'bg-charcoal border border-neon/30 text-neon'}
        `}>
          {isUser ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
            </svg>
          ) : (
            <Icons.Logo />
          )}
        </div>

        {/* Content Column */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} flex-1 min-w-0`}>
          
          {/* Badge Header for AI */}
          {!isUser && hasSources && (
             <div className="flex items-center gap-1.5 mb-2 px-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-[10px] uppercase font-mono text-green-400/80 tracking-widest">
                   Verified by {message.sources!.length} Sources
                </span>
             </div>
          )}

          <div className={`
            px-6 py-4 rounded-2xl text-sm leading-relaxed tracking-wide shadow-lg backdrop-blur-md border relative
            ${isUser 
              ? 'bg-mist/10 border-mist/20 text-mist rounded-tr-sm' 
              : 'bg-charcoal/80 border-deep_teal/20 text-gray-200 rounded-tl-sm'}
            ${isThinking ? 'animate-pulse-slow' : ''}
          `}>
            
            {/* Display Attached Image for User */}
            {message.image && (
              <div className="mb-4 rounded-lg overflow-hidden border border-white/10 shadow-lg max-w-full">
                <img 
                  src={message.image} 
                  alt="Uploaded by user" 
                  className="max-h-64 object-cover"
                />
              </div>
            )}

            {/* Plain text rendering with line breaks for simplicity in this format */}
            <div className="whitespace-pre-wrap font-sans">
              {message.text || (
                <span className="flex items-center gap-2 italic text-neon/70">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce delay-100">.</span>
                  <span className="animate-bounce delay-200">.</span>
                </span>
              )}
            </div>
          </div>

          {/* Citation Index / Automatic Bibliography */}
          {!isUser && hasSources && (
             <div className="mt-4 w-full bg-black/20 border border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
                   <Icons.BookOpen />
                   <h4 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Citation Index</h4>
                </div>
                <div className="grid grid-cols-1 gap-2">
                   {message.sources!.map((source, idx) => (
                      <a 
                        key={idx}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-all group/source"
                      >
                         <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded bg-gray-800 text-[10px] text-gray-400 font-mono group-hover/source:text-neon group-hover/source:bg-deep_teal/20 transition-colors">
                            {idx + 1}
                         </span>
                         <div className="flex flex-col min-w-0">
                            <span className="text-xs text-neon/80 font-medium truncate group-hover/source:text-neon transition-colors">
                               {source.title}
                            </span>
                            <span className="text-[10px] text-gray-600 truncate font-mono">
                               {source.uri}
                            </span>
                         </div>
                         <div className="ml-auto opacity-0 group-hover/source:opacity-100 text-gray-500">
                            <Icons.Link />
                         </div>
                      </a>
                   ))}
                </div>
             </div>
          )}
          
          <span className="text-[10px] text-gray-600 mt-2 font-mono px-1">
             {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
        </div>
      </div>
    </div>
  );
};