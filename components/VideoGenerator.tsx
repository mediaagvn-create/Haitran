
import React, { useState, useRef, useEffect } from 'react';
import { generateVideo } from '../services/geminiService';
import { VideoIcon } from './icons/VideoIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { Spinner } from './common/Spinner';
import { TrashIcon } from './icons/TrashIcon';
import { RetryIcon } from './icons/RetryIcon';
import type { VideoJob, ImageFile, Quality } from '../types';
import QualitySelector from './common/QualitySelector';
import { WarningIcon } from './icons/WarningIcon';

const MAX_CONCURRENT_JOBS = 2;
const RATE_LIMIT_COUNT = 2; // Reduced to 2 jobs per minute to avoid Veo API quota errors
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_JOBS = 20;

const JobInputRow: React.FC<{
    job: VideoJob;
    onUpdate: (updatedJob: VideoJob) => void;
    onRemove: () => void;
    isProcessing: boolean;
}> = ({ job, onUpdate, onRemove, isProcessing }) => {

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpdate({ ...job, imageFile: { file, preview: URL.createObjectURL(file) } });
        }
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 grid grid-cols-12 gap-4 items-start">
            {/* Prompt & Audio */}
            <div className="col-span-12 md:col-span-5 space-y-2">
                 <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Nội dung mô tả</label>
                    <textarea
                        value={job.prompt}
                        onChange={(e) => onUpdate({ ...job, prompt: e.target.value })}
                        placeholder="VD: Một con tàu cướp biển vượt bão..."
                        className="w-full h-24 p-2 bg-gray-900 border border-gray-600 rounded-md text-sm"
                        disabled={isProcessing}
                        rows={3}
                    />
                </div>
                <div>
                     <label className="block text-xs font-medium text-gray-400 mb-1">Mô tả Âm thanh (Tùy chọn)</label>
                    <textarea
                        value={job.audioPrompt || ''}
                        onChange={(e) => onUpdate({ ...job, audioPrompt: e.target.value })}
                        placeholder="VD: Nhạc giao hưởng hoành tráng, tiếng sấm sét..."
                        className="w-full h-20 p-2 bg-gray-900 border border-gray-600 rounded-md text-sm"
                        disabled={isProcessing}
                        rows={2}
                    />
                </div>
            </div>
            {/* Configs */}
            <div className="col-span-12 md:col-span-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Loại Input</label>
                        <select 
                            value={job.inputType} 
                            onChange={(e) => onUpdate({ ...job, inputType: e.target.value as 'text' | 'image' })}
                            className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md text-sm"
                            disabled={isProcessing}>
                            <option value="text">Từ Văn bản</option>
                            <option value="image">Từ Hình ảnh</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Model</label>
                        <select 
                            value={job.model} 
                            onChange={(e) => onUpdate({ ...job, model: e.target.value })}
                            className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md text-sm"
                            disabled={isProcessing}>
                            <option value="veo-2.0-generate-001">Veo 2</option>
                            <option value="veo-3-fast" disabled>Veo 3 (Sắp ra mắt)</option>
                        </select>
                    </div>
                </div>
                <div>
                     <label className="block text-xs font-medium text-gray-400 mb-1">Tỉ lệ</label>
                    <select 
                        value={job.aspectRatio} 
                        onChange={(e) => onUpdate({ ...job, aspectRatio: e.target.value })}
                        className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md text-sm"
                        disabled={isProcessing}>
                        <option value="16:9">Ngang (16:9)</option>
                        <option value="9:16">Dọc (9:16)</option>
                        <option value="1:1">Vuông (1:1)</option>
                        <option value="4:3">4:3</option>
                    </select>
                </div>
                 <div>
                    <QualitySelector quality={job.quality} setQuality={(q) => onUpdate({ ...job, quality: q })} disabled={isProcessing} />
                </div>
            </div>
             {/* Image Upload */}
            <div className="col-span-10 md:col-span-2">
                 <label className="block text-xs font-medium text-gray-400 mb-1">Hình ảnh</label>
                 <div className={`aspect-square w-full rounded-md border-2 border-dashed flex items-center justify-center relative overflow-hidden ${job.inputType === 'image' ? 'border-blue-500' : 'border-gray-600'}`}>
                    {job.inputType === 'image' && job.imageFile ? (
                         <img src={job.imageFile.preview} alt="Xem trước" className="w-full h-full object-cover" />
                    ) : (
                         <div className="text-center text-gray-500 p-1">
                             <VideoIcon className="mx-auto h-6 w-6"/>
                             <p className="text-xs mt-1">{job.inputType === 'image' ? 'Chọn ảnh' : 'Văn bản'}</p>
                         </div>
                     )}
                     {job.inputType === 'image' && (
                          <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isProcessing}/>
                     )}
                 </div>
            </div>
             {/* Actions */}
             <div className="col-span-2 md:col-span-1 flex items-center justify-center">
                 <button onClick={onRemove} disabled={isProcessing} className="p-2 text-gray-400 hover:text-red-500 disabled:text-gray-600">
                     <TrashIcon />
                 </button>
             </div>
        </div>
    );
};

const JobStatusRow: React.FC<{ job: VideoJob; onRetry: () => void; }> = ({ job, onRetry }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    const getStatusBadge = () => {
        switch (job.status) {
            case 'queued': return <span className="bg-gray-600 text-gray-200 text-xs font-medium me-2 px-2.5 py-0.5 rounded">Đang chờ</span>;
            case 'processing': return <span className="bg-blue-800 text-blue-200 text-xs font-medium me-2 px-2.5 py-0.5 rounded flex items-center"><Spinner size="sm"/> &nbsp;Đang xử lý</span>;
            case 'success': return <span className="bg-green-800 text-green-200 text-xs font-medium me-2 px-2.5 py-0.5 rounded">Thành công</span>;
            case 'failed': return <span className="bg-red-800 text-red-200 text-xs font-medium me-2 px-2.5 py-0.5 rounded">Thất bại</span>;
        }
    };
    
    return (
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 grid grid-cols-12 gap-4 items-center">
            <div className="col-span-4"><p className="text-sm truncate" title={job.prompt}>{job.prompt}</p></div>
            <div className="col-span-2">{getStatusBadge()}</div>
            <div className="col-span-4">
                {job.status === 'success' && job.resultUrl && (
                     <div className="w-full aspect-video bg-black rounded-md overflow-hidden relative cursor-pointer" onClick={() => setIsPlaying(!isPlaying)}>
                        <video src={job.resultUrl} className="w-full h-full object-contain" loop muted={!isPlaying} autoPlay={isPlaying} playsInline/>
                        {!isPlaying && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><VideoIcon className="w-8 h-8 text-white"/></div>}
                     </div>
                )}
                 {job.status === 'processing' && <p className="text-xs text-gray-400">{job.progressMessage || '...'}</p>}
                 {job.status === 'failed' && <p className="text-xs text-red-400 truncate" title={job.errorMessage}>{job.errorMessage || 'Lỗi không xác định'}</p>}
            </div>
            <div className="col-span-2 flex items-center justify-end space-x-2">
                {job.status === 'success' && job.downloadUrl && (
                     <a href={job.downloadUrl} download={`ai-video-${job.id}.mp4`} className="p-2 text-gray-400 hover:text-blue-400" title="Tải xuống">
                         <DownloadIcon className="w-5 h-5"/>
                     </a>
                )}
                 {job.status === 'failed' && (
                     <button onClick={onRetry} className="p-2 text-gray-400 hover:text-green-400" title="Thử lại">
                         <RetryIcon className="w-5 h-5"/>
                     </button>
                )}
            </div>
        </div>
    );
};


