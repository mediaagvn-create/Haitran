import { Base64Image } from "../types";

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const imageUrlToBase64 = async (url: string): Promise<Base64Image> => {
  // Use a proxy to avoid CORS issues in a local/dev environment
  const fetchUrl = `https://cors-anywhere.herokuapp.com/${url}`;
  
  const response = await fetch(fetchUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from URL: ${url}. Status: ${response.statusText}`);
  }
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const [meta, base64] = result.split(',');
      if (!meta || !base64) {
        reject(new Error("Failed to parse Data URL."));
        return;
      }
      const mimeType = meta.match(/:(.*?);/)?.[1] || blob.type;
      resolve({ data: base64, mimeType });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(blob);
  });
};