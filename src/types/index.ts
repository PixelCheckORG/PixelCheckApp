// Tipos principales de la aplicación

export interface User {
    id: string;
    email: string;
    subscription_tier: 'free' | 'premium';
    subscription_expires_at: string | null;
    created_at: string;
}

export interface ImageAnalysis {
    id: string;
    user_id: string | null;
    session_id: string | null;
    image_url: string;
    image_name: string;
    image_size: number;
    image_width: number;
    image_height: number;
    classification: 'real' | 'ai-generated' | 'graphic-design' | 'uncertain';
    confidence: 'high' | 'medium' | 'low';
    probability: number;
    color_analysis: ColorAnalysis;
    transparency_analysis: TransparencyAnalysis;
    noise_analysis: NoiseAnalysis;
    watermark_analysis: WatermarkAnalysis;
    symmetry_analysis: SymmetryAnalysis;
    metadata_analysis: MetadataAnalysis;
    ml_features: number[];
    probability_real: number;
    probability_ai: number;
    probability_graphic: number;
    created_at: string;
}

export interface ColorAnalysis {
    uniqueColors: number;
    diversityScore: number;
    hasLimitedPalette: boolean;
    dominantColors: string[];
}

export interface TransparencyAnalysis {
    transparencyRatio: number;
    hasSignificantTransparency: boolean;
    transparentPixels: number;
    totalPixels: number;
}

export interface NoiseAnalysis {
    noiseScore: number;
    noiseLevel: string;
    interpretation: string;
}

export interface WatermarkAnalysis {
    watermarkScore: number;
    hasWatermark: boolean;
    interpretation: string;
}

export interface SymmetryAnalysis {
    horizontalSymmetry: number;
    verticalSymmetry: number;
    symmetryAiScore: number;
    interpretation: string;
}

export interface MetadataAnalysis {
    basicMetadata: {
        format: string;
        dimensions: string;
        size: string;
    };
    aiModelAnalysis: {
        signatures: string[];
        detected: boolean;
    };
}

export interface MLClassification {
    classification: 'real' | 'ai-generated' | 'graphic-design' | 'uncertain';
    confidence: 'high' | 'medium' | 'low';
    probability: number;
    allProbabilities: {
        real: number;
        aiGenerated: number;
        graphicDesign: number;
    };
    features: number[];
}

export interface AnalysisResults {
    imageWidth: number;
    imageHeight: number;
    colorAnalysis: ColorAnalysis;
    transparencyAnalysis: TransparencyAnalysis;
    noiseAnalysis: NoiseAnalysis;
    watermarkAnalysis: WatermarkAnalysis;
    symmetryAnalysis: SymmetryAnalysis;
    metadataAnalysis: MetadataAnalysis;
    mlClassification: MLClassification;
}

export interface Subscription {
    id: string;
    user_id: string;
    stripe_subscription_id: string;
    status: 'active' | 'cancelled' | 'expired' | 'pending';
    plan_type: string;
    amount: number;
    currency: string;
    current_period_start: string;
    current_period_end: string;
    created_at: string;
}
