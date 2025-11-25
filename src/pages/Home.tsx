import { useState } from 'react';
import Header from '../components/layout/Header';
import ImageUploader from '../components/upload/ImageUploader';
import AnalysisResults from '../components/analysis/AnalysisResults';
import DetailedAnalysis from '../components/analysis/DetailedAnalysis';
import { pixelCheckAPI } from '../lib/api/pixelcheck';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguage } from '../contexts/LanguageContext';
import type { AnalysisResult } from '../types';

export default function Home() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [results, setResults] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisStatus, setAnalysisStatus] = useState<string>('');
    const { user, getSessionId } = useAuthStore();
    const { t } = useLanguage();

    const handleImageSelect = async (file: File) => {
        setSelectedFile(file);
        setResults(null);
        setAnalysisStatus('');
        
        // Crear URL temporal para mostrar la imagen
        const url = URL.createObjectURL(file);
        setImageUrl(url);
    };

    const handleAnalyze = async () => {
        if (!selectedFile) return;

        setIsAnalyzing(true);
        setAnalysisStatus('uploading');

        try {
            // 1. Analizar imagen con la API de PixelCheck
            const apiResult = await pixelCheckAPI.analyzeImage(
                selectedFile,
                (status) => setAnalysisStatus(status)
            );
            
            // 2. Convertir resultado de API a formato de la UI
            const analysisResult: AnalysisResult = {
                apiImageId: apiResult.imageId,
                label: apiResult.label,
                confidence: apiResult.confidence,
                modelVersion: apiResult.modelVersion,
                probAi: apiResult.details.prob_ai,
                probReal: apiResult.details.prob_real,
                threshold: apiResult.details.threshold,
                featureScores: apiResult.details.features,
                observations: apiResult.details.observations,
            };
            
            setResults(analysisResult);

            // 3. Subir imagen a Supabase Storage
            const sessionId = getSessionId();
            const userId = user?.id;
            const folderPath = userId || sessionId;
            const fileName = `${folderPath}/${Date.now()}_${selectedFile.name}`;
            
            const { error: uploadError } = await supabase.storage
                .from('image-analyses')
                .upload(fileName, selectedFile);

            if (uploadError) {
                console.error('Error uploading to storage:', uploadError);
            }

            // 4. Obtener URL pública
            const { data: { publicUrl } } = supabase.storage
                .from('image-analyses')
                .getPublicUrl(fileName);

            // 5. Guardar análisis en base de datos Supabase
            const { error: insertError } = await supabase
                .from('image_analyses')
                .insert({
                    user_id: userId || null,
                    session_id: userId ? null : sessionId,
                    image_url: publicUrl,
                    image_name: selectedFile.name,
                    image_size: selectedFile.size,
                    api_image_id: apiResult.imageId,
                    label: apiResult.label,
                    confidence: apiResult.confidence,
                    model_version: apiResult.modelVersion,
                    prob_ai: apiResult.details.prob_ai,
                    prob_real: apiResult.details.prob_real,
                    threshold: apiResult.details.threshold,
                    feature_scores: apiResult.details.features,
                    observations: apiResult.details.observations,
                });

            if (insertError) {
                console.error('Error saving analysis:', insertError);
            }

        } catch (error) {
            console.error('Error analyzing image:', error);
            alert(t('common.error'));
        } finally {
            setIsAnalyzing(false);
            setAnalysisStatus('');
        }
    };

    const getStatusText = () => {
        switch (analysisStatus) {
            case 'uploading':
                return t('home.uploadingToServer') || 'Subiendo imagen...';
            case 'processing':
                return t('home.processingAI') || 'Analizando con IA...';
            default:
                return t('dashboard.analyzing');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        {t('home.title')}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        {t('home.description')}
                    </p>
                </div>

                {!results ? (
                    <div className="max-w-2xl mx-auto space-y-6">
                        <ImageUploader
                            onImageSelect={handleImageSelect}
                            isAnalyzing={isAnalyzing}
                        />

                        {selectedFile && !isAnalyzing && (
                            <div className="space-y-4">
                                <img
                                    src={imageUrl}
                                    alt="Vista previa"
                                    className="w-full rounded-lg shadow-md"
                                />
                                <button
                                    onClick={handleAnalyze}
                                    className="w-full bg-blue-600 dark:bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-semibold text-lg flex items-center justify-center space-x-2"
                                >
                                    <span>🤖</span>
                                    <span>{t('home.analyzeButton')}</span>
                                </button>
                            </div>
                        )}

                        {isAnalyzing && (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{getStatusText()}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('uploader.pleaseWait')}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <AnalysisResults results={results} imageUrl={imageUrl} />
                            <button
                                onClick={() => {
                                    setResults(null);
                                    setSelectedFile(null);
                                    setImageUrl('');
                                }}
                                className="w-full mt-6 bg-gray-600 dark:bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors font-semibold"
                            >
                                {t('dashboard.analyzeAnother')}
                            </button>
                        </div>
                        <div>
                            <DetailedAnalysis results={results} />
                        </div>
                    </div>
                )}
            </main>

            <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-20 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        PixelCheck - {t('home.title')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                        {t('home.description')}
                    </p>
                </div>
            </footer>
        </div>
    );
}
