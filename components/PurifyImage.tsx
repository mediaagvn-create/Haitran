import React, { useState } from 'react';
import type { ImageFile } from '../types';
import { fileToBase64 } from '../utils/fileUtils';
import { purifyImage } from '../services/geminiService';
import { PurifyIcon } from './icons/PurifyIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { Spinner } from './common/Spinner';

const PurifyImage: React.FC = () => {
    const [baseImage, setBaseImage] = useState<ImageFile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBaseImage({ file, preview: URL.createObjectURL(file) });
            setResultImage(null);
            setError(null);
        }
    };

    const handlePurify = async () => {
        if (!baseImage || loading) return;

        setLoading(true);
        setError(null);
        setResultImage(null);

        try {
            const base64Data = await fileToBase64(baseImage.file);
            const result = await purifyImage({ data: base64Data, mimeType: baseImage.file.type });
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
        link.download = `${originalName}-purified.png`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Công cụ Xóa 100%</h2>
                <p className="mt-4 text-lg leading-8 text-gray-400">
                   Loại bỏ triệt để các yếu tố thừa, chỉ giữ lại chủ thể con người và trang phục.
                </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <h3 className="font-semibold text-white">1. Tải lên ảnh của bạn</h3>
                        <p className="text-sm text-gray-400 mb-3">Chọn một ảnh để làm sạch.</p>
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
                                id="base-upload-purify"
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handlePurify}
                        disabled={loading || !baseImage}
                        className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        {loading ? <Spinner /> : <PurifyIcon />}
                        <span>{loading ? 'Đang xử lý...' : 'Xóa 100%'}</span>
                    </button>
                </div>
                <div className="lg-col-span-1">
                     <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-white">Kết quả</h3>
                         {resultImage && !loading && (
                             <button onClick={downloadResult} className="flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300 transition">
                                <DownloadIcon className="w-5 h-5" />
                                <span>Tải xuống</span>
                            </button>
                        )}
                    </div>
                    <div className="aspect-square w-full rounded-lg border-2 border-dashed border-gray-700 bg-gray-800 flex items-center justify-center relative group overflow-hidden">
                        {loading && <Spinner size="lg" />}

                        {!loading && resultImage && (
                           <>
                            <img src={`data:image/png;base64,${resultImage}`} alt="Kết quả" className="w-full h-full object-contain" />
                           </>
                        )}
                        {!loading && !resultImage && (
                             <div className="text-center text-gray-500 p-4">
                                <PurifyIcon className="mx-auto h-12 w-12" />
                                <p className="mt-2 text-sm">Ảnh đã được làm sạch sẽ xuất hiện ở đây.</p>
                            </div>
                         )}
                    </div>
                </div>
            </div>
            {error && <div className="bg-red-900/50 text-red-200 border border-red-700 p-4 rounded-lg mt-4">{error}</div>}
        </div>
    );
};

export default PurifyImage;
