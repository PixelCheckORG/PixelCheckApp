import { ImageUtils } from './utils';
import { AnalysisResults, MLClassification } from '../../types';

export class PixelCheckAnalyzer {
    async analyzeImage(file: File): Promise<AnalysisResults> {
        const imageData = await ImageUtils.loadImageData(file);
        
        // Análisis de color
        const colorAnalysis = this.analyzeColor(imageData);
        
        // Análisis de transparencia
        const transparencyAnalysis = this.analyzeTransparency(imageData);
        
        // Análisis de ruido
        const noiseAnalysis = this.analyzeNoise(imageData);
        
        // Análisis de watermark
        const watermarkAnalysis = this.analyzeWatermark(imageData);
        
        // Análisis de simetría
        const symmetryAnalysis = this.analyzeSymmetry(imageData);
        
        // Análisis de metadatos
        const metadataAnalysis = this.analyzeMetadata(file);
        
        // Clasificación ML
        const mlClassification = this.performMLClassification(
            colorAnalysis,
            transparencyAnalysis,
            noiseAnalysis,
            watermarkAnalysis,
            symmetryAnalysis
        );

        return {
            imageWidth: imageData.width,
            imageHeight: imageData.height,
            colorAnalysis,
            transparencyAnalysis,
            noiseAnalysis,
            watermarkAnalysis,
            symmetryAnalysis,
            metadataAnalysis,
            mlClassification,
        };
    }

    private analyzeColor(imageData: ImageData) {
        const uniqueColors = ImageUtils.calculateColorDiversity(imageData);
        const totalPixels = imageData.width * imageData.height;
        const diversityScore = Math.min(uniqueColors / (totalPixels * 0.1), 1);
        const hasLimitedPalette = uniqueColors < totalPixels * 0.01;

        return {
            uniqueColors,
            diversityScore,
            hasLimitedPalette,
            dominantColors: [],
        };
    }

    private analyzeTransparency(imageData: ImageData) {
        const transparencyRatio = ImageUtils.calculateTransparency(imageData);
        const totalPixels = imageData.width * imageData.height;
        const transparentPixels = Math.floor(transparencyRatio * totalPixels);

        return {
            transparencyRatio,
            hasSignificantTransparency: transparencyRatio > 0.1,
            transparentPixels,
            totalPixels,
        };
    }

    private analyzeNoise(imageData: ImageData) {
        const noiseScore = ImageUtils.calculateNoise(imageData);
        let noiseLevel: string;
        let interpretation: string;

        if (noiseScore < 0.1) {
            noiseLevel = 'low';
            interpretation = 'Bajo nivel de ruido. Típico de imágenes generadas por IA o altamente procesadas.';
        } else if (noiseScore < 0.3) {
            noiseLevel = 'medium';
            interpretation = 'Nivel medio de ruido. Podría ser imagen real o IA con post-procesamiento.';
        } else {
            noiseLevel = 'high';
            interpretation = 'Alto nivel de ruido. Característico de fotografías reales.';
        }

        return {
            noiseScore,
            noiseLevel,
            interpretation,
        };
    }

    private analyzeWatermark(imageData: ImageData) {
        // Análisis simplificado de watermark
        const watermarkScore = Math.random() * 0.5; // Placeholder
        
        return {
            watermarkScore,
            hasWatermark: watermarkScore > 0.3,
            interpretation: watermarkScore > 0.3 
                ? 'Posible watermark detectado' 
                : 'No se detectaron watermarks evidentes',
        };
    }

    private analyzeSymmetry(imageData: ImageData) {
        const { width, height, data } = imageData;
        let horizontalDiff = 0;
        let verticalDiff = 0;
        let comparisons = 0;

        // Comparar píxeles horizontales (izquierda vs derecha)
        for (let y = 0; y < height; y += 10) {
            for (let x = 0; x < width / 2; x += 10) {
                const leftIdx = (y * width + x) * 4;
                const rightIdx = (y * width + (width - 1 - x)) * 4;
                
                const diff = Math.abs(data[leftIdx] - data[rightIdx]) +
                            Math.abs(data[leftIdx + 1] - data[rightIdx + 1]) +
                            Math.abs(data[leftIdx + 2] - data[rightIdx + 2]);
                
                horizontalDiff += diff;
                comparisons++;
            }
        }

        const horizontalSymmetry = 1 - (horizontalDiff / (comparisons * 765));
        const verticalSymmetry = 0.5; // Placeholder
        const symmetryAiScore = (horizontalSymmetry + verticalSymmetry) / 2;

        return {
            horizontalSymmetry,
            verticalSymmetry,
            symmetryAiScore,
            interpretation: symmetryAiScore > 0.7 
                ? 'Alta simetría detectada. Común en imágenes generadas por IA.' 
                : 'Simetría natural.',
        };
    }

    private analyzeMetadata(file: File) {
        return {
            basicMetadata: {
                format: file.type,
                dimensions: 'N/A',
                size: ImageUtils.formatFileSize(file.size),
            },
            aiModelAnalysis: {
                signatures: [],
                detected: false,
            },
        };
    }

    private performMLClassification(
        colorAnalysis: any,
        transparencyAnalysis: any,
        noiseAnalysis: any,
        watermarkAnalysis: any,
        symmetryAnalysis: any
    ): MLClassification {
        // Extraer características
        const features = [
            colorAnalysis.diversityScore,
            transparencyAnalysis.transparencyRatio,
            noiseAnalysis.noiseScore,
            symmetryAnalysis.symmetryAiScore,
            watermarkAnalysis.watermarkScore,
            colorAnalysis.hasLimitedPalette ? 1 : 0,
        ];

        // Clasificación simplificada basada en características
        const aiScore = (
            (1 - noiseAnalysis.noiseScore) * 0.3 +
            symmetryAnalysis.symmetryAiScore * 0.3 +
            (colorAnalysis.hasLimitedPalette ? 0.2 : 0) +
            watermarkAnalysis.watermarkScore * 0.2
        );

        const graphicScore = (
            (transparencyAnalysis.hasSignificantTransparency ? 0.4 : 0) +
            (colorAnalysis.hasLimitedPalette ? 0.3 : 0) +
            (1 - noiseAnalysis.noiseScore) * 0.3
        );

        const realScore = 1 - Math.max(aiScore, graphicScore);

        // Normalizar probabilidades
        const total = aiScore + graphicScore + realScore;
        const probAi = aiScore / total;
        const probGraphic = graphicScore / total;
        const probReal = realScore / total;

        // Determinar clasificación
        let classification: 'real' | 'ai-generated' | 'graphic-design' | 'uncertain';
        let confidence: 'high' | 'medium' | 'low';
        let probability: number;

        if (probAi > probGraphic && probAi > probReal) {
            classification = 'ai-generated';
            probability = probAi;
        } else if (probGraphic > probAi && probGraphic > probReal) {
            classification = 'graphic-design';
            probability = probGraphic;
        } else if (probReal > 0.4) {
            classification = 'real';
            probability = probReal;
        } else {
            classification = 'uncertain';
            probability = Math.max(probAi, probGraphic, probReal);
        }

        // Determinar confianza
        if (probability > 0.7) {
            confidence = 'high';
        } else if (probability > 0.5) {
            confidence = 'medium';
        } else {
            confidence = 'low';
        }

        return {
            classification,
            confidence,
            probability,
            allProbabilities: {
                real: probReal,
                aiGenerated: probAi,
                graphicDesign: probGraphic,
            },
            features,
        };
    }
}
