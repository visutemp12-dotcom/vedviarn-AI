
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../geminiService';
import { ChatMessage } from '../types';
import { isLimitReached, incrementUsage, LIMITS } from '../utils/usage';

const ChatTool: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [useMaps, setUseMaps] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [fastMode, setFastMode] = useState(false);
  const [isOverLimit, setIsOverLimit] = useState(isLimitReached('chat'));
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const checkLimit = () => setIsOverLimit(isLimitReached('chat'));
    window.addEventListener('usageUpdated', checkLimit);
    return () => window.removeEventListener('usageUpdated', checkLimit);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (isLimitReached('chat')) {
      setIsOverLimit(true);
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let location = undefined;
      if (useMaps) {
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
          location = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        } catch (e) {
          console.warn("Location permission denied or unavailable");
        }
      }

      // Fix: Use correct model name for lite mode
      const model = fastMode ? 'gemini-flash-lite-latest' : (thinking ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview');
      
      const response = await geminiService.chat({
        message: input,
        model,
        useSearch,
        useMaps,
        thinking,
        location
      });

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        groundingSources: response.groundingChunks,
        isThinking: thinking
      };

      setMessages(prev => [...prev, assistantMsg]);
      incrementUsage('chat');
    } catch (error: any) {
      console.error(error);
      const is404 = error.message?.includes("Requested entity was not found");
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: is404 
          ? "System Authorization Error: The requested model entity was not found. This usually means your current API key doesn't have permissions for this specific model or region. Please select a paid AI Studio key."
          : "Sorry, I encountered an error. Please check your connection or API key.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMsg]);
      
      if (is404 && window.aistudio) {
        await window.aistudio.openSelectKey();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto px-4 py-6">
      <div className="flex-1 space-y-6 overflow-y-auto mb-4 pr-2 custom-scrollbar" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center border border-blue-500/20">
              <i className="fa-solid fa-sparkles text-blue-500 text-2xl"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold">Welcome to Vedviarn AI</h2>
              <p className="text-gray-400 max-w-xs mt-2">I'm a powerful assistant capable of reasoning, searching the web, and navigating maps.</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-900 border border-gray-800 text-gray-200'
            }`}>
              {msg.isThinking && (
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-blue-400 uppercase tracking-tighter">
                  <i className="fa-solid fa-brain-circuit animate-pulse"></i> Deep Thinking Mode
                </div>
              )}
              <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </div>
              
              {msg.groundingSources && msg.groundingSources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-800 space-y-2">
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingSources.map((chunk, idx) => (
                      <a 
                        key={idx} 
                        href={chunk.web?.uri || chunk.maps?.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 transition-colors flex items-center gap-1 text-blue-400"
                      >
                        <i className={chunk.web ? "fa-solid fa-globe" : "fa-solid fa-location-dot"}></i>
                        {chunk.web?.title || chunk.maps?.title || 'Grounding Link'}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-.3s]"></div>
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-.5s]"></div>
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-gray-950/80 backdrop-blur-sm pt-2 pb-4">
        {isOverLimit && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-circle-exclamation text-red-400"></i>
              <p className="text-xs text-red-200">You've reached your free daily limit of {LIMITS.chat} messages.</p>
            </div>
            <button className="text-[10px] font-bold text-white bg-red-500 px-3 py-1.5 rounded-lg uppercase">Upgrade</button>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          <button 
            disabled={isOverLimit}
            onClick={() => {setUseSearch(!useSearch); setUseMaps(false); setFastMode(false);}}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-2 ${
              useSearch ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-900 border-gray-800 text-gray-400'
            } disabled:opacity-30`}
          >
            <i className="fa-solid fa-magnifying-glass text-[10px]"></i> Google Search
          </button>
          <button 
            disabled={isOverLimit}
            onClick={() => {setUseMaps(!useMaps); setUseSearch(false); setFastMode(false);}}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-2 ${
              useMaps ? 'bg-green-600 border-green-500 text-white' : 'bg-gray-900 border-gray-800 text-gray-400'
            } disabled:opacity-30`}
          >
            <i className="fa-solid fa-location-dot text-[10px]"></i> Google Maps
          </button>
          <button 
            disabled={isOverLimit}
            onClick={() => {setThinking(!thinking); setFastMode(false);}}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-2 ${
              thinking ? 'bg-purple-600 border-purple-500 text-white' : 'bg-gray-900 border-gray-800 text-gray-400'
            } disabled:opacity-30`}
          >
            <i className="fa-solid fa-brain text-[10px]"></i> Deep Thinking
          </button>
          <button 
            disabled={isOverLimit}
            onClick={() => {setFastMode(!fastMode); setThinking(false); setUseSearch(false); setUseMaps(false);}}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-2 ${
              fastMode ? 'bg-orange-600 border-orange-500 text-white' : 'bg-gray-900 border-gray-800 text-gray-400'
            } disabled:opacity-30`}
          >
            <i className="fa-solid fa-bolt text-[10px]"></i> Fast Mode
          </button>
        </div>

        <div className="relative group">
          <textarea
            value={input}
            disabled={isOverLimit}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isOverLimit ? "Limit reached. Come back tomorrow!" : "Type your message..."}
            className={`w-full bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none max-h-40 min-h-[60px] ${isOverLimit ? 'opacity-50 cursor-not-allowed' : ''}`}
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || isOverLimit}
            className="absolute right-3 bottom-3 w-10 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatTool;
