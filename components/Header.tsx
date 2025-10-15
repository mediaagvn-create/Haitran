import React from 'react';
import type { ActiveTab } from '../types';
import TabButton from './TabButton';
import { SparklesIcon } from './icons/SparklesIcon';
import { LayersIcon } from './icons/LayersIcon';
import { WandIcon } from './icons/WandIcon';
import { ShieldOffIcon } from './icons/ShieldOffIcon';
import { BackgroundIcon } from './icons/BackgroundIcon';
import { VideoIcon } from './icons/VideoIcon';
import { MicIcon } from './icons/MicIcon';
import { UpscaleIcon } from './icons/UpscaleIcon';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <svg className="w-8 h-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm3.685 6.883-2.568 4.726 4.726-2.568a6.5 6.5 0 0 0-2.158-2.158zm-7.37 0a6.501 6.501 0 0 0-2.158 2.158l4.726 2.568-2.568-4.726zm2.158 6.234-4.726 2.568a6.5 6.5 0 0 0 2.158 2.158l2.568-4.726zm4.726 2.568 2.568 4.726a6.5 6.5 0 0 0 2.158-2.158l-4.726-2.568zM12 13.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
            </svg>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Studio Ảnh AI</h1>
          </div>
          <nav className="flex items-center bg-gray-800 rounded-lg p-1 space-x-1">
            <TabButton
              isActive={activeTab === 'generate'}
              onClick={() => setActiveTab('generate')}
              icon={<SparklesIcon />}
            >
              Tạo ảnh
            </TabButton>
            <TabButton
              isActive={activeTab === 'fuse'}
              onClick={() => setActiveTab('fuse')}
              icon={<LayersIcon />}
            >
              Kết hợp
            </TabButton>
            <TabButton
              isActive={activeTab === 'edit'}
              onClick={() => setActiveTab('edit')}
              icon={<WandIcon />}
            >
              Chỉnh sửa
            </TabButton>
             <TabButton
              isActive={activeTab === 'upscale'}
              onClick={() => setActiveTab('upscale')}
              icon={<UpscaleIcon />}
            >
              Cải thiện
            </TabButton>
            <TabButton
              isActive={activeTab === 'voice-generator'}
              onClick={() => setActiveTab('voice-generator')}
              icon={<MicIcon />}
            >
              Giọng nói AI
            </TabButton>
            <TabButton
              isActive={activeTab === 'video-veo'}
              onClick={() => setActiveTab('video-veo')}
              icon={<VideoIcon />}
            >
              Video Veo
            </TabButton>
            <TabButton
              isActive={activeTab === 'dewatermark'}
              onClick={() => setActiveTab('dewatermark')}
              icon={<ShieldOffIcon />}
            >
              Xóa Watermark
            </TabButton>
            <TabButton
              isActive={activeTab === 'remove-background'}
              onClick={() => setActiveTab('remove-background')}
              icon={<BackgroundIcon />}
            >
              Xóa Nền
            </TabButton>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
