import React, { useState, useRef, useEffect } from 'react';
import type { ImageFile, Quality } from '../types';
import { fileToBase64 } from '../utils/fileUtils';
import { removeWatermark, detectWatermarkMask } from '../services/geminiService';
import { ShieldOffIcon } from './icons/ShieldOffIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { Spinner } from './common/Spinner';
import { BrushIcon } from './icons/BrushIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ResetIcon } from './icons/ResetIcon';
import QualitySelector from './common/QualitySelector';

const Dewatermark: React.FC = () => {
    const [baseImage, setBaseImage] = useState<ImageFile | null>(null);
    const [loading, setLoading] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isTextRemovalMode, setIsTextRemovalMode] = useState(false);
    const [quality, setQuality] = useState<Quality>('standard');

    const [isManualEditing, setIsManualEditing] = useState(false);
    const [autoMaskData, setAutoMaskData] = useState<string | null>(null);
    const [brushSize, setBrushSize] = useState(30);
    const [isDrawing, setIsDrawing] = useState(false);
    const imageCanvasRef = useRef<HTMLCanvasElement>(null);
    const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
    const lastPosRef = useRef<{ x: number, y: number } | null>(null);

    useEffect(() => {
        if (isManualEditing && baseImage && imageCanvasRef.current && drawingCanvasRef.current) {
            const imageCanvas = imageCanvasRef.current;
            const drawingCanvas = drawingCanvasRef.current;
            const imageCtx = imageCanvas.getContext('2d');
            const drawingCtx = drawingCanvas.getContext('2d', { willReadFrequently: true });
            if (!imageCtx || !drawingCtx) return;

            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = baseImage.preview;
            img.onload = () => {
                const { naturalWidth, naturalHeight } = img;
                imageCanvas.width = naturalWidth;
                imageCanvas.height = naturalHeight;
                drawingCanvas.width = naturalWidth;
                drawingCanvas.height = naturalHeight;

                imageCtx.drawImage(img, 0, 0);

                if (autoMaskData) {
                    const maskImg = new Image();
                    maskImg.src = `data:image/png;base64,${autoMaskData}`;
                    maskImg.onload = () => {
                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = maskImg.naturalWidth;
                        tempCanvas.height = maskImg.naturalHeight;
                        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
                        if (!tempCtx) return;

                        tempCtx.drawImage(maskImg, 0, 0);
                        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
                        const data = imageData.data;

                        for (let i = 0; i < data.length; i += 4) {
                            if (data[i] > 128 || data[i+1] > 128 || data[i+2] > 128) { // If pixel is not black
                                data[i] = 239;     // R (red-500)
                                data[i+1] = 68;      // G
                                data[i+2] = 68;      // B
                                data[i+3] = 128;     // A (50% opacity)
                            } else {
                                data[i+3] = 0;     // Make black pixels transparent
                            }
                        }
                        tempCtx.putImageData(imageData, 0, 0);
                        drawingCtx.drawImage(tempCanvas, 0, 0);
                        setAutoMaskData(null); 
                    }
                } else {
                    drawingCtx.clearRect(0, 0, naturalWidth, naturalHeight);
                }
            };
        }
    }, [isManualEditing, baseImage, autoMaskData]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBaseImage({ file, preview: URL.createObjectURL(file) });
            setResultImage(null);
            setError(null);
            setIsManualEditing(false);
        }
    };

    const handleQuickRemove = async () => {
        if (!baseImage || loading) return;

        setLoading(true);
        setError(null);
        setResultImage(null);
        setIsManualEditing(false);

        try {
            const base64Data = await fileToBase64(baseImage.file);
            const result = await removeWatermark({ data: base64Data, mimeType: baseImage.file.type }, quality, undefined, isTextRemovalMode);
            setResultImage(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleStartEditing = () => {
        if (!baseImage) return;
        setResultImage(null);
        setError(null);
        setIsManualEditing(true);
    };

    const handleAutoDetect = async () => {
        if (!baseImage || isDetecting) return;
        setIsDetecting(true);
        setError(null);
        try {
            const base64Data = await fileToBase64(baseImage.file);
            const mask = await detectWatermarkMask({ data: base64Data, mimeType: baseImage.file.type });
            setAutoMaskData(mask);
        } catch(err) {
            setError(err instanceof Error ? err.message : 'Không thể tự động phát hiện.');
        } finally {
            setIsDetecting(false);
        }
    };

    const getScaledPos = (canvas: HTMLCanvasElement, evt: React.MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (evt.clientX - rect.left) * (canvas.width / rect.width),
            y: (evt.clientY - rect.top) * (canvas.height / rect.height),
        };
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!drawingCanvasRef.current) return;
        setIsDrawing(true);
        const pos = getScaledPos(drawingCanvasRef.current, e);
        lastPosRef.current = pos;
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        lastPosRef.current = null;
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !drawingCanvasRef.current || !lastPosRef.current) return;
        const canvas = drawingCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const currentPos = getScaledPos(canvas, e);

        ctx.beginPath();
        ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)'; // Semi-transparent red
        ctx.stroke();

        lastPosRef.current = currentPos;
    };

    const handleFinalRemove = async () => {
        if (!baseImage || !drawingCanvasRef.current) return;
        
        const maskCanvas = drawingCanvasRef.current;
        const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
        if (!maskCtx) return;

        const originalImageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
        const pixelBuffer = new Uint32Array(originalImageData.data.buffer);
        if (!pixelBuffer.some(color => color !== 0)) {
            setError("Vui lòng dùng cọ đánh dấu các khu vực cần xóa trước khi áp dụng.");
            return;
        }

        const bwCanvas = document.createElement('canvas');
        bwCanvas.width = maskCanvas.width;
        bwCanvas.height = maskCanvas.height;
        const bwCtx = bwCanvas.getContext('2d');
        if (!bwCtx) return;

        const originalData = originalImageData.data;
        const bwImageData = bwCtx.createImageData(maskCanvas.width, maskCanvas.height);
        const bwData = bwImageData.data;
        
        for (let i = 0; i < originalData.length; i += 4) {
            if (originalData[i + 3] > 0) { // If pixel is not transparent
                bwData[i] = 255;
                bwData[i+1] = 255;
                bwData[i+2] = 255;
                bwData[i+3] = 255;
            }
        }
        bwCtx.putImageData(bwImageData, 0, 0);
        const maskData = bwCanvas.toDataURL('image/png').split(',')[1];

        setLoading(true);
        setError(null);

        try {
            const base64Data = await fileToBase64(baseImage.file);
            const result = await removeWatermark(
                { data: base64Data, mimeType: baseImage.file.type },
                quality,
                { data: maskData, mimeType: 'image/png' }
            );
            setResultImage(result);
            setIsManualEditing(false);
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
      link.download = `ai-dewatermarked-image.jpeg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    
    const renderContent = () => {
        if (isManualEditing) {
            return (
                 <div className="lg:col-span-1">
                     <h3 className="font-semibold text-white mb-3">Chỉnh sửa Vùng chọn</h3>
                    <div className="aspect-square w-full rounded-lg border-2 border-dashed border-gray-700 bg-gray-800 flex items-center justify-center relative group overflow-hidden">
                        {loading && <Spinner size="lg" />}
                        <div className="absolute inset-0 cursor-crosshair">
                            <canvas ref={imageCanvasRef} className="w-full h-full object-contain" style={{ position: 'absolute', top: 0, left: 0 }} />
                            <canvas 
                                ref={drawingCanvasRef}
                                className="w-full h-full object-contain"
                                style={{ position: 'absolute', top: 0, left: 0 }}
                                onMouseDown={startDrawing}
                                onMouseUp={stopDrawing}
                                onMouseOut={stopDrawing}
                                onMouseMove={draw}
                            />
                        </div>
                    </div>
                     <div className="mt-4 space-y-4 p-4 bg-gray-700/50 rounded-lg animate-fade-in">
                        <p className="text-sm text-gray-300">Tô lên các khu vực bạn muốn xóa. Sử dụng AI để giúp bạn bắt đầu.</p>
                        
                         <button onClick={handleAutoDetect} disabled={isDetecting} className="w-full flex items-center justify-center space-x-2 bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors disabled:bg-gray-500 disabled:cursor-wait">
                            {isDetecting ? <Spinner /> : <SparklesIcon />}
                           <span>{isDetecting ? 'Đang phát hiện...' : 'Dùng AI Phát hiện Vùng chọn'}</span>
                         </button>
                        
                        <div className="flex items-center gap-3 pt-2">
                            <label htmlFor="brush-size" className="text-sm font-medium text-gray-200">Kích thước cọ</label>
                            <input 
                                type="range" 
                                id="brush-size" 
                                min="5" 
                                max="100" 
                                value={brushSize}
                                onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
                                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-sm w-8 text-center bg-gray-800 rounded-md py-1">{brushSize}</span>
                        </div>
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button onClick={() => setIsManualEditing(false)} className="bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">Hủy</button>
                            <button onClick={handleFinalRemove} disabled={loading} className="flex items-center space-x-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-500">
                               {loading ? <Spinner /> : <ShieldOffIcon className="w-5 h-5" />}
                               <span>{loading ? 'Đang xóa...' : 'Áp dụng & Xóa Watermark'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
             <div className="lg:col-span-1">
                 <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-white">Kết quả</h3>
                     {resultImage && !loading && (
                        <div className="flex items-center space-x-4">
                            <button onClick={() => { setResultImage(null); setError(null); }} className="flex items-center space-x-1 text-sm text-gray-400 hover:text-white transition" title="Thử lại với ảnh gốc">
                                <ResetIcon className="w-4 h-4" />
                                <span>Thử lại</span>
                            </button>
                            <button onClick={downloadResult} className="flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300 transition">
                                <DownloadIcon className="w-5 h-5" />
                                <span>Tải xuống</span>
                            </button>
                        </div>
                    )}
                </div>
                <div className="aspect-square w-full rounded-lg border-2 border-dashed border-gray-700 bg-gray-800 flex items-center justify-center relative group overflow-hidden">
                    {loading && (
                        <div className="text-center">
                            <Spinner size="lg" />
                            <p className="mt-4 text-gray-400">AI đang thực hiện phép màu...</p>
                        </div>
                    )}
                    {!loading && resultImage && (
                       <img src={`data:image/jpeg;base64,${resultImage}`} alt="Kết quả đã xóa watermark" className="w-full h-full object-contain" />
                    )}
                    {!loading && !resultImage && (
                         <div className="text-center text-gray-500 p-4">
                            <ShieldOffIcon className="mx-auto h-12 w-12" />
                            <p className="mt-2 text-sm">Ảnh sạch của bạn sẽ xuất hiện ở đây.</p>
                        </div>
                     )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Xóa Watermark Bằng AI</h2>
                <p className="mt-4 text-lg leading-8 text-gray-400">
                    Xóa watermark, logo và các lớp văn bản khỏi bất kỳ hình ảnh nào một cách nhanh chóng và chính xác.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Left Column: Upload and Action */}
                <div className="space-y-6">
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <h3 className="font-semibold text-white">1. Tải lên ảnh</h3>
                        <p className="text-sm text-gray-400 mb-3">Độ phân giải tối đa 6000x6000px | 10MB. Hỗ trợ PNG, JPG, WEBP, AVIF.</p>
                        <div className="aspect-square w-full rounded-md border-2 border-dashed border-gray-600 flex items-center justify-center relative overflow-hidden">
                            {baseImage ? (
                                <img src={baseImage.preview} alt="Xem trước" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center text-gray-500">
                                    <svg className="mx-auto h-10 w-10" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                                    <p className="mt-2 text-sm">Kéo và thả hoặc nhấp để tải lên</p>
                                </div>
                            )}
                            <input
                                id="base-upload"
                                type="file"
                                accept="image/png, image/jpeg, image/webp, image/avif"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                                disabled={loading || isDetecting}
                            />
                        </div>
                    </div>
                    {!isManualEditing && (
                        <div className="space-y-4">
                             <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                                <QualitySelector quality={quality} setQuality={setQuality} disabled={loading || !baseImage} />
                            </div>
                            <div className="bg-gray-700/50 p-4 rounded-lg flex items-center justify-between">
                                <div>
                                    <label htmlFor="text-removal-toggle" className="font-medium text-white cursor-pointer">Công cụ xóa văn bản</label>
                                    <p className="text-xs text-gray-400">Chế độ chuyên dụng để xóa văn bản cứng đầu.</p>
                                </div>
                                <label htmlFor="text-removal-toggle" className="flex items-center cursor-pointer">
                                    <div className="relative">
                                        <input 
                                            id="text-removal-toggle" 
                                            type="checkbox" 
                                            className="sr-only" 
                                            checked={isTextRemovalMode} 
                                            onChange={(e) => setIsTextRemovalMode(e.target.checked)}
                                            disabled={loading || !baseImage}
                                        />
                                        <div className={`block w-14 h-8 rounded-full transition ${isTextRemovalMode ? 'bg-blue-600' : 'bg-gray-600'}`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isTextRemovalMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </div>
                                </label>
                            </div>
                            <div className="space-y-3">
                                <button
                                    onClick={handleQuickRemove}
                                    disabled={loading || !baseImage}
                                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    {loading ? <Spinner /> : <ShieldOffIcon />}
                                    <span>{loading ? 'Đang xử lý...' : isTextRemovalMode ? 'Xóa Văn bản bằng AI' : 'Xóa Nhanh Watermark'}</span>
                                </button>
                                 <button
                                    onClick={handleStartEditing}
                                    disabled={loading || !baseImage}
                                    className="w-full flex items-center justify-center space-x-2 bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    <BrushIcon />
                                    <span>Bắt đầu Chỉnh sửa Vùng chọn</span>
                                </button>
                            </div>
                        </div>
                    )}
                     <div className="text-sm text-gray-400 space-y-3 pt-2">
                        <p><strong>Xóa Nhanh:</strong> Giải pháp một cú nhấp chuột để AI tự động tìm và xóa watermark.</p>
                        <p><strong>Chỉnh sửa Vùng chọn:</strong> Tự mình kiểm soát bằng cách vẽ một mặt nạ chính xác trên các vùng cần xóa. Sử dụng tính năng phát hiện của AI để bắt đầu, sau đó tinh chỉnh vùng chọn để có kết quả hoàn hảo.</p>
                     </div>
                </div>

                {/* Right Column: Result / Editor */}
                {renderContent()}
            </div>
            {error && <div className="bg-red-900/50 text-red-200 border border-red-700 p-4 rounded-lg mt-4 animate-fade-in">{error}</div>}
        </div>
    );
};

export default Dewatermark;
