
import React from 'react';
import { ToolType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTool, setActiveTool }) => {
  const navItems: { type: ToolType; icon: string; label: string }[] = [
    { type: 'chat', icon: 'fa-comments', label: 'Chat' },
    { type: 'image', icon: 'fa-image', label: 'Studio' },
    { type: 'video', icon: 'fa-film', label: 'Video' },
    { type: 'voice', icon: 'fa-microphone', label: 'Live' },
    { type: 'analyze', icon: 'fa-magnifying-glass-chart', label: 'Analyze' },
    { type: 'tts', icon: 'fa-volume-high', label: 'TTS' },
  ];

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-20 lg:w-64 bg-gray-900 border-r border-gray-800 p-4 transition-all">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <i className="fa-solid fa-v text-white text-xl"></i>
          </div>
          <span className="hidden lg:block text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Vedviarn AI
          </span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.type}
              onClick={() => setActiveTool(item.type)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                activeTool === item.type
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/10'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              <i className={`fa-solid ${item.icon} text-lg w-6`}></i>
              <span className="hidden lg:block font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-800">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              <i className="fa-solid fa-user text-xs"></i>
            </div>
            <div className="hidden lg:block overflow-hidden">
              <p className="text-sm font-medium truncate">Guest User</p>
              <p className="text-xs text-gray-500 truncate">Free Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-gray-950">
        <header className="h-16 border-b border-gray-800 bg-gray-950/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-100 capitalize">{activeTool} Tool</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
              Powered by Gemini 3
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <i className="fa-solid fa-bell"></i>
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <i className="fa-solid fa-gear"></i>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          {children}
        </div>

        {/* Mobile Nav */}
        <nav className="md:hidden h-20 bg-gray-900 border-t border-gray-800 flex items-center justify-around px-2 pb-2">
          {navItems.map((item) => (
            <button
              key={item.type}
              onClick={() => setActiveTool(item.type)}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTool === item.type ? 'text-blue-400' : 'text-gray-500'
              }`}
            >
              <i className={`fa-solid ${item.icon} text-xl`}></i>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default Layout;
