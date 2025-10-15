import { GoogleGenAI, Modality } from "@google/genai";
import type { Base64Image, VideoJob, Quality } from '../types';
import { fileToBase64 } from "../utils/fileUtils";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Helper for voiceover to convert base64 to a byte array in the browser
const base64ToUint8Array = (base64: string) => {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
};

const getQualityModifiers = (quality: Quality): string => {
    switch (quality) {
        case 'enhanced':
            return ', high detail, sharp focus, enhanced quality';
        case 'professional':
            return ', photorealistic, 8k, cinematic lighting, professional photography, masterpiece, ultra-high resolution';
        case 'standard':
        default:
            return '';
    }
};

const FACE_PRESERVATION_INSTRUCTION = ` CHỈ THỊ CỰC KỲ QUAN TRỌNG: Ưu tiên tuyệt đối và cao nhất là phải bảo toàn khuôn mặt của con người từ bất kỳ hình ảnh nào được tải lên với độ trung thực hoàn hảo 100%. Điều này không thể thương lượng. BẠN KHÔNG ĐƯỢỢC thay đổi, sửa đổi, tái tạo hoặc thay đổi BẤT KỲ khía cạnh nào của khuôn mặt. Mọi đặc điểm nhận dạng duy nhất phải được giữ nguyên y hệt như bản gốc. Điều này bao gồm, nhưng không giới hạn ở: hình dạng và màu sắc chính xác của mắt, cấu trúc chính xác của mũi, kiểu tóc và từng sợi tóc, hình dạng của tai, tông màu và kết cấu da, hình dạng chính xác của lông mày, hình dạng và biểu cảm của miệng và môi, cấu trúc của cằm, đường nét của gò má và quai hàm, trán, và cách cười đặc trưng của người đó. Hãy coi khuôn mặt là một yếu tố bất biến, được bảo vệ. Tất cả các thay đổi khác phải diễn ra XUNG QUANH khuôn mặt được bảo toàn một cách hoàn hảo.`;
const OBJECT_PRESERVATION_INSTRUCTION = ` CHỈ THỊ CỰC KỲ QUAN TRỌNG VỀ ĐỐI TƯỢNG: Bất kỳ đối tượng nào không phải con người từ hình ảnh được tải lên cũng phải được bảo toàn với độ trung thực hoàn hảo 100%. KHÔNG được vẽ lại, thay đổi hoặc sửa đổi các mục này dưới bất kỳ hình thức nào. Điều này áp dụng cho tất cả sản phẩm, công cụ, dụng cụ, động vật, sinh vật, văn bản, và bất kỳ đối tượng nào khác không phải con người. Hãy tích hợp các đối tượng này vào cảnh cuối cùng chính xác như đã được cung cấp, duy trì hoàn hảo các chi tiết, màu sắc và kết cấu ban đầu của chúng, như thể chúng là các đối tượng vector bất biến được đặt trên một nền mới.`;


export const generateImages = async (prompt: string, aspectRatio: string, quality: Quality): Promise<string[]> => {
  try {
    const qualityPrompt = getQualityModifiers(quality);
    const fullPrompt = `${prompt}${qualityPrompt}`;

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: fullPrompt,
      config: {
        numberOfImages: 4,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio,
      },
    });

    return response.generatedImages.map(img => img.image.imageBytes);
  } catch (error) {
    console.error("Error generating images:", error);
    throw new Error("Failed to generate images. The model might have refused the prompt.");
  }
};

