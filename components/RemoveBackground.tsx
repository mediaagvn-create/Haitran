import React, { useState } from 'react';
import type { ImageFile, Quality } from '../types';
import { imageUrlToBase64, fileToBase64 } from '../utils/fileUtils';
import { removeBackground, customizeBackground, replaceBackgroundWithImage } from '../services/geminiService';
import { backgroundCategories, BackgroundImage } from '../data/backgrounds';
import { BackgroundIcon } from './icons/BackgroundIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { Spinner } from './common/Spinner';
import { TransparencyIcon } from './icons/TransparencyIcon';
import { WandIcon } from './icons/WandIcon';
import { ImageIcon } from './icons/ImageIcon';
import QualitySelector from './common/QualitySelector';

const ColorSwatch: React.FC<{ color: string, activeColor: string, onClick: (color: string) => void }> = ({ color, activeColor, onClick }) => {
    const isActive = activeColor === color;
    return (
        <button
            type="button"
            className={`w-8 h-8 rounded-full border-2 transition-transform duration-150 ${isActive ? 'border-blue-400 scale-110' : 'border-gray-600 hover:scale-110'}`}
            style={{ backgroundColor: color }}
            onClick={() => onClick(color)}
            aria-label={`Set background to ${color}`}
        />
    );
};


