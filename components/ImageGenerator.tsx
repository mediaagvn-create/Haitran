
import React, { useState } from 'react';
import { generateImages } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { Spinner } from './common/Spinner';
import QualitySelector from './common/QualitySelector';
import type { Quality } from '../types';

const ImageCard: React.FC<{ base64Image: string, prompt: string, index: number }> = ({ base64Image, prompt, index }) => {
  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = `data:image/jpeg;base64,${base64Image}`;
    const safePrompt = prompt.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `ai-image-${safePrompt}-${index}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative group overflow-hidden rounded-lg shadow-lg bg-gray-800 aspect-square">
      <img src={`data:image/jpeg;base64,${base64Image}`} alt={`Generated image ${index + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <button
          onClick={downloadImage}
          className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
          aria-label="Tải xuống ảnh"
        >
          <DownloadIcon />
        </button>
      </div>
    </div>
  );
};

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [quality, setQuality] = useState<Quality>('standard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [lastPrompt, setLastPrompt] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    setImages([]);
    try {
      const result = await generateImages(prompt, aspectRatio, quality);
      setImages(result);
      setLastPrompt(prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
              Nhập mô tả sáng tạo của bạn
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="ví dụ: Một cảnh quay điện ảnh của robot cầm ván trượt màu đỏ trong thành phố tương lai"
              className="w-full h-24 p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-white placeholder-gray-500"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="aspectRatio" className="block text-sm font-medium text-gray-300 mb-2">
              Tỷ lệ khung hình
            </label>
            <select
              id="aspectRatio"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-white"
              disabled={loading}
            >
              <option value="1:1">Vuông (1:1)</option>
              <option value="16:9">Màn ảnh rộng (16:9)</option>
              <option value="9:16">Chân dung (9:16)</option>
              <option value="4:3">Phong cảnh (4:3)</option>
              <option value="3:4">Dọc (3:4)</option>
            </select>
          </div>
        </div>
         <div className="mt-6">
            <QualitySelector quality={quality} setQuality={setQuality} disabled={loading} />
          </div>
        <div className="mt-6">
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? <Spinner /> : <SparklesIcon />}
            <span>{loading ? 'Đang tạo...' : 'Tạo 4 ảnh'}</span>
          </button>
        </div>
      </div>
      
      {error && <div className="bg-red-900/50 text-red-200 border border-red-700 p-4 rounded-lg">{error}</div>}

      {loading && (
        <div className="text-center py-10">
            <div className="inline-block"><Spinner size="lg" /></div>
            <p className="mt-4 text-gray-400">Đang xử lý hình ảnh...</p>
        </div>
      )}

      {images.length > 0 && (
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold mb-4">Tác phẩm của bạn</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {images.map((img, index) => (
              <ImageCard key={index} base64Image={img} prompt={lastPrompt} index={index} />
            ))}
          </div>
        </div>
      )}

      {!loading && images.length === 0 && (
         <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-lg">
            <SparklesIcon className="mx-auto h-12 w-12 text-gray-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-300">Hãy tạo ra điều gì đó tuyệt vời</h3>
            <p className="mt-1 text-sm text-gray-500">Ảnh bạn tạo sẽ xuất hiện ở đây.</p>
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;