export const fuseImages = async (
  images: Base64Image[],
  prompt: string,
  quality: Quality
): Promise<string> => {
    try {
        const qualityModifiers = getQualityModifiers(quality);
        const fullPrompt = `PROMPT: ${prompt}${qualityModifiers}. INSTRUCTIONS: You will be given ${images.length} images. Combine them into a single, seamless, and photorealistic scene based on the prompt. Place the subjects and objects from ALL uploaded images into the described scene as requested. ${FACE_PRESERVATION_INSTRUCTION} ${OBJECT_PRESERVATION_INSTRUCTION} The composition should be seamless. Do not output any text, only the final image.`;
        
        const imageParts = images.map(img => ({ inlineData: { data: img.data, mimeType: img.mimeType } }));

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    ...imageParts,
                    { text: fullPrompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
        if (imagePart && imagePart.inlineData) {
            return imagePart.inlineData.data;
        }
        
        const textPart = response.text;
        if (textPart) {
             throw new Error(`Model responded with text: ${textPart}`);
        }

        throw new Error("No image was generated. The model may have refused the request.");
    } catch (error) {
        console.error("Error fusing images:", error);
        throw new Error(`Failed to fuse images: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const editImage = async (
  baseImage: Base64Image,
  prompt: string,
  quality: Quality
): Promise<string> => {
    try {
        const qualityModifiers = getQualityModifiers(quality);
        const fullPrompt = `INSTRUCTION: Edit the provided image based on the following prompt. PROMPT: "${prompt}${qualityModifiers}".${FACE_PRESERVATION_INSTRUCTION} ${OBJECT_PRESERVATION_INSTRUCTION} Do not output any text, only the final image.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: baseImage.data, mimeType: baseImage.mimeType } },
                    { text: fullPrompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
        if (imagePart && imagePart.inlineData) {
            return imagePart.inlineData.data;
        }
        
        const textPart = response.text;
        if (textPart) {
             throw new Error(`Model responded with text: ${textPart}`);
        }

        throw new Error("No image was generated. The model may have refused the request.");
    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error(`Failed to edit image: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const removeWatermark = async (
    baseImage: Base64Image,
    quality: Quality,
    maskImage?: Base64Image,
    isTextRemoval: boolean = false
): Promise<string> => {
    try {
        const parts: any[] = [{ inlineData: { data: baseImage.data, mimeType: baseImage.mimeType } }];
        
        let baseInstruction: string;

        if (maskImage) {
            parts.push({ inlineData: { data: maskImage.data, mimeType: maskImage.mimeType } });
            baseInstruction = `You will be given an image and a mask. Remove the content from the original image that corresponds to the white areas of the mask.`;
        } else if (isTextRemoval) {
            baseInstruction = `Remove all text from the provided image.`;
        } else {
            baseInstruction = `Remove all watermarks and logos from the provided image.`;
        }

        let qualityInstruction: string;
        switch (quality) {
            case 'enhanced':
                qualityInstruction = ' Inpaint the cleared area with high-fidelity texture matching to make the removal completely unnoticeable.';
                break;
            case 'professional':
                qualityInstruction = ' Inpaint the cleared area with photorealistic, context-aware content generation, perfectly reconstructing the underlying image details as if the watermark never existed.';
                break;
            default:
                qualityInstruction = ' Inpaint the cleared area to seamlessly match the surrounding background.';
        }

        const prompt = `INSTRUCTION: ${baseInstruction}${qualityInstruction} Do not output any text, only the final image.`;
        parts.push({ text: prompt });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
        if (imagePart && imagePart.inlineData) {
            return imagePart.inlineData.data;
        }

        const textPart = response.text;
        if (textPart) {
             throw new Error(`Model responded with text: ${textPart}`);
        }
        
        throw new Error("No image was generated. The model may have refused the request.");
    } catch (error) {
        console.error("Error removing watermark:", error);
        throw new Error(`Failed to remove watermark: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const detectWatermarkMask = async (baseImage: Base64Image): Promise<string> => {
    try {
        const prompt = `INSTRUCTION: Analyze the provided image and identify any watermarks or logos. Create a black and white mask image of the same dimensions. The mask should be white where a watermark is detected and black everywhere else. Do not output any text, only the final mask image.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: baseImage.data, mimeType: baseImage.mimeType } },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
        if (imagePart && imagePart.inlineData) {
            return imagePart.inlineData.data;
        }

        const textPart = response.text;
        if (textPart) {
             throw new Error(`Model responded with text: ${textPart}`);
        }
        
        throw new Error("No mask was generated. The model may have refused the request.");
    } catch (error) {
        console.error("Error detecting watermark mask:", error);
        throw new Error(`Failed to detect watermark mask: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const removeBackground = async (baseImage: Base64Image, quality: Quality): Promise<string> => {
    try {
        let instruction: string;
        switch (quality) {
            case 'enhanced':
                instruction = `Perform a high-precision background removal from this image. Pay close attention to fine details like hair strands and semi-transparent objects, leaving only the main subject.`;
                break;
            case 'professional':
                instruction = `Execute a studio-quality background removal with flawless edge detection. Ensure a perfect cutout around intricate details like hair, fur, and complex edges. Leave only the main subject.`;
                break;
            default:
                instruction = `Remove the background from this image, leaving only the main subject.`;
        }
        const prompt = `INSTRUCTION: ${instruction} The output should be a PNG with a transparent background. Do not output any text, only the final image.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: baseImage.data, mimeType: baseImage.mimeType } },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
        if (imagePart && imagePart.inlineData) {
            return imagePart.inlineData.data;
        }
        
        const textPart = response.text;
        if (textPart) {
             throw new Error(`Model responded with text: ${textPart}`);
        }

        throw new Error("No image was generated. The model may have refused the request.");
    } catch (error) {
        console.error("Error removing background:", error);
        throw new Error(`Failed to remove background: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const customizeBackground = async (subjectImage: Base64Image, color: string, addShadow: boolean, quality: Quality): Promise<string> => {
    try {
        const qualityModifiers = getQualityModifiers(quality);
        const prompt = `INSTRUCTION: Create a new image with a solid background color of ${color}${qualityModifiers}. Place the subject from the provided transparent PNG image onto this new background. ${addShadow ? 'Add a subtle, realistic drop shadow to the subject to give it depth.' : ''} The final output should be a single image. Do not output any text, only the final image.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: subjectImage.data, mimeType: subjectImage.mimeType } },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
        if (imagePart && imagePart.inlineData) {
            return imagePart.inlineData.data;
        }
        
        const textPart = response.text;
        if (textPart) {
             throw new Error(`Model responded with text: ${textPart}`);
        }

        throw new Error("No image was generated. The model may have refused the request.");
    } catch (error) {
        console.error("Error customizing background:", error);
        throw new Error(`Failed to customize background: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const replaceBackgroundWithImage = async (subjectImage: Base64Image, backgroundImage: Base64Image, addShadow: boolean, quality: Quality): Promise<string> => {
     try {
        const qualityModifiers = getQualityModifiers(quality);
        const prompt = `INSTRUCTION: You will be given two images. The first is a subject with a transparent background. The second is a new background image. Place the subject from the first image onto the second image${qualityModifiers}. ${addShadow ? 'Add a subtle, realistic drop shadow to the subject to make it blend in.' : ''} Ensure the scale and lighting are consistent. Do not output any text, only the final composite image.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: subjectImage.data, mimeType: subjectImage.mimeType } },
                    { inlineData: { data: backgroundImage.data, mimeType: backgroundImage.mimeType } },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
        if (imagePart && imagePart.inlineData) {
            return imagePart.inlineData.data;
        }
        
        const textPart = response.text;
        if (textPart) {
             throw new Error(`Model responded with text: ${textPart}`);
        }

        throw new Error("No image was generated. The model may have refused the request.");
    } catch (error) {
        console.error("Error replacing background:", error);
        throw new Error(`Failed to replace background: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const removeText = async (baseImage: Base64Image): Promise<string> => {
    try {
        const prompt = `INSTRUCTION: Remove all text from the provided image. Inpaint the cleared areas to seamlessly match the surrounding background. The final result should look natural as if the text was never there. Do not output any text, only the final image.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: baseImage.data, mimeType: baseImage.mimeType } },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
        if (imagePart && imagePart.inlineData) {
            return imagePart.inlineData.data;
        }

        const textPart = response.text;
        if (textPart) {
             throw new Error(`Model responded with text: ${textPart}`);
        }
        
        throw new Error("No image was generated. The model may have refused the request.");
    } catch (error) {
        console.error("Error removing text:", error);
        throw new Error(`Failed to remove text: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const purifyImage = async (baseImage: Base64Image): Promise<string> => {
    try {
        const prompt = `INSTRUCTION: Isolate the human subject and their clothing in the image. Remove all other background elements, objects, and accessories. The output must be a PNG with a transparent background containing only the person and what they are wearing. Do not output any text, only the final image.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: baseImage.data, mimeType: baseImage.mimeType } },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
        if (imagePart && imagePart.inlineData) {
            return imagePart.inlineData.data;
        }
        
        const textPart = response.text;
        if (textPart) {
             throw new Error(`Model responded with text: ${textPart}`);
        }

        throw new Error("No image was generated. The model may have refused the request.");
    } catch (error) {
        console.error("Error purifying image:", error);
        throw new Error(`Failed to purify image: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const upscaleImage = async (baseImage: Base64Image, quality: Quality): Promise<string> => {
    try {
        let instruction: string;
        switch (quality) {
            case 'enhanced':
                instruction = "Upscale the provided image to a higher resolution. Enhance details, reduce noise and compression artifacts, and sharpen the image without altering the original content. Intelligently sharpen details and textures.";
                break;
            case 'professional':
                instruction = "Perform a professional-grade remaster of the provided image. Upscale it to a higher resolution, correcting lighting, improving color balance, and creating a hyper-detailed, flawless result. Enhance details, reduce noise and compression artifacts, and sharpen the image without altering the original content.";
                break;
            default:
                instruction = "Upscale the provided image to a higher resolution. Enhance details, reduce noise and compression artifacts, and sharpen the image without altering the original content.";
        }
        const prompt = `INSTRUCTION: ${instruction}${FACE_PRESERVATION_INSTRUCTION} ${OBJECT_PRESERVATION_INSTRUCTION} The final result should be a crisp, clear, high-quality version of the original. Do not output any text, only the final image.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: baseImage.data, mimeType: baseImage.mimeType } },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
        if (imagePart && imagePart.inlineData) {
            return imagePart.inlineData.data;
        }
        
        const textPart = response.text;
        if (textPart) {
             throw new Error(`Model responded with text: ${textPart}`);
        }

        throw new Error("No image was generated. The model may have refused the request.");
    } catch (error) {
        console.error("Error upscaling image:", error);
        throw new Error(`Failed to upscale image: ${error instanceof Error ? error.message : String(error)}`);
    }
};

const VEO_POLLING_MESSAGES = [
    "Khởi tạo tác vụ video...",
    "Phân tích mô tả của bạn...",
    "Phác thảo các khung hình ban đầu...",
    "Chọn các góc máy quay điện ảnh...",
    "Bắt đầu kết xuất video, quá trình này có thể mất vài phút...",
    "Tinh chỉnh các chi tiết và chuyển động...",
    "Thêm các hiệu ứng hình ảnh...",
    "Kết xuất âm thanh và đồng bộ hóa...",
    "Gần hoàn tất, đang đóng gói video của bạn...",
    "Hoàn tất! Chuẩn bị tải xuống."
];

export const generateVideo = async (job: VideoJob, updateProgress: (message: string) => void): Promise<string> => {
    try {
        const { prompt, model, aspectRatio, inputType, imageFile, audioPrompt, quality } = job;
        
        updateProgress(VEO_POLLING_MESSAGES[0]);

        const qualityModifiers = getQualityModifiers(quality);
        let fullPrompt = audioPrompt ? `${prompt}. Audio: ${audioPrompt}` : prompt;
        fullPrompt += qualityModifiers;

        const requestBody: any = {
            model: model,
            prompt: fullPrompt,
            config: {
                numberOfVideos: 1,
                aspectRatio: aspectRatio,
            }
        };

        if (inputType === 'image' && imageFile) {
            requestBody.prompt += FACE_PRESERVATION_INSTRUCTION + OBJECT_PRESERVATION_INSTRUCTION;
            const base64Data = await fileToBase64(imageFile.file);
            requestBody.image = {
                imageBytes: base64Data,
                mimeType: imageFile.file.type
            };
        }
        
        updateProgress(VEO_POLLING_MESSAGES[1]);
        let operation = await ai.models.generateVideos(requestBody);
        
        let messageIndex = 2;
        while (!operation.done) {
            updateProgress(VEO_POLLING_MESSAGES[messageIndex % VEO_POLLING_MESSAGES.length]);
            messageIndex++;
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation(operation);
        }
        
        updateProgress(VEO_POLLING_MESSAGES[VEO_POLLING_MESSAGES.length - 1]);

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error('Video generation succeeded but no download link was provided.');
        }

        return `${downloadLink}&key=${API_KEY}`;
    } catch (error) {
        console.error("Error generating video:", error);
        if (error instanceof Error && (error.message.includes('quota exceeded') || error.message.includes('RESOURCE_EXHAUSTED'))) {
            throw new Error('Hạn mức API Gemini của bạn đã hết. Vui lòng kiểm tra bảng điều khiển Google AI để xem chi tiết về hạn mức và thanh toán.');
        }
        throw new Error(`Không thể tạo video: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const generateVoiceover = async (
    script: string,
    voiceName: string,
    emotion: string,
    speed: number,
    updateProgress: (message: string) => void
): Promise<string> => {
    try {
        updateProgress('Đang gửi yêu cầu đến AI...');

        const fullPrompt = `CHỈ DẪN QUAN TRỌNG: Hãy đọc văn bản một cách tự nhiên nhất có thể, nhấn nhá đúng ngữ điệu của người Việt, ngắt nghỉ hợp lý ở các dấu câu để tạo ra âm thanh chân thực, không giống robot.

Yêu cầu chi tiết:
- Giọng đọc: ${voiceName}
- Phong cách: ${emotion}
- Tốc độ: ${speed}x so với tốc độ nói chuyện bình thường.
- Văn bản cần đọc: "${script}"`;


        // Simple mapping to available prebuilt voices based on gender cues
        let prebuiltVoice = 'Kore'; // Default to a female voice
        const lowerVoiceName = voiceName.toLowerCase();
        if (lowerVoiceName.includes('nam') || lowerVoiceName.includes('male') || lowerVoiceName.includes('ông') || lowerVoiceName.includes('boy') || lowerVoiceName.includes('puck')) {
            prebuiltVoice = 'Puck'; // A male voice
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ parts: [{ text: fullPrompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: prebuiltVoice },
                    },
                },
            },
        });

        updateProgress('Đang xử lý dữ liệu âm thanh...');

        const audioPart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData && part.inlineData.mimeType.startsWith('audio/'));

        if (audioPart && audioPart.inlineData) {
            const base64Audio = audioPart.inlineData.data;
            const audioBytes = base64ToUint8Array(base64Audio);

            // The API returns 24000Hz mono 16-bit PCM data. We create a WAV header for it.
            const sampleRate = 24000;
            const numChannels = 1;
            const bitsPerSample = 16;

            const dataSize = audioBytes.length;
            const buffer = new ArrayBuffer(44 + dataSize);
            const view = new DataView(buffer);

            const writeString = (view: DataView, offset: number, string: string) => {
                for (let i = 0; i < string.length; i++) {
                    view.setUint8(offset + i, string.charCodeAt(i));
                }
            };

            const blockAlign = (numChannels * bitsPerSample) / 8;
            const byteRate = sampleRate * blockAlign;

            /* RIFF identifier */
            writeString(view, 0, 'RIFF');
            /* file length */
            view.setUint32(4, 36 + dataSize, true);
            /* RIFF type */
            writeString(view, 8, 'WAVE');
            /* format chunk identifier */
            writeString(view, 12, 'fmt ');
            /* format chunk length */
            view.setUint32(16, 16, true);
            /* sample format (raw) */
            view.setUint16(20, 1, true);
            /* channel count */
            view.setUint16(22, numChannels, true);
            /* sample rate */
            view.setUint32(24, sampleRate, true);
            /* byte rate (sample rate * block align) */
            view.setUint32(28, byteRate, true);
            /* block align (channel count * bytes per sample) */
            view.setUint16(32, blockAlign, true);
            /* bits per sample */
            view.setUint16(34, bitsPerSample, true);
            /* data chunk identifier */
            writeString(view, 36, 'data');
            /* data chunk length */
            view.setUint32(40, dataSize, true);

            // Write PCM data
            new Uint8Array(buffer, 44).set(audioBytes);

            const blob = new Blob([view], { type: 'audio/wav' });
            return URL.createObjectURL(blob);
        }

        const textPart = response.text;
        if (textPart) {
            throw new Error(`Model responded with text instead of audio: ${textPart}`);
        }

        throw new Error("No audio was generated. The model may have refused the request or this functionality is not supported.");
    } catch (error) {
        console.error("Error generating voiceover:", error);
        throw new Error(`Failed to generate voiceover: ${error instanceof Error ? error.message : String(error)}`);
    }
};