const VideoGenerator: React.FC = () => {
    const createNewJob = (): VideoJob => ({
        id: crypto.randomUUID(),
        prompt: '',
        audioPrompt: '',
        inputType: 'text',
        model: 'veo-2.0-generate-001',
        aspectRatio: '16:9',
        quality: 'standard',
        status: 'queued',
    });

    const [jobs, setJobs] = useState<VideoJob[]>([createNewJob()]);
    const [isProcessingQueue, setIsProcessingQueue] = useState(false);
    const jobStartTimes = useRef<number[]>([]);

    useEffect(() => {
        if (isProcessingQueue) {
            const interval = setInterval(processQueue, 1000);
            return () => clearInterval(interval);
        }
    }, [isProcessingQueue, jobs]);

    const handleAddJob = () => {
        if (jobs.length < MAX_JOBS) {
            setJobs([...jobs, createNewJob()]);
        }
    };
    
    const handleUpdateJob = (index: number, updatedJob: VideoJob) => {
        const newJobs = [...jobs];
        newJobs[index] = updatedJob;
        setJobs(newJobs);
    };

    const handleRemoveJob = (index: number) => {
        const newJobs = jobs.filter((_, i) => i !== index);
        setJobs(newJobs);
    };

    const handleRetryJob = (jobId: string) => {
        setJobs(jobs.map(job => job.id === jobId ? { ...job, status: 'queued', errorMessage: undefined, resultUrl: undefined, downloadUrl: undefined } : job));
    };

    const processQueue = () => {
        const now = Date.now();
        // Update rate limit window by filtering out old job start times
        jobStartTimes.current = jobStartTimes.current.filter(time => now - time < RATE_LIMIT_WINDOW_MS);

        const processingJobsCount = jobs.filter(j => j.status === 'processing').length;
        const queuedJobs = jobs.filter(j => j.status === 'queued');

        // If there are no more jobs to queue and none are processing, stop the queue.
        if (queuedJobs.length === 0) {
            if (processingJobsCount === 0) {
                setIsProcessingQueue(false);
            }
            return;
        }

        // Calculate how many new jobs can be started based on concurrency and rate limits
        const concurrentSlotsAvailable = MAX_CONCURRENT_JOBS - processingJobsCount;
        const rateLimitSlotsAvailable = RATE_LIMIT_COUNT - jobStartTimes.current.length;
        
        const numJobsToStart = Math.min(
            queuedJobs.length,
            concurrentSlotsAvailable,
            rateLimitSlotsAvailable
        );

        if (numJobsToStart <= 0) {
            return; // No available slots, wait for the next interval
        }

        // Identify the jobs to start and update their state in a single batch
        const jobsToStart = queuedJobs.slice(0, numJobsToStart);
        const jobsToStartIds = new Set(jobsToStart.map(j => j.id));

        // Add new start times for rate limiting
        for (let i = 0; i < numJobsToStart; i++) {
            jobStartTimes.current.push(Date.now());
        }

        setJobs(prevJobs =>
            prevJobs.map(job =>
                jobsToStartIds.has(job.id)
                    ? { ...job, status: 'processing', progressMessage: 'Bắt đầu...' }
                    : job
            )
        );

        // Asynchronously execute the jobs
        jobsToStart.forEach(job => executeJob(job));
    };

    const executeJob = async (job: VideoJob) => {
        try {
            const updateProgress = (message: string) => {
                setJobs(prev => prev.map(j => j.id === job.id ? { ...j, progressMessage: message } : j));
            };

            const downloadLink = await generateVideo(job, updateProgress);
            
            updateProgress('Đang tải video về trình duyệt...');
            const response = await fetch(downloadLink);
            if (!response.ok) throw new Error(`Tải video thất bại: ${response.statusText}`);
            
            const videoBlob = await response.blob();
            const objectUrl = URL.createObjectURL(videoBlob);
            
            setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'success', resultUrl: objectUrl, downloadUrl: downloadLink } : j));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.';
            setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'failed', errorMessage } : j));
        }
    };

    const handleDownloadAll = () => {
        jobs.forEach(job => {
            if (job.status === 'success' && job.downloadUrl) {
                const link = document.createElement('a');
                link.href = job.downloadUrl;
                link.download = `ai-video-${job.id}.mp4`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        });
    };
    
    const completedJobs = jobs.filter(j => j.status === 'success' || j.status === 'failed').length;
    const successfulJobs = jobs.filter(j => j.status === 'success').length;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Tạo Video Hàng Loạt với Veo</h2>
                <p className="mt-4 text-lg leading-8 text-gray-400">
                    Thiết lập nhiều job video, tùy chỉnh thông số, và để AI tự động xử lý toàn bộ quy trình.
                </p>
            </div>
            
             <div className="bg-yellow-900/50 text-yellow-200 border border-yellow-700 p-4 rounded-lg flex items-start space-x-3">
                <WarningIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                    <h4 className="font-semibold">Lưu ý quan trọng về Giới hạn Sử dụng</h4>
                    <p className="text-sm mt-1">
                        Google Veo API có các giới hạn sử dụng nghiêm ngặt, đặc biệt với các tài khoản ở bậc miễn phí. Bạn có thể gặp lỗi "vượt quá hạn mức" (quota exceeded) chỉ sau khi tạo một vài video. Đây là giới hạn từ phía Google, không phải lỗi của ứng dụng. Để sử dụng nhiều hơn, vui lòng kiểm tra và nâng cấp tài khoản của bạn trên nền tảng Google AI.
                    </p>
                </div>
            </div>

            {/* Job Input View */}
            {!isProcessingQueue && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Cấu hình Jobs</h3>
                    {jobs.map((job, index) => (
                        <JobInputRow key={job.id} job={job} onUpdate={(updatedJob) => handleUpdateJob(index, updatedJob)} onRemove={() => handleRemoveJob(index)} isProcessing={isProcessingQueue} />
                    ))}
                     <div className="flex justify-between items-center pt-2">
                        <button onClick={handleAddJob} disabled={jobs.length >= MAX_JOBS} className="text-blue-400 hover:text-blue-300 disabled:text-gray-500 disabled:cursor-not-allowed text-sm font-medium">
                            + Thêm Job ({jobs.length}/{MAX_JOBS})
                        </button>
                        <button onClick={() => {if(jobs.length > 0) setIsProcessingQueue(true)}} disabled={jobs.length === 0} className="flex items-center justify-center space-x-2 bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 disabled:bg-gray-600">
                            <VideoIcon />
                             <span>Bắt đầu tạo hàng loạt ({jobs.length})</span>
                        </button>
                     </div>
                </div>
            )}
            
            {/* Job Processing View */}
            {isProcessingQueue && (
                 <div className="space-y-4">
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-semibold">Tiến trình xử lý</h3>
                                <p className="text-sm text-gray-400">{completedJobs}/{jobs.length} jobs đã hoàn tất.</p>
                            </div>
                            {successfulJobs > 0 && (
                                <button onClick={handleDownloadAll} className="flex items-center space-x-2 text-sm bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg">
                                    <DownloadIcon className="w-5 h-5" />
                                    <span>Tải xuống tất cả ({successfulJobs})</span>
                                </button>
                            )}
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(completedJobs / jobs.length) * 100}%` }}></div>
                        </div>
                    </div>

                    <div className="space-y-3">
                         {jobs.map(job => (
                             <JobStatusRow key={job.id} job={job} onRetry={() => handleRetryJob(job.id)} />
                         ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoGenerator;