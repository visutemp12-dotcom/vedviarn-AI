
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Auth from './components/Auth';
import ChatTool from './components/ChatTool';
import ImageTool from './components/ImageTool';
import VideoTool from './components/VideoTool';
import LiveVoiceTool from './components/LiveVoiceTool';
import AnalyzerTool from './components/AnalyzerTool';
import TTSTool from './components/TTSTool';
import SubscriptionTool from './components/SubscriptionTool';
import GameTool from './components/GameTool';
import { ToolType } from './types';
import { getUserPlan } from './utils/usage';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>('chat');
  const [user, setUser] = useState<{name: string, email: string, plan: string} | null>(null);

  const loadUser = () => {
    const stored = localStorage.getItem('vedviarn_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  };

  useEffect(() => {
    loadUser();
    // Listen for storage changes from other tabs/windows or local updates
    window.addEventListener('usageUpdated', loadUser);
    return () => window.removeEventListener('usageUpdated', loadUser);
  }, []);

  const handleSignUp = (name: string, email: string) => {
    const userData = { name, email, plan: 'free' };
    localStorage.setItem('vedviarn_user', JSON.stringify(userData));
    setUser(userData);
  };

  const renderTool = () => {
    switch (activeTool) {
      case 'chat': return <ChatTool />;
      case 'image': return <ImageTool />;
      case 'video': return <VideoTool />;
      case 'voice': return <LiveVoiceTool />;
      case 'analyze': return <AnalyzerTool />;
      case 'tts': return <TTSTool />;
      case 'subscription': return <SubscriptionTool />;
      case 'game': return <GameTool />;
      default: return <ChatTool />;
    }
  };

  if (!user) {
    return <Auth onSignUp={handleSignUp} />;
  }

  return (
    <Layout 
      activeTool={activeTool} 
      setActiveTool={setActiveTool}
      userName={user.name}
    >
      {renderTool()}
    </Layout>
  );
};

export default App;
