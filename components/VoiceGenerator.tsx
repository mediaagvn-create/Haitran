import React, { useState, useMemo } from 'react';
import { generateVoiceover } from '../services/geminiService';
import { voices } from '../data/voices';
import { emotions } from '../data/emotions';
import { MicIcon } from './icons/MicIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { Spinner } from './common/Spinner';

const VoiceGenerator: React.FC = () => {
    const [script, setScript] = useState('');
    const [selectedVoiceId, setSelectedVoiceId] = useState<string>(voices[0].id);
    const [selectedEmotionId, setSelectedEmotionId] = useState<string>(emotions[0].id);
    const [speed, setSpeed] = useState(1.0);

    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);

    const selectedVoice = useMemo(() => voices.find(v => v.id === selectedVoiceId)!, [selectedVoiceId]);
    const selectedEmotion = useMemo(() => emotions.find(e => e.id === selectedEmotionId)!, [selectedEmotionId]);

    const handleGenerate = async () => {
        if (!script.trim() || loading) return;

        setLoading(true);
        setError(null);
        setResultUrl(null);
        setProgress('');

        try {
            const url = await generateVoiceover(
                script, 
                selectedVoice.name,
                selectedEmotion.name,
                speed,
                setProgress
            );
            setResultUrl(url);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.');
        } finally {
            setLoading(false);
            setProgress('');
        }
    };
    
    const downloadResult = () => {
        if (!resultUrl) return;
        const link = document.createElement('a');
        link.href = resultUrl;
        const safeScript = script.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
        link.download = `ai-voiceover-${safeScript}.wav`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Studio Giọng nói AI</h2>
                <p className="mt-4 text-lg leading-8 text-gray-400">
                    Tạo giọng đọc chuyên nghiệp bằng cách kết hợp giọng đọc, cảm xúc và tốc độ.
                </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-4">
                        <div>
                            <label htmlFor="script" className="block text-sm font-medium text-gray-300 mb-2">
                                1. Nhập kịch bản của bạn
                            </label>
                            <textarea
                                id="script"
                                value={script}
                                onChange={(e) => setScript(e.target.value)}
                                placeholder="Nhập văn bản bạn muốn chuyển thành giọng nói ở đây..."
                                className="w-full h-36 p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-white placeholder-gray-500"
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="voice-style" className="block text-sm font-medium text-gray-300 mb-2">
                                    2. Chọn giọng đọc
                                </label>
                                <select
                                    id="voice-style"
                                    value={selectedVoiceId}
                                    onChange={(e) => setSelectedVoiceId(e.target.value)}
                                    className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-white"
                                    disabled={loading}
                                >
                                    {voices.map(voice => (
                                        <option key={voice.id} value={voice.id}>
                                            {voice.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-400 mt-2 h-8 overflow-hidden">{selectedVoice.description}</p>
                            </div>
                            <div>
                                <label htmlFor="emotion-style" className="block text-sm font-medium text-gray-300 mb-2">
                                    3. Chọn cảm xúc
                                </label>
                                <select
                                    id="emotion-style"
                                    value={selectedEmotionId}
                                    onChange={(e) => setSelectedEmotionId(e.target.value)}
                                    className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-white"
                                    disabled={loading}
                                >
                                    {emotions.map(emotion => (
                                        <option key={emotion.id} value={emotion.id}>
                                            {emotion.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-400 mt-2 h-8 overflow-hidden">{selectedEmotion.description}</p>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="speed-slider" className="block text-sm font-medium text-gray-300 mb-2">
                                4. Điều chỉnh tốc độ nói: <span className="font-bold text-blue-400">{speed.toFixed(1)}x</span>
                            </label>
                            <input 
                                type="range" 
                                id="speed-slider"
                                min="0.5" 
                                max="2" 
                                step="0.1" 
                                value={speed}
                                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading || !script.trim()}
                        className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        {loading ? <Spinner /> : <MicIcon />}
                        <span>{loading ? 'Đang tạo âm thanh...' : 'Tạo Âm thanh'}</span>
                    </button>
                </div>
                <div className="lg:col-span-1">
                     <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-white">Kết quả</h3>
                         {resultUrl && !loading && (
                             <button onClick={downloadResult} className="flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300 transition">
                                <DownloadIcon className="w-5 h-5" />
                                <span>Tải xuống</span>
                            </button>
                        )}
                    </div>
                    <div className="aspect-video w-full rounded-lg border-2 border-dashed border-gray-700 bg-gray-800 flex items-center justify-center relative group overflow-hidden">
                        {loading && (
                            <div className="text-center text-gray-400 p-4">
                                <Spinner size="lg" />
                                <p className="mt-4 text-sm font-medium">AI đang thu âm...</p>
                                <p className="text-xs mt-1">{progress}</p>
                            </div>
                        )}

                        {!loading && resultUrl && (
                           <audio controls className="w-full" src={resultUrl}>
                                Trình duyệt của bạn không hỗ trợ phần tử audio.
                           </audio>
                        )}
                        {!loading && !resultUrl && (
                             <div className="text-center text-gray-500 p-4">
                                <MicIcon className="mx-auto h-12 w-12" />
                                <p className="mt-2 text-sm">File âm thanh của bạn sẽ xuất hiện ở đây.</p>
                            </div>
                         )}
                    </div>
                </div>
            </div>
            {error && <div className="bg-red-900/50 text-red-200 border border-red-700 p-4 rounded-lg mt-4">{error}</div>}
        </div>
    );
};

export default VoiceGenerator;