// Servicio para conectar con PixelCheck API
const API_BASE_URL = import.meta.env.VITE_PIXELCHECK_API_URL || 'https://pixelcheckapi.azurewebsites.net/api/v1';

// Tipos de respuesta de la API
export interface UploadResponse {
    imageId: string;
    status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

export interface FeatureScores {
    color_score: number;
    noise_score: number;
    symmetry_score: number;
    watermark_score: number;
    transparency_score: number;
}

export interface Observations {
    noise: string;
    colors: string;
    symmetry: string;
    watermark: string;
    transparency: string;
}

export interface ModelMetadata {
    notes: string;
    classes: string[];
    best_val_f1: number;
    hyperparams: {
        lr: number;
        epochs: number;
        batch_size: number;
        weight_decay: number;
    };
    val_metrics: {
        f1: number;
        acc: number;
        auc: number;
        loss: number;
    };
    best_val_auc: number;
    test_metrics: {
        f1: number;
        acc: number;
        auc: number;
        loss: number;
    };
    ai_class_index: number;
}

export interface AnalysisDetails {
    prob_ai: number;
    features: FeatureScores;
    metadata: ModelMetadata;
    prob_real: number;
    threshold: number;
    observations: Observations;
    model_version: string;
}

export interface ResultResponse {
    imageId: string;
    label: 'AI' | 'REAL';
    confidence: number;
    modelVersion: string;
    details: AnalysisDetails;
    reportId: string | null;
}

// Clase del servicio API
class PixelCheckAPI {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    /**
     * Sube una imagen a la API para análisis
     */
    async uploadImage(file: File): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append('image', file);  // La API espera el campo 'image'

        try {
            const response = await fetch(`${this.baseUrl}/images/upload`, {
                method: 'POST',
                body: formData,
                // No establecer Content-Type, el navegador lo hace automáticamente con el boundary
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Upload error response:', errorText);
                throw new Error(`Error uploading image: ${response.status} - ${errorText}`);
            }

            return response.json();
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                console.error('CORS or network error. Check if API is accessible.');
                throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
            }
            throw error;
        }
    }

    /**
     * Obtiene el resultado del análisis de una imagen
     */
    async getResult(imageId: string): Promise<ResultResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/results/${imageId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 404 || response.status === 202) {
                    throw new Error('PROCESSING');
                }
                const errorText = await response.text();
                console.error('Result error response:', errorText);
                throw new Error(`Error getting result: ${response.status} - ${errorText}`);
            }

            return response.json();
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new Error('PROCESSING'); // Reintentar si hay error de red
            }
            throw error;
        }
    }

    /**
     * Sube una imagen y espera el resultado con polling
     */
    async analyzeImage(
        file: File, 
        onStatusChange?: (status: string) => void,
        maxAttempts: number = 60,
        pollInterval: number = 2000
    ): Promise<ResultResponse> {
        // 1. Subir imagen
        onStatusChange?.('uploading');
        console.log('Uploading image to:', this.baseUrl);
        const uploadResponse = await this.uploadImage(file);
        console.log('Upload response:', uploadResponse);
        
        // 2. Esperar resultado con polling
        onStatusChange?.('processing');
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            try {
                await new Promise(resolve => setTimeout(resolve, pollInterval));
                console.log(`Polling attempt ${attempts + 1}/${maxAttempts} for imageId:`, uploadResponse.imageId);
                const result = await this.getResult(uploadResponse.imageId);
                console.log('Got result:', result);
                onStatusChange?.('completed');
                return result;
            } catch (error) {
                if (error instanceof Error && error.message === 'PROCESSING') {
                    attempts++;
                    console.log('Still processing, waiting...');
                } else {
                    throw error;
                }
            }
        }

        throw new Error('Analysis timeout: exceeded maximum attempts');
    }

    /**
     * Verifica si la API está disponible
     */
    async healthCheck(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl.replace('/api/v1', '')}/health`, {
                method: 'GET',
            });
            return response.ok;
        } catch {
            return false;
        }
    }
}

// Exportar instancia singleton
export const pixelCheckAPI = new PixelCheckAPI();
export default pixelCheckAPI;
