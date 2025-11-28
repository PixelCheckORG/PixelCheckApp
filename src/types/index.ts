// Tipos principales de la aplicación
// Actualizado para usar la API de PixelCheck

export interface User {
    id: string;
    email: string;
    subscription_tier: 'free' | 'premium';
    subscription_expires_at: string | null;
    created_at: string;
}

// Scores de características del análisis (desde la API)
export interface FeatureScores {
    color_score: number;
    noise_score: number;
    symmetry_score: number;
    watermark_score: number;
    transparency_score: number;
}

// Observaciones textuales del análisis
export interface Observations {
    noise: string;
    colors: string;
    symmetry: string;
    watermark: string;
    transparency: string;
}

// Análisis guardado en Supabase (desde la API)
export interface ImageAnalysis {
    id: string;
    user_id: string | null;
    session_id: string | null;
    image_url: string;
    image_name: string;
    image_size: number;
    api_image_id: string;  // ID de la imagen en la API de PixelCheck
    
    // Resultados del análisis ML (desde API)
    label: 'AI' | 'REAL';
    confidence: number;  // 0-1 decimal
    model_version: string;
    
    // Probabilidades
    prob_ai: number;
    prob_real: number;
    threshold: number;
    
    // Features scores
    feature_scores: FeatureScores;
    
    // Observaciones textuales
    observations: Observations;
    
    // ID del reporte PDF (para descarga premium)
    report_id: string | null;
    
    created_at: string;
}

// Resultado del análisis para mostrar en la UI
export interface AnalysisResult {
    apiImageId: string;
    label: 'AI' | 'REAL';
    confidence: number;
    modelVersion: string;
    probAi: number;
    probReal: number;
    threshold: number;
    featureScores: FeatureScores;
    observations: Observations;
    reportId: string | null;  // ID del reporte para descarga PDF (solo premium)
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

