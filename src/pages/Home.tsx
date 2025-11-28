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
                reportId: apiResult.reportId,
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
                    report_id: apiResult.reportId,
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
                        {!selectedFile ? (
                            <ImageUploader
                                onImageSelect={handleImageSelect}
                                isAnalyzing={isAnalyzing}
                            />
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                                {/* Header con nombre del archivo */}
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-white font-semibold truncate max-w-xs">{selectedFile.name}</p>
                                                <p className="text-blue-100 text-sm">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedFile(null);
                                                setImageUrl('');
                                            }}
                                            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                                        >
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Imagen con efecto */}
                                <div className="relative group">
                                    <div className="aspect-video bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                        <img
                                            src={imageUrl}
                                            alt="Vista previa"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
                                </div>
                                
                                {/* Botón de analizar */}
                                <div className="p-6">
                                    {isAnalyzing ? (
                                        <div className="flex flex-col items-center space-y-4 py-4">
                                            <div className="relative">
                                                <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
                                                <div className="absolute inset-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                                            </div>
                                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{getStatusText()}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('uploader.pleaseWait')}</p>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleAnalyze}
                                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                            <span>{t('home.analyzeButton')}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Mensaje de éxito cuando hay imagen cargada */}
                        {selectedFile && !isAnalyzing && (
                            <div className="flex justify-center">
                                <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-4 py-2 rounded-full">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-medium text-sm">{t('dashboard.imageLoaded')}</span>
                                </div>
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
