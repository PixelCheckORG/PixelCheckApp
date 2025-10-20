import { AnalysisResults } from '../../types';

export class ImageUtils {
    static formatFileSize(bytes: number): string {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

    static async loadImageData(file: File): Promise<ImageData> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (e) => {
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    
                    if (!ctx) {
                        reject(new Error('Could not get canvas context'));
                        return;
                    }

                    ctx.drawImage(img, 0, 0);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    resolve(imageData);
                };
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target?.result as string;
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    static calculateColorDiversity(imageData: ImageData): number {
        const colors = new Set<string>();
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            colors.add(`${r},${g},${b}`);
        }

        return colors.size;
    }

    static calculateTransparency(imageData: ImageData): number {
        const data = imageData.data;
        let transparentPixels = 0;

        for (let i = 3; i < data.length; i += 4) {
            if (data[i] < 255) {
                transparentPixels++;
            }
        }

        return transparentPixels / (data.length / 4);
    }

    static calculateNoise(imageData: ImageData): number {
        const data = imageData.data;
        let variance = 0;
        const totalPixels = data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            variance += luminance * luminance;
        }

        return Math.sqrt(variance / totalPixels) / 255;
    }
}
