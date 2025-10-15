// Fix: Removed circular import of `ImageFile` from this file itself.
export type ActiveTab = 'generate' | 'fuse' | 'edit' | 'dewatermark' | 'remove-background' | 'video-veo' | 'voice-generator' | 'upscale';

export type Quality = 'standard' | 'enhanced' | 'professional';

export interface ImageFile {
  file: File;
  preview: string;
}

export interface Base64Image {
  data: string;
  mimeType: string;
}

export interface VideoJob {
  id: string;
  prompt: string;
  audioPrompt?: string;
  inputType: 'text' | 'image';
  imageFile?: ImageFile;
  model: string;
  aspectRatio: string;
  quality: Quality;
  status: 'queued' | 'processing' | 'success' | 'failed';
  resultUrl?: string; // blob url for preview
  downloadUrl?: string; // original download link for download
  errorMessage?: string;
  progressMessage?: string;
  // FIX: Added optional properties for voiceover generation to fix compile errors.
  voiceoverScript?: string;
  voiceoverStyle?: string;
}
