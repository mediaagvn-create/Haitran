import React, { useState, useRef, useEffect } from 'react';
import type { ImageFile, Quality } from '../types';
import { fileToBase64 } from '../utils/fileUtils';
import { upscaleImage } from '../services/geminiService';
import { UpscaleIcon } from './icons/UpscaleIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { Spinner } from './common/Spinner';
import { ImageIcon } from './icons/ImageIcon';
import QualitySelector from './common/QualitySelector';

const UpscaleImage: React.FC = () => {
    const [baseImage, setBaseImage] = useState<ImageFile | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [quality, setQuality] = useState<Quality>('standard');
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBaseImage({ file, preview: URL.createObjectURL(file) });
            setResultImage(null);
            setError(null);
            setSliderPosition(50);
        }
    };

    const handleUpscale = async () => {
        if (!baseImage || loading) return;

        setLoading(true);
        setError(null);
        setResultImage(null);

        try {
            const base64Data = await fileToBase64(baseImage.file);
            const result = await upscaleImage({ data: base64Data, mimeType: baseImage.file.type }, quality);
            setResultImage(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.');
        } finally {
            setLoading(false);
        }
    };

    const downloadResult = () => {
        if (!resultImage) return;

        const link = document.createElement('a');
        link.href = `data:image/png;base64,${resultImage}`;
        const originalName = baseImage?.file.name.replace(/\.[^/.]+$/, "") || 'image';
        link.download = `${originalName}-upscaled.png`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Slider handlers
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSliderPosition(Number(e.target.value));
    };

    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseLeave = () => setIsDragging(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPosition(position);
    };
    
    useEffect(() => {
        const handleMouseUpGlobal = () => setIsDragging(false);
        window.addEventListener('mouseup', handleMouseUpGlobal);
        return () => window.removeEventListener('mouseup', handleMouseUpGlobal);
    }, []);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Cải thiện chất lượng ảnh</h2>
                <p className="mt-4 text-lg leading-8 text-gray-400">
                    Biến những bức ảnh mờ, độ phân giải thấp thành tác phẩm nghệ thuật sắc nét, chi tiết.
                </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <h3 className="font-semibold text-white">1. Tải lên ảnh</h3>
                        <p className="text-sm text-gray-400 mb-3">Chọn ảnh bạn muốn cải thiện.</p>
                        <div className="aspect-square w-full rounded-md border-2 border-dashed border-gray-600 flex items-center justify-center relative overflow-hidden">
                            {baseImage ? (
                                <img src={baseImage.preview} alt="Xem trước" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center text-gray-500">
                                    <ImageIcon className="mx-auto h-10 w-10" />
                                    <p className="text-xs mt-1">PNG, JPG, WEBP</p>
                                </div>
                            )}
                            <input
                                id="base-upload-upscale"
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                                disabled={loading}
                            />
                        </div>
                    </div>
                     <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                        <QualitySelector quality={quality} setQuality={setQuality} disabled={loading || !baseImage} />
                    </div>
                    <button
                        onClick={handleUpscale}
                        disabled={loading || !baseImage}
                        className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        {loading ? <Spinner /> : <UpscaleIcon />}
                        <span>{loading ? 'Đang cải thiện...' : 'Cải thiện ảnh'}</span>
                    </button>
                </div>
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-white">Kết quả</h3>
                         {resultImage && !loading && (
                             <button onClick={downloadResult} className="flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300 transition">
                                <DownloadIcon className="w-5 h-5" />
                                <span>Tải xuống</span>
                            </button>
                        )}
                    </div>
                    <div className="w-full rounded-lg border-2 border-dashed border-gray-700 bg-gray-800 flex items-center justify-center relative group overflow-hidden select-none"
                         ref={containerRef}
                         onMouseMove={handleMouseMove}
                         onMouseUp={handleMouseUp}
                         onMouseLeave={handleMouseLeave}
                         style={{ aspectRatio: '1 / 1' }}>

                        {loading && (
                            <div className="text-center text-gray-400">
                                <Spinner size="lg" />
                                <p className="mt-2 text-sm">AI đang làm việc chăm chỉ...</p>
                            </div>
                        )}

                        {!loading && !baseImage && (
                             <div className="text-center text-gray-500 p-4">
                                <UpscaleIcon className="mx-auto h-12 w-12" />
                                <p className="mt-2 text-sm">Kết quả cải thiện sẽ xuất hiện ở đây.</p>
                            </div>
                        )}

                        {baseImage && (
                            <>
                                <img src={baseImage.preview} alt="Ảnh gốc" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />

                                {resultImage && (
                                    <>
                                        <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}>
                                             <img src={`data:image/png;base64,${resultImage}`} alt="Kết quả cải thiện" className="absolute inset-0 w-full h-full object-contain" />
                                        </div>
                                        <div className="absolute inset-y-0 h-full w-1 bg-white/50 cursor-ew-resize"
                                             style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                                             onMouseDown={handleMouseDown}>
                                             <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg border-2 border-gray-300 flex items-center justify-center">
                                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
                                             </div>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                    {resultImage && (
                        <div className="mt-4">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={sliderPosition}
                                onChange={handleSliderChange}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                aria-label="So sánh ảnh"
                            />
                        </div>
                    )}
                </div>
            </div>
            {error && <div className="bg-red-900/50 text-red-200 border border-red-700 p-4 rounded-lg mt-4">{error}</div>}
        </div>
    );
};

export default UpscaleImage;
