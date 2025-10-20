import { useState } from 'react';
import Header from '../components/layout/Header';
import ImageUploader from '../components/upload/ImageUploader';
import AnalysisResults from '../components/analysis/AnalysisResults';
import DetailedAnalysis from '../components/analysis/DetailedAnalysis';
import { PixelCheckAnalyzer } from '../lib/analyzer';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import type { AnalysisResults as AnalysisResultsType } from '../types';

export default function Home() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [results, setResults] = useState<AnalysisResultsType | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const { getSessionId } = useAuthStore();

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
            alert('Error al analizar la imagen. Por favor intenta de nuevo.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Detector de Imágenes Generadas por IA
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Utiliza algoritmos de Machine Learning avanzados para detectar si una imagen 
                        ha sido generada por inteligencia artificial, es una fotografía real o un diseño gráfico.
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
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg flex items-center justify-center space-x-2"
                                >
                                    <span>🤖</span>
                                    <span>Analizar con IA</span>
                                </button>
                            </div>
                        )}

                        {isAnalyzing && (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                                <p className="text-lg font-semibold text-gray-700">Analizando imagen...</p>
                                <p className="text-sm text-gray-500">Esto puede tomar unos segundos</p>
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
                                className="w-full mt-6 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                            >
                                Analizar otra imagen
                            </button>
                        </div>
                        <div>
                            <DetailedAnalysis results={results} />
                        </div>
                    </div>
                )}
            </main>

            <footer className="bg-white border-t border-gray-200 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                    <p className="text-gray-600">
                        PixelCheck utiliza algoritmos de ML avanzados para detectar imágenes generadas por IA
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Incluye detección de diseños gráficos - Resultado indicativo
                    </p>
                </div>
            </footer>
        </div>
    );
}
