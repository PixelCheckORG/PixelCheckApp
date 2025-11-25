import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import ImageUploader from '../components/upload/ImageUploader';
import AnalysisResults from '../components/analysis/AnalysisResults';
import DetailedAnalysis from '../components/analysis/DetailedAnalysis';
import { pixelCheckAPI } from '../lib/api/pixelcheck';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguage } from '../contexts/LanguageContext';
import type { AnalysisResult, ImageAnalysis } from '../types';

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { t } = useLanguage();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [results, setResults] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisStatus, setAnalysisStatus] = useState<string>('');
    const [selectedAnalysis, setSelectedAnalysis] = useState<ImageAnalysis | null>(null);
    const [showNewAnalysis, setShowNewAnalysis] = useState(true);
    const [refreshSidebar, setRefreshSidebar] = useState(0);

    useEffect(() => {
        if (!user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleNewAnalysis = useCallback(() => {
        setSelectedAnalysis(null);
        setResults(null);
        setSelectedFile(null);
        setImageUrl('');
        setShowNewAnalysis(true);
        setIsAnalyzing(false);
        setAnalysisStatus('');
    }, []);

    const handleSelectAnalysis = useCallback((analysis: ImageAnalysis) => {
        setSelectedAnalysis(analysis);
        setShowNewAnalysis(false);
        setImageUrl(analysis.image_url);
        setSelectedFile(null);
        setIsAnalyzing(false);
        
        // Reconstruir resultados desde la base de datos
        const reconstructedResults: AnalysisResult = {
            apiImageId: analysis.api_image_id,
            label: analysis.label,
            confidence: analysis.confidence,
            modelVersion: analysis.model_version,
            probAi: analysis.prob_ai,
            probReal: analysis.prob_real,
            threshold: analysis.threshold,
            featureScores: analysis.feature_scores,
            observations: analysis.observations,
        };
        
        setResults(reconstructedResults);
    }, []);

    const handleImageSelect = useCallback(async (file: File) => {
        setSelectedFile(file);
        setResults(null);
        setIsAnalyzing(false);
        setAnalysisStatus('');
        
        const url = URL.createObjectURL(file);
        setImageUrl(url);
    }, []);

    const handleAnalyze = async () => {
        if (!selectedFile || !user) return;

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
            const fileName = `${user.id}/${Date.now()}_${selectedFile.name}`;
            
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
                    user_id: user.id,
                    session_id: null,
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

            // Incrementar el contador para refrescar el sidebar
            setRefreshSidebar(prev => prev + 1);

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

    const handleExport = async () => {
        if (!results || user?.subscription_tier !== 'premium') {
            alert(t('common.error'));
            return;
        }

        // Exportar a CSV
        const csvContent = generateCSV(results);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analisis_${Date.now()}.csv`;
        a.click();
    };

    const generateCSV = (results: AnalysisResult) => {
        let csv = 'Campo,Valor\n';
        csv += `Clasificación,${results.label === 'AI' ? 'Generada por IA' : 'Imagen Real'}\n`;
        csv += `Confianza,${(results.confidence * 100).toFixed(2)}%\n`;
        csv += `Probabilidad IA,${(results.probAi * 100).toFixed(2)}%\n`;
        csv += `Probabilidad Real,${(results.probReal * 100).toFixed(2)}%\n`;
        csv += `Versión del Modelo,${results.modelVersion}\n`;
        csv += `Score Color,${(results.featureScores.color_score * 100).toFixed(1)}%\n`;
        csv += `Score Ruido,${(results.featureScores.noise_score * 100).toFixed(1)}%\n`;
        csv += `Score Simetría,${(results.featureScores.symmetry_score * 100).toFixed(1)}%\n`;
        csv += `Score Watermark,${(results.featureScores.watermark_score * 100).toFixed(1)}%\n`;
        csv += `Score Transparencia,${(results.featureScores.transparency_score * 100).toFixed(1)}%\n`;
        
        return csv;
    };

    if (!user) return null;

    return (
        <div className="h-screen bg-gray-50 dark:bg-gray-950 flex flex-col overflow-hidden transition-colors">
            <Header />

            <div className="flex flex-1 overflow-hidden">
                <Sidebar
                    onNewAnalysis={handleNewAnalysis}
                    onSelectAnalysis={handleSelectAnalysis}
                    currentAnalysisId={selectedAnalysis?.id}
                    refreshTrigger={refreshSidebar}
                />

                <main className="flex-1 overflow-hidden flex flex-col">
                    {showNewAnalysis && !results ? (
                        <div className="flex-1 overflow-y-auto p-8 flex justify-center">
                            <div className="max-w-5xl w-full pt-12">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">{t('dashboard.newAnalysis')}</h2>

                                <div className="w-full flex justify-center">
                                    {/* Columna izquierda: Uploader o Preview */}
                                    <div className="max-w-3xl w-full">
                                        {!selectedFile ? (
                                            <ImageUploader
                                                onImageSelect={handleImageSelect}
                                                isAnalyzing={isAnalyzing}
                                            />
                                        ) : (
                                            <div className="space-y-4">
                                                <img
                                                    src={imageUrl}
                                                    alt="Vista previa"
                                                    className="w-full h-64 object-cover rounded-lg shadow-md"
                                                />
                                                {!isAnalyzing && (
                                                    <button
                                                        onClick={handleAnalyze}
                                                        className="w-full bg-blue-600 dark:bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center space-x-2"
                                                    >
                                                        <span>{t('dashboard.analyzeWithAI')}</span>
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Info o Loading - Solo se muestra cuando hay archivo seleccionado */}
                                {(isAnalyzing || selectedFile) && (
                                    <div className="flex justify-center mt-8">
                                        {isAnalyzing ? (
                                            <div className="flex flex-col items-center space-y-4">
                                                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                                                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{getStatusText()}</p>
                                            </div>
                                        ) : selectedFile ? (
                                            <div className="text-center space-y-4 p-6 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                                <svg className="w-16 h-16 text-blue-500 dark:text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <p className="text-gray-700 dark:text-gray-300 font-medium">
                                                    {t('dashboard.imageLoaded')}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {t('dashboard.analyzeWithAI')}
                                                </p>
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : results ? (
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="max-w-7xl mx-auto space-y-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {selectedAnalysis ? t('dashboard.savedAnalysis') : t('dashboard.analysisResult')}
                                    </h2>
                                    {user.subscription_tier === 'premium' && (
                                        <button
                                            onClick={handleExport}
                                            className="bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors font-semibold flex items-center space-x-2"
                                        >
                                            <span>{t('dashboard.exportCSV')}</span>
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <AnalysisResults results={results} imageUrl={imageUrl} />
                                    </div>
                                    <div className="space-y-4">
                                        <DetailedAnalysis results={results} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-gray-500 dark:text-gray-400 text-lg">{t('dashboard.loadingAnalysis')}</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