const RemoveBackground: React.FC = () => {
    const [baseImage, setBaseImage] = useState<ImageFile | null>(null);
    const [loading, setLoading] = useState(false);
    const [isCustomizing, setIsCustomizing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null); // Transparent BG
    const [finalImage, setFinalImage] = useState<string | null>(null); // Customized BG
    const [quality, setQuality] = useState<Quality>('standard');
    
    // Customization state
    const [customizationTab, setCustomizationTab] = useState<'color' | 'gallery'>('color');
    const [galleryCategory, setGalleryCategory] = useState<keyof typeof backgroundCategories>('nature');
    const [bgColor, setBgColor] = useState<string>('transparent');
    const [selectedBg, setSelectedBg] = useState<BackgroundImage | null>(null);
    const [addShadow, setAddShadow] = useState<boolean>(true);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBaseImage({ file, preview: URL.createObjectURL(file) });
            setResultImage(null);
            setFinalImage(null);
            setError(null);
            setBgColor('transparent');
            setSelectedBg(null);
        }
    };

    const handleRemove = async () => {
        if (!baseImage || loading) return;

        setLoading(true);
        setError(null);
        setResultImage(null);
        setFinalImage(null);

        try {
            const base64Data = await fileToBase64(baseImage.file);
            const result = await removeBackground({ data: base64Data, mimeType: baseImage.file.type }, quality);
            setResultImage(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleApplyCustomization = async () => {
        if (!resultImage || isCustomizing) return;
    
        setIsCustomizing(true);
        setError(null);
        setFinalImage(null);
    
        try {
            let result;
            if (customizationTab === 'gallery' && selectedBg) {
                const bgImageBase64 = await imageUrlToBase64(selectedBg.full);
                result = await replaceBackgroundWithImage(
                    { data: resultImage, mimeType: 'image/png' },
                    bgImageBase64,
                    addShadow,
                    quality
                );
            } else if (customizationTab === 'color' && bgColor !== 'transparent') {
                result = await customizeBackground(
                    { data: resultImage, mimeType: 'image/png' },
                    bgColor,
                    addShadow,
                    quality
                );
            } else {
                 // If transparent is selected, there's nothing to apply.
                setIsCustomizing(false);
                return;
            }
            setFinalImage(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tùy chỉnh.');
        } finally {
            setIsCustomizing(false);
        }
    };

    const handleColorSelect = (color: string) => {
        setBgColor(color);
        setSelectedBg(null);
        setFinalImage(null);
    };

    const handleBgImageSelect = (bg: BackgroundImage) => {
        setSelectedBg(bg);
        setBgColor('transparent');
        setFinalImage(null);
    };
    
    const downloadResult = () => {
        const imageToDownload = finalImage || resultImage;
        if (!imageToDownload) return;

        const link = document.createElement('a');
        link.href = `data:image/png;base64,${imageToDownload}`;
        const originalName = baseImage?.file.name.replace(/\.[^/.]+$/, "") || 'image';
        
        let suffix = '-no-bg';
        if (finalImage) {
            suffix = selectedBg ? `-${selectedBg.id}` : `-bg-${bgColor.replace('#', '')}`;
        }
        link.download = `${originalName}${suffix}.png`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const checkeredBgStyle = {
      backgroundImage:
        'linear-gradient(45deg, #4b5563 25%, transparent 25%), linear-gradient(-45deg, #4b5563 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #4b5563 75%), linear-gradient(-45deg, transparent 75%, #4b5563 75%)',
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
    };

    const isPreviewingTransparent = !selectedBg && bgColor === 'transparent';
    const canApply = (customizationTab === 'color' && bgColor !== 'transparent') || (customizationTab === 'gallery' && selectedBg !== null);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Công cụ Xóa Nền Ảnh</h2>
                <p className="mt-4 text-lg leading-8 text-gray-400">
                    Tự động xóa nền, sau đó thêm màu và bóng đổ để tạo nên hình ảnh hoàn hảo.
                </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <h3 className="font-semibold text-white">1. Tải lên ảnh của bạn</h3>
                        <p className="text-sm text-gray-400 mb-3">Chọn một ảnh để bắt đầu.</p>
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
                                id="base-upload-bg"
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                                disabled={loading || isCustomizing}
                            />
                        </div>
                    </div>

                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                        <QualitySelector quality={quality} setQuality={setQuality} disabled={loading || isCustomizing || !baseImage} />
                    </div>

                    {!resultImage && (
                        <button
                            onClick={handleRemove}
                            disabled={loading || !baseImage}
                            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            {loading ? <Spinner /> : <BackgroundIcon />}
                            <span>{loading ? 'Đang xóa nền...' : 'Xóa Nền'}</span>
                        </button>
                    )}

                    {resultImage && (
                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-4 animate-fade-in">
                            <h3 className="font-semibold text-white">2. Tùy chỉnh nền</h3>
                            <div className="border-b border-gray-700">
                                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                                    <button onClick={() => setCustomizationTab('color')} className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${customizationTab === 'color' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>Màu nền</button>
                                    <button onClick={() => setCustomizationTab('gallery')} className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${customizationTab === 'gallery' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>Thư viện</button>
                                </nav>
                            </div>
                            
                            {customizationTab === 'color' && (
                                <div className="flex items-center space-x-3 pt-2 animate-fade-in">
                                    <button onClick={() => handleColorSelect('transparent')} className={`p-1 rounded-full border-2 transition ${isPreviewingTransparent ? 'border-blue-400' : 'border-gray-600'}`}><TransparencyIcon className="w-6 h-6 rounded-md" /></button>
                                    <ColorSwatch color="#FFFFFF" activeColor={bgColor} onClick={handleColorSelect} />
                                    <ColorSwatch color="#000000" activeColor={bgColor} onClick={handleColorSelect} />
                                    <ColorSwatch color="#9CA3AF" activeColor={bgColor} onClick={handleColorSelect} />
                                    <div className="relative w-8 h-8">
                                        <input type="color" value={bgColor === 'transparent' ? '#FFFFFF' : bgColor} onChange={(e) => handleColorSelect(e.target.value)} className="w-full h-full absolute top-0 left-0 opacity-0 cursor-pointer" />
                                        <div className="w-8 h-8 rounded-full border-2 border-gray-600 pointer-events-none" style={{ background: `linear-gradient(135deg, ${bgColor} 50%, #6b7280 50%)`}}></div>
                                    </div>
                                </div>
                            )}

                             {customizationTab === 'gallery' && (
                                <div className="space-y-3 pt-2 animate-fade-in">
                                    <div className="flex items-center space-x-2 rounded-lg bg-gray-900 p-1">
                                        {Object.keys(backgroundCategories).map((cat) => (
                                            <button key={cat} onClick={() => setGalleryCategory(cat as keyof typeof backgroundCategories)} className={`w-full text-sm rounded-md py-1.5 px-2 transition ${galleryCategory === cat ? 'bg-blue-600 text-white shadow' : 'text-gray-300 hover:bg-gray-700'}`}>
                                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-2">
                                        {backgroundCategories[galleryCategory].map(bg => (
                                            <button key={bg.id} onClick={() => handleBgImageSelect(bg)} className={`relative aspect-square rounded-md overflow-hidden transition-transform duration-150 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 ${selectedBg?.id === bg.id ? 'ring-2 ring-blue-500' : ''}`}>
                                                <img src={bg.thumbnail} alt={bg.description} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                             
                            <div className="flex items-center justify-between pt-2">
                                <div>
                                    <label htmlFor="shadow-toggle" className="font-medium text-white cursor-pointer">Thêm bóng đổ</label>
                                    <p className="text-xs text-gray-400">Tạo chiều sâu cho chủ thể của bạn.</p>
                                </div>
                                <label htmlFor="shadow-toggle" className="flex items-center cursor-pointer">
                                    <div className="relative">
                                        <input id="shadow-toggle" type="checkbox" className="sr-only" checked={addShadow} onChange={(e) => setAddShadow(e.target.checked)} disabled={isCustomizing} />
                                        <div className={`block w-14 h-8 rounded-full transition ${addShadow ? 'bg-blue-600' : 'bg-gray-600'}`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${addShadow ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </div>
                                </label>
                            </div>

                            <button
                                onClick={handleApplyCustomization}
                                disabled={isCustomizing || !baseImage || !canApply}
                                className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                {isCustomizing ? <Spinner /> : <WandIcon />}
                                <span>{isCustomizing ? 'Đang áp dụng...' : 'Áp dụng tùy chỉnh'}</span>
                            </button>
                        </div>
                    )}
                </div>
                <div className="lg:col-span-1">
                    <h3 className="font-semibold text-white mb-3">Kết quả</h3>
                    <div className="aspect-square w-full rounded-lg border-2 border-dashed border-gray-700 bg-gray-900 flex items-center justify-center relative group overflow-hidden" 
                        style={isPreviewingTransparent && !finalImage ? checkeredBgStyle : { backgroundColor: selectedBg ? '#111827' : bgColor }}>
                        {(loading || isCustomizing) && <Spinner size="lg" />}

                        {/* Preview Background */}
                        {selectedBg && !finalImage && <img src={selectedBg.full} alt="Preview Background" className="absolute inset-0 w-full h-full object-cover" />}

                        {!(loading || isCustomizing) && (finalImage || resultImage) && (
                           <>
                            <img src={`data:image/png;base64,${finalImage || resultImage}`} alt="Kết quả" className="w-full h-full object-contain relative z-10" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
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
                        {!(loading || isCustomizing) && !resultImage && (
                             <div className="text-center text-gray-500 p-4" style={{background: 'rgb(31 41 55 / 0.8)'}}>
                                <BackgroundIcon className="mx-auto h-12 w-12" />
                                <p className="mt-2 text-sm">Ảnh đã xóa nền sẽ xuất hiện ở đây.</p>
                            </div>
                         )}
                    </div>
                </div>
            </div>
            {error && <div className="bg-red-900/50 text-red-200 border border-red-700 p-4 rounded-lg mt-4">{error}</div>}
        </div>
    );
};

export default RemoveBackground;
