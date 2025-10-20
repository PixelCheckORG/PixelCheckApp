import { useState } from 'react';
import Header from '../components/layout/Header';
import ImageUploader from '../components/upload/ImageUploader';
import AnalysisResults from '../components/analysis/AnalysisResults';
import DetailedAnalysis from '../components/analysis/DetailedAnalysis';
import { PixelCheckAnalyzer } from '../lib/analyzer';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguage } from '../contexts/LanguageContext';
import type { AnalysisResults as AnalysisResultsType } from '../types';

export default function Home() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [results, setResults] = useState<AnalysisResultsType | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const { getSessionId } = useAuthStore();
    const { t } = useLanguage();

    const handleImageSelect = async (file: File) => {
        setSelectedFile(file);
        setResults(null);
        
        // Crear URL temporal para mostrar la imagen
        const url = URL.createObjectURL(file);
        setImageUrl(url);
    };

    const handleAnalyze = async () => {
        if (!selectedFile) return;

        setIsAnalyzing(true);

        try {
            // Realizar análisis
            const analyzer = new PixelCheckAnalyzer();
            const analysisResults = await analyzer.analyzeImage(selectedFile);
            
            setResults(analysisResults);

            // Subir imagen a Supabase Storage
            const sessionId = getSessionId();
            const fileName = `${sessionId}/${Date.now()}_${selectedFile.name}`;
            
            const { error: uploadError } = await supabase.storage
                .from('image-analyses')
                .upload(fileName, selectedFile);

            if (uploadError) throw uploadError;

            // Obtener URL pública
            const { data: { publicUrl } } = supabase.storage
                .from('image-analyses')
                .getPublicUrl(fileName);

            // Guardar análisis en base de datos
            const { data: { user } } = await supabase.auth.getUser();
            
            const { error: insertError } = await supabase
                .from('image_analyses')
                .insert({
                    user_id: user?.id || null,
                    session_id: user ? null : sessionId,
                    image_url: publicUrl,
                    image_name: selectedFile.name,
                    image_size: selectedFile.size,
                    image_width: analysisResults.imageWidth,
                    image_height: analysisResults.imageHeight,
                    classification: analysisResults.mlClassification.classification,
                    confidence: analysisResults.mlClassification.confidence,
                    probability: analysisResults.mlClassification.probability,
                    color_analysis: analysisResults.colorAnalysis,
                    transparency_analysis: analysisResults.transparencyAnalysis,
                    noise_analysis: analysisResults.noiseAnalysis,
                    watermark_analysis: analysisResults.watermarkAnalysis,
                    symmetry_analysis: analysisResults.symmetryAnalysis,
                    metadata_analysis: analysisResults.metadataAnalysis,
                    ml_features: analysisResults.mlClassification.features,
                    probability_real: analysisResults.mlClassification.allProbabilities.real,
                    probability_ai: analysisResults.mlClassification.allProbabilities.aiGenerated,
                    probability_graphic: analysisResults.mlClassification.allProbabilities.graphicDesign,
                });

            if (insertError) throw insertError;

        } catch (error) {
            console.error('Error analyzing image:', error);
            alert(t('common.error'));
        } finally {
            setIsAnalyzing(false);
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
                                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{t('dashboard.analyzing')}</p>
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
