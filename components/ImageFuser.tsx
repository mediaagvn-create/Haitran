
import React, { useState } from 'react';
import type { ImageFile, Quality } from '../types';
import { fileToBase64 } from '../utils/fileUtils';
import { fuseImages } from '../services/geminiService';
import { LayersIcon } from './icons/LayersIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { Spinner } from './common/Spinner';
import QualitySelector from './common/QualitySelector';

const ImageUpload: React.FC<{
    id: string;
    title: string;
    description: string;
    imageFile: ImageFile | null;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled: boolean;
}> = ({ id, title, description, imageFile, onFileChange, disabled }) => {
    return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-full flex flex-col">
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-sm text-gray-400 mb-3">{description}</p>
            <div className="aspect-square w-full rounded-md border-2 border-dashed border-gray-600 flex items-center justify-center relative overflow-hidden mt-auto">
                {imageFile ? (
                    <img src={imageFile.preview} alt="Xem trước" className="w-full h-full object-cover" />
                ) : (
                    <div className="text-center text-gray-500">
                        <svg className="mx-auto h-10 w-10" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                        <p className="text-xs mt-1">PNG, JPG, WEBP</p>
                    </div>
                )}
                <input
                    id={id}
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={onFileChange}
                    disabled={disabled}
                />
            </div>
        </div>
    );
};

const MAX_SLOTS = 5;
const MIN_SLOTS = 2;

const ImageFuser: React.FC = () => {
    const [imageSlots, setImageSlots] = useState<(ImageFile | null)[]>([null, null]);
    const [prompt, setPrompt] = useState('');
    const [quality, setQuality] = useState<Quality>('standard');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [lastPrompt, setLastPrompt] = useState('');

    const handleFileChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const newSlots = [...imageSlots];
            newSlots[index] = { file, preview: URL.createObjectURL(file) };
            setImageSlots(newSlots);
        }
    };

    const addSlot = () => {
        if (imageSlots.length < MAX_SLOTS) {
            setImageSlots([...imageSlots, null]);
        }
    };

    const removeSlot = () => {
        if (imageSlots.length > MIN_SLOTS) {
            setImageSlots(imageSlots.slice(0, -1));
        }
    };

    const handleFuse = async () => {
        const uploadedImages = imageSlots.filter((slot): slot is ImageFile => slot !== null);
        if (uploadedImages.length < 2 || !prompt.trim() || loading) {
            if (uploadedImages.length < 2) {
                setError("Vui lòng tải lên ít nhất 2 ảnh để kết hợp.");
            }
            return;
        }

        setLoading(true);
        setError(null);
        setResultImage(null);

        try {
            const imagePromises = uploadedImages.map(imgFile =>
                fileToBase64(imgFile.file).then(data => ({ data, mimeType: imgFile.file.type }))
            );
            const base64Images = await Promise.all(imagePromises);
            
            const result = await fuseImages(base64Images, prompt, quality);
            
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
      link.download = `ai-fused-image-${safePrompt}.jpeg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const uploadedImagesCount = imageSlots.filter(Boolean).length;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                           <h3 className="font-semibold text-white">1. Tải lên các ảnh của bạn</h3>
                           <div className="flex items-center gap-2">
                                <button
                                    onClick={removeSlot}
                                    disabled={loading || imageSlots.length <= MIN_SLOTS}
                                    className="px-3 py-1 text-sm bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >- Xóa</button>
                                <button
                                    onClick={addSlot}
                                    disabled={loading || imageSlots.length >= MAX_SLOTS}
                                    className="px-3 py-1 text-sm bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >+ Thêm</button>
                           </div>
                        </div>
                        <div className={`grid grid-cols-2 ${imageSlots.length > 2 ? 'sm:grid-cols-3' : ''} ${imageSlots.length > 4 ? 'md:grid-cols-5' : ''} gap-4`}>
                           {imageSlots.map((slot, index) => (
                               <ImageUpload
                                    key={index}
                                    id={`fuse-upload-${index}`}
                                    title={`Ảnh ${index + 1}`}
                                    description={index === 0 ? "Chủ thể chính." : "Đối tượng phụ."}
                                    imageFile={slot}
                                    onFileChange={handleFileChange(index)}
                                    disabled={loading}
                                />
                           ))}
                        </div>
                    </div>
                     <div>
                        <label htmlFor="fuse-prompt" className="block text-sm font-medium text-gray-300 mb-2">
                          2. Mô tả bối cảnh
                        </label>
                        <textarea
                          id="fuse-prompt"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="ví dụ: Ảnh 1 đứng trên bãi biển ở Bali, cầm sản phẩm từ Ảnh 2, lúc hoàng hôn, ánh sáng điện ảnh"
                          className="w-full h-24 p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-white placeholder-gray-500"
                          disabled={loading}
                        />
                      </div>
                       <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                         <QualitySelector quality={quality} setQuality={setQuality} disabled={loading} />
                       </div>
                      <div>
                        <button
                            onClick={handleFuse}
                            disabled={loading || !prompt.trim() || uploadedImagesCount < 2}
                            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            {loading ? <Spinner /> : <LayersIcon />}
                            <span>{loading ? 'Đang kết hợp...' : 'Kết hợp ảnh'}</span>
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <h3 className="font-semibold text-white mb-3">Kết quả</h3>
                    <div className="aspect-square w-full rounded-lg border-2 border-dashed border-gray-700 bg-gray-800 flex items-center justify-center relative group overflow-hidden">
                        {loading && <Spinner size="lg" />}
                        {!loading && resultImage && (
                            <>
                                <img src={`data:image/jpeg;base64,${resultImage}`} alt="Kết quả kết hợp" className="w-full h-full object-contain" />
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
                                <LayersIcon className="mx-auto h-12 w-12" />
                                <p className="mt-2 text-sm">Tuyệt tác của bạn sẽ xuất hiện ở đây.</p>
                            </div>
                         )}
                    </div>
                </div>
            </div>
             {error && <div className="bg-red-900/50 text-red-200 border border-red-700 p-4 rounded-lg">{error}</div>}
        </div>
    );
};

export default ImageFuser;
