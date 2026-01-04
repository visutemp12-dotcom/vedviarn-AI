
import React, { useState } from 'react';
import Layout from './components/Layout';
import ChatTool from './components/ChatTool';
import ImageTool from './components/ImageTool';
import VideoTool from './components/VideoTool';
import LiveVoiceTool from './components/LiveVoiceTool';
import AnalyzerTool from './components/AnalyzerTool';
import TTSTool from './components/TTSTool';
import { ToolType } from './types';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>('chat');

  const renderTool = () => {
    switch (activeTool) {
      case 'chat': return <ChatTool />;
      case 'image': return <ImageTool />;
      case 'video': return <VideoTool />;
      case 'voice': return <LiveVoiceTool />;
      case 'analyze': return <AnalyzerTool />;
      case 'tts': return <TTSTool />;
      default: return <ChatTool />;
    }
  };

  return (
    <Layout activeTool={activeTool} setActiveTool={setActiveTool}>
      {renderTool()}
    </Layout>
  );
};

export default App;
