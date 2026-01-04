
import React, { useState, useEffect } from 'react';
import { ToolType } from '../types';
import { getUsage, LIMITS, getUserPlan } from '../utils/usage';

interface LayoutProps {
  children: React.ReactNode;
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  userName: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTool, setActiveTool, userName }) => {
  const [usage, setUsage] = useState(getUsage());
  const [plan, setPlan] = useState(getUserPlan());

  useEffect(() => {
    const handleUpdate = () => {
      setUsage(getUsage());
      setPlan(getUserPlan());
    };
    window.addEventListener('usageUpdated', handleUpdate);
    return () => window.removeEventListener('usageUpdated', handleUpdate);
  }, []);

  const navItems: { type: ToolType; icon: string; label: string }[] = [
    { type: 'chat', icon: 'fa-comments', label: 'Chat' },
    { type: 'image', icon: 'fa-image', label: 'Studio' },
    { type: 'video', icon: 'fa-film', label: 'Video' },
    { type: 'voice', icon: 'fa-microphone', label: 'Live' },
    { type: 'game', icon: 'fa-gamepad', label: 'Game Studio' },
    { type: 'analyze', icon: 'fa-magnifying-glass-chart', label: 'Analyze' },
    { type: 'tts', icon: 'fa-volume-high', label: 'TTS' },
    { type: 'subscription', icon: 'fa-credit-card', label: 'Subscription' },
  ];

  const chatPercent = (usage.chat / LIMITS.chat) * 100;
  const progressColor = chatPercent > 90 ? 'bg-red-500' : chatPercent > 70 ? 'bg-yellow-500' : 'bg-blue-500';
  const isPremium = plan === 'pro' || plan === 'enterprise';

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-20 lg:w-64 bg-gray-900 border-r border-gray-800 p-4 transition-all">
        <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer" onClick={() => setActiveTool('chat')}>
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <i className="fa-solid fa-v text-white text-xl"></i>
          </div>
          <span className="hidden lg:block text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Vedviarn AI
          </span>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
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

        <div className="mt-auto pt-6 border-t border-gray-800 space-y-4">
          {/* Usage Stats (Only for Free Plan) */}
          {!isPremium && (
            <div className="hidden lg:block px-2 space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase text-gray-500 tracking-wider">
                <span>Daily Chat Limit</span>
                <span>{usage.chat} / {LIMITS.chat}</span>
              </div>
              <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${progressColor} transition-all duration-500`} 
                  style={{ width: `${Math.min(chatPercent, 100)}%` }}
                ></div>
              </div>
            </div>
          )}

          <button 
            onClick={() => setActiveTool('subscription')}
            className={`w-full text-white text-xs font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
              isPremium 
              ? 'bg-gray-800 hover:bg-gray-700' 
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500'
            }`}
          >
            <i className={`fa-solid ${isPremium ? 'fa-user-gear' : 'fa-crown'}`}></i>
            <span className="hidden lg:block">{isPremium ? 'Manage Subscription' : 'Upgrade to Pro'}</span>
          </button>
          
          <div className="flex items-center gap-3 px-2 py-2 bg-white/5 rounded-2xl border border-white/5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white border border-white/10 shrink-0 ${
              plan === 'pro' ? 'bg-gradient-to-br from-blue-600 to-blue-800' : 
              plan === 'enterprise' ? 'bg-gradient-to-br from-purple-600 to-purple-800' :
              'bg-gradient-to-br from-gray-700 to-gray-800'
            }`}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden lg:block overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{userName}</p>
              <p className={`text-[10px] font-bold uppercase tracking-tighter ${
                plan === 'pro' ? 'text-blue-400' : plan === 'enterprise' ? 'text-purple-400' : 'text-gray-500'
              }`}>
                {plan === 'free' ? 'Standard Account' : `${plan} Identity`}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-gray-950">
        <header className="h-16 border-b border-gray-800 bg-gray-950/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-100 capitalize">{activeTool.replace('-', ' ')} Tool</h1>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
              isPremium 
              ? 'bg-purple-500/20 text-purple-400 border-purple-500/20' 
              : 'bg-blue-500/20 text-blue-400 border-blue-500/20'
            }`}>
              {isPremium ? `${plan} Unlocked` : 'Powered by Gemini 3'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <i className="fa-solid fa-bell"></i>
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors" onClick={() => setActiveTool('subscription')}>
              <i className="fa-solid fa-gear"></i>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          {children}
        </div>

        {/* Mobile Nav */}
        <nav className="md:hidden h-20 bg-gray-900 border-t border-gray-800 flex items-center justify-around px-2 pb-2 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.type}
              onClick={() => setActiveTool(item.type)}
              className={`flex flex-col items-center gap-1 transition-all px-4 ${
                activeTool === item.type ? 'text-blue-400' : 'text-gray-500'
              }`}
            >
              <i className={`fa-solid ${item.icon} text-xl`}></i>
              <span className="text-[10px] font-medium whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default Layout;
