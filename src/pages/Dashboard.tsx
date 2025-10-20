import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import ImageUploader from '../components/upload/ImageUploader';
import AnalysisResults from '../components/analysis/AnalysisResults';
import DetailedAnalysis from '../components/analysis/DetailedAnalysis';
import { PixelCheckAnalyzer } from '../lib/analyzer';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import type { AnalysisResults as AnalysisResultsType, ImageAnalysis } from '../types';

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [results, setResults] = useState<AnalysisResultsType | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
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
    }, []);

    const handleSelectAnalysis = useCallback((analysis: ImageAnalysis) => {
        setSelectedAnalysis(analysis);
        setShowNewAnalysis(false);
        setImageUrl(analysis.image_url);
        setSelectedFile(null);
        setIsAnalyzing(false);
        
        // Reconstruir resultados desde la base de datos
        const reconstructedResults: AnalysisResultsType = {
            imageWidth: analysis.image_width,
            imageHeight: analysis.image_height,
            colorAnalysis: analysis.color_analysis,
            transparencyAnalysis: analysis.transparency_analysis,
            noiseAnalysis: analysis.noise_analysis,
            watermarkAnalysis: analysis.watermark_analysis,
            symmetryAnalysis: analysis.symmetry_analysis,
            metadataAnalysis: analysis.metadata_analysis,
            mlClassification: {
                classification: analysis.classification,
                confidence: analysis.confidence,
                probability: analysis.probability,
                allProbabilities: {
                    real: analysis.probability_real,
                    aiGenerated: analysis.probability_ai,
                    graphicDesign: analysis.probability_graphic,
                },
                features: analysis.ml_features,
            },
        };
        
        setResults(reconstructedResults);
    }, []);

    const handleImageSelect = useCallback(async (file: File) => {
        setSelectedFile(file);
        setResults(null);
        setIsAnalyzing(false);
        
        const url = URL.createObjectURL(file);
        setImageUrl(url);
    }, []);

    const handleAnalyze = async () => {
        if (!selectedFile || !user) return;

        setIsAnalyzing(true);

        try {
            const analyzer = new PixelCheckAnalyzer();
            const analysisResults = await analyzer.analyzeImage(selectedFile);
            
            setResults(analysisResults);

            const fileName = `${user.id}/${Date.now()}_${selectedFile.name}`;
            
            const { error: uploadError } = await supabase.storage
                .from('image-analyses')
                .upload(fileName, selectedFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('image-analyses')
                .getPublicUrl(fileName);

            const { error: insertError } = await supabase
                .from('image_analyses')
                .insert({
                    user_id: user.id,
                    session_id: null,
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

            // Incrementar el contador para refrescar el sidebar
            setRefreshSidebar(prev => prev + 1);

        } catch (error) {
            console.error('Error analyzing image:', error);
            alert('Error al analizar la imagen. Por favor intenta de nuevo.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleExport = async () => {
        if (!results || user?.subscription_tier !== 'premium') {
            alert('Esta función solo está disponible para usuarios Premium');
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

    const generateCSV = (results: AnalysisResultsType) => {
        const { mlClassification, colorAnalysis, noiseAnalysis } = results;
        
        let csv = 'Campo,Valor\n';
        csv += `Clasificación,${mlClassification.classification}\n`;
        csv += `Confianza,${mlClassification.confidence}\n`;
        csv += `Probabilidad,${(mlClassification.probability * 100).toFixed(2)}%\n`;
        csv += `Probabilidad Real,${(mlClassification.allProbabilities.real * 100).toFixed(2)}%\n`;
        csv += `Probabilidad IA,${(mlClassification.allProbabilities.aiGenerated * 100).toFixed(2)}%\n`;
        csv += `Probabilidad Diseño,${(mlClassification.allProbabilities.graphicDesign * 100).toFixed(2)}%\n`;
        csv += `Colores Únicos,${colorAnalysis.uniqueColors}\n`;
        csv += `Diversidad Color,${colorAnalysis.diversityScore.toFixed(4)}\n`;
        csv += `Nivel Ruido,${noiseAnalysis.noiseScore.toFixed(4)}\n`;
        
        return csv;
    };

    if (!user) return null;

    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
            <Header />
            
            <div className="flex flex-1 overflow-hidden">
                <Sidebar 
                    onNewAnalysis={handleNewAnalysis}
                    onSelectAnalysis={handleSelectAnalysis}
                    currentAnalysisId={selectedAnalysis?.id}
                    refreshTrigger={refreshSidebar}
                />

                <main className="flex-1 p-8 overflow-y-auto">
                    {showNewAnalysis && !results ? (
                        <div className="max-w-2xl mx-auto space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900">Nuevo Análisis</h2>
                            
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
                                </div>
                            )}
                        </div>
                    ) : results ? (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {selectedAnalysis ? 'Análisis Guardado' : 'Resultado del Análisis'}
                                </h2>
                                {user.subscription_tier === 'premium' && (
                                    <button
                                        onClick={handleExport}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center space-x-2"
                                    >
                                        <span>📥</span>
                                        <span>Exportar CSV</span>
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                    <AnalysisResults results={results} imageUrl={imageUrl} />
                                </div>
                                <div>
                                    <DetailedAnalysis results={results} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-gray-500 text-lg">Cargando análisis...</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
