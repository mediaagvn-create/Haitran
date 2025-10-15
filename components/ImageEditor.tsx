
import React, { useState } from 'react';
import type { ImageFile, Quality } from '../types';
import { fileToBase64 } from '../utils/fileUtils';
import { editImage } from '../services/geminiService';
import { WandIcon } from './icons/WandIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { Spinner } from './common/Spinner';
import QualitySelector from './common/QualitySelector';

const ImageEditor: React.FC = () => {
    const [baseImage, setBaseImage] = useState<ImageFile | null>(null);
    const [prompt, setPrompt] = useState('');
    const [quality, setQuality] = useState<Quality>('standard');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [lastPrompt, setLastPrompt] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBaseImage({ file, preview: URL.createObjectURL(file) });
        }
    };

    const handleEdit = async () => {
        if (!baseImage || !prompt.trim() || loading) return;

        setLoading(true);
        setError(null);
        setResultImage(null);

        try {
            const base64Data = await fileToBase64(baseImage.file);
            const result = await editImage(
                { data: base64Data, mimeType: baseImage.file.type },
                prompt,
                quality
            );
            setResultImage(result);
            setLastPrompt(prompt);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.');
        } finally {
            setLoading(false);
        }
    };
    
    const downloadResult = () => {
      if (!resultImage) return;
      const link = document.createElement('a');
      link.href = `data:image/jpeg;base64,${resultImage}`;
      const safePrompt = lastPrompt.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
      link.download = `ai-edited-image-${safePrompt}.jpeg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <h3 className="font-semibold text-white">1. Tải lên ảnh để chỉnh sửa</h3>
                        <p className="text-sm text-gray-400 mb-3">Điểm khởi đầu cho tác phẩm của bạn.</p>
                        <div className="aspect-square w-full rounded-md border-2 border-dashed border-gray-600 flex items-center justify-center relative overflow-hidden">
                            {baseImage ? (
                                <img src={baseImage.preview} alt="Xem trước" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center text-gray-500">
                                    <svg className="mx-auto h-10 w-10" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                                    <p className="text-xs mt-1">PNG, JPG, WEBP</p>
                                </div>
                            )}
                            <input
                                id="base-upload"
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="edit-prompt" className="block text-sm font-medium text-gray-300 mb-2">
                            2. Mô tả chỉnh sửa của bạn
                        </label>
                        <textarea
                            id="edit-prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="ví dụ: Thay đổi nền thành phong cảnh núi tuyết"
                            className="w-full h-24 p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-white placeholder-gray-500"
                            disabled={loading}
                        />
                    </div>
                     <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                        <QualitySelector quality={quality} setQuality={setQuality} disabled={loading} />
                    </div>
                    <div>
                        <button
                            onClick={handleEdit}
                            disabled={loading || !prompt.trim() || !baseImage}
                            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            {loading ? <Spinner /> : <WandIcon />}
                            <span>{loading ? 'Đang chỉnh sửa...' : 'Áp dụng chỉnh sửa'}</span>
                        </button>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <h3 className="font-semibold text-white mb-3">Kết quả</h3>
                    <div className="aspect-square w-full rounded-lg border-2 border-dashed border-gray-700 bg-gray-800 flex items-center justify-center relative group overflow-hidden">
                        {loading && <Spinner size="lg" />}
                        {!loading && resultImage && (
                           <>
                            <img src={`data:image/jpeg;base64,${resultImage}`} alt="Kết quả chỉnh sửa" className="w-full h-full object-contain" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <button
                                  onClick={downloadResult}
                                  className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
                                  aria-label="Tải xuống ảnh"
                                >
                                  <DownloadIcon />
                                </button>
                              </div>
                           </>
                        )}
                        {!loading && !resultImage && (
                             <div className="text-center text-gray-500 p-4">
                                <WandIcon className="mx-auto h-12 w-12" />
                                <p className="mt-2 text-sm">Ảnh đã chỉnh sửa của bạn sẽ xuất hiện ở đây.</p>
                            </div>
                         )}
                    </div>
                </div>
            </div>
            {error && <div className="bg-red-900/50 text-red-200 border border-red-700 p-4 rounded-lg mt-4">{error}</div>}
        </div>
    );
};

export default ImageEditor;
