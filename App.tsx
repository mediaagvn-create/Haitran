import React, { useState } from 'react';
import type { ActiveTab } from './types';
import Header from './components/Header';
import ImageGenerator from './components/ImageGenerator';
import ImageFuser from './components/ImageFuser';
import ImageEditor from './components/ImageEditor';
import Dewatermark from './components/Dewatermark';
import RemoveBackground from './components/RemoveBackground';
import VideoGenerator from './components/VideoGenerator';
import VoiceGenerator from './components/VoiceGenerator';
import UpscaleImage from './components/UpscaleImage';


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('generate');

  const renderContent = () => {
    switch (activeTab) {
      case 'generate':
        return <ImageGenerator />;
      case 'fuse':
        return <ImageFuser />;
      case 'edit':
        return <ImageEditor />;
      case 'voice-generator':
        return <VoiceGenerator />;
       case 'video-veo':
        return <VideoGenerator />;
      case 'dewatermark':
        return <Dewatermark />;
      case 'remove-background':
        return <RemoveBackground />;
      case 'upscale':
        return <UpscaleImage />;
      default:
        return <ImageGenerator />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-grow p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm">
        <p>Phát triển bởi Google Gemini. Sản phẩm chỉ mang tính chất minh họa.</p>
      </footer>
    </div>
  );
};

export default App;
