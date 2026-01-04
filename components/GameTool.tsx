
import React, { useState, useEffect, useRef } from 'react';
import { geminiService } from '../geminiService';

const GameTool: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [gameCode, setGameCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const presets = [
    { label: 'Neon Runner', icon: 'fa-person-running', prompt: 'Create a high-speed neon endless runner with procedural obstacles, a persistent high score, and synth-like sound effects.' },
    { label: 'Star Fighter', icon: 'fa-jet-fighter', prompt: 'A top-down space shooter with multiple enemy types, weapon upgrades, and screen shake on explosions.' },
    { label: 'Gravity Orb', icon: 'fa-circle-nodes', prompt: 'A physics-based puzzle game where I control gravity to guide a glowing orb through a maze of hazards.' },
    { label: 'Vapor Wave Dash', icon: 'fa-palette', prompt: 'A rhythmic platformer with vapor-wave aesthetics, procedural music synthesis, and fluid movement.' },
  ];

  const handleGenerate = async (overriddenPrompt?: string) => {
    const finalPrompt = overriddenPrompt || prompt;
    if (!finalPrompt.trim() || isLoading) return;

    setIsLoading(true);
    setIsPlaying(false);
    setGameCode(null);

    try {
      const code = await geminiService.generateGame(finalPrompt);
      setGameCode(code);
      // Automatically play once generated
      setIsPlaying(true);
    } catch (e) {
      console.error(e);
      alert("Neural Compiler Error: Synthesis failed to reach stability.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (gameCode && iframeRef.current && isPlaying) {
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(gameCode);
        doc.close();
      }
    }
  }, [gameCode, isPlaying]);

  return (
    <div className={`flex flex-col gap-6 h-full ${isFullscreen ? 'fixed inset-0 z-[200] bg-gray-950 p-4' : 'max-w-7xl mx-auto px-6 py-8'}`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <i className="fa-solid fa-gamepad text-blue-500"></i>
            V-GSE <span className="text-gray-600 font-medium">/ Neural Game Engine</span>
          </h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold">Vedviarn Game Synthesis Engine v2.0</p>
        </div>
        {gameCode && (
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-all flex items-center gap-2"
          >
            <i className={`fa-solid ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
            {isFullscreen ? 'Exit Immersive' : 'Immersive Mode'}
          </button>
        )}
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 overflow-hidden ${isFullscreen ? 'lg:grid-cols-1' : ''}`}>
        {/* Input Panel */}
        {!isFullscreen && (
          <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
            <div className="bg-gray-900/40 border border-white/5 p-6 rounded-[2.5rem] space-y-6 backdrop-blur-xl">
              <div>
                <h3 className="text-sm font-black text-blue-400 uppercase tracking-widest mb-2">Core Directives</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Specify the genre, mechanics, and visual theme. Our engine will synthesize a custom runtime for you.</p>
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A high-stakes rhythm game where you dodge light beams..."
                className="w-full bg-gray-950/50 border border-white/10 rounded-3xl px-5 py-4 text-sm min-h-[140px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none transition-all placeholder:text-gray-700"
              />

              <div className="grid grid-cols-2 gap-2">
                {presets.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => { setPrompt(p.prompt); handleGenerate(p.prompt); }}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-950/30 hover:bg-blue-600/10 border border-white/5 hover:border-blue-500/30 rounded-2xl transition-all group"
                  >
                    <i className={`fa-solid ${p.icon} text-lg text-gray-600 group-hover:text-blue-400 transition-colors`}></i>
                    <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-300 uppercase tracking-tighter">{p.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleGenerate()}
                disabled={isLoading || !prompt.trim()}
                className="w-full bg-white text-black font-black py-5 rounded-3xl shadow-2xl shadow-white/5 transition-all disabled:opacity-30 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-bolt-lightning"></i>
                    <span>Execute Build</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-6 bg-blue-600/5 border border-blue-500/10 rounded-[2rem] space-y-3">
              <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                <i className="fa-solid fa-microchip"></i>
                Engine Specifications
              </div>
              <ul className="text-[10px] text-gray-500 space-y-2 font-medium">
                <li className="flex items-center gap-2"><i className="fa-solid fa-check text-blue-500"></i> Procedural Web Audio SFX</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-check text-blue-500"></i> Persistent Score Storage</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-check text-blue-500"></i> Retina Canvas Rendering</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-check text-blue-500"></i> Touch-Ready Hybrid Input</li>
              </ul>
            </div>
          </div>
        )}

        {/* Preview Panel */}
        <div className={`${isFullscreen ? 'lg:col-span-12' : 'lg:col-span-8'} flex flex-col gap-4 h-full`}>
          <div className="flex items-center justify-between px-6 py-3 bg-gray-900/50 border border-white/5 rounded-2xl backdrop-blur-md">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}></div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isPlaying ? 'Runtime Active' : 'Runtime Offline'}</span>
              </div>
              {gameCode && (
                <div className="h-4 w-[1px] bg-white/10 hidden sm:block"></div>
              )}
              {gameCode && !isLoading && (
                <div className="hidden sm:flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest">
                  <i className="fa-solid fa-code"></i>
                  <span>Ready for Execution</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsPlaying(true)}
                disabled={!gameCode || isLoading}
                className="px-5 py-2 bg-green-600/10 border border-green-500/20 hover:bg-green-600 hover:border-green-500 disabled:opacity-20 text-green-500 hover:text-white text-[10px] font-black rounded-xl uppercase transition-all flex items-center gap-2"
              >
                <i className="fa-solid fa-play"></i> Initialize
              </button>
              <button 
                onClick={() => setIsPlaying(false)}
                className="px-5 py-2 bg-red-600/10 border border-red-500/20 hover:bg-red-600 hover:border-red-500 text-red-500 hover:text-white text-[10px] font-black rounded-xl uppercase transition-all flex items-center gap-2"
              >
                <i className="fa-solid fa-power-off"></i> Terminate
              </button>
            </div>
          </div>

          <div className="flex-1 bg-black border border-white/5 rounded-[3rem] overflow-hidden relative shadow-2xl shadow-black">
            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/90 backdrop-blur-md z-20">
                <div className="relative w-32 h-32 mb-8">
                  <div className="absolute inset-0 border-[6px] border-blue-500/10 rounded-full"></div>
                  <div className="absolute inset-0 border-[6px] border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className="fa-solid fa-atom text-blue-500 text-4xl animate-pulse"></i>
                  </div>
                </div>
                <h3 className="text-xl font-black text-white mb-2 tracking-tight">Neural Synthesis Active</h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.2em] animate-pulse">Compiling Asset Logic & Sound Buffers</p>
                <div className="mt-12 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
                  ))}
                </div>
              </div>
            ) : !gameCode ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
                <div className="w-24 h-24 bg-gray-900 border border-white/5 rounded-[2rem] flex items-center justify-center text-gray-800 transform rotate-12">
                  <i className="fa-solid fa-gamepad text-5xl"></i>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-gray-600 italic tracking-tight">V-GSE CORE STANDBY</h3>
                  <p className="text-xs text-gray-700 max-w-sm mx-auto font-medium leading-relaxed uppercase tracking-wider">Awaiting mission parameters. Provide a game concept or use a preset to initiate structural synthesis.</p>
                </div>
              </div>
            ) : isPlaying ? (
              <iframe
                ref={iframeRef}
                className="w-full h-full border-none bg-black"
                title="V-GSE Runtime"
                sandbox="allow-scripts allow-modals allow-same-origin"
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-gray-950/80 backdrop-blur-3xl">
                 <button 
                  onClick={() => setIsPlaying(true)}
                  className="w-24 h-24 bg-white text-black rounded-full flex items-center justify-center text-4xl shadow-[0_0_50px_rgba(255,255,255,0.15)] transition-transform hover:scale-110 active:scale-95 group"
                >
                  <i className="fa-solid fa-play ml-1 group-hover:text-blue-600 transition-colors"></i>
                </button>
                <p className="mt-6 text-[10px] font-black text-blue-400 uppercase tracking-[0.5em]">Neural Link Paused</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameTool;
