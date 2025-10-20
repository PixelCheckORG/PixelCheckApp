import type { AnalysisResults } from '../../types';

interface DetailedAnalysisProps {
    results: AnalysisResults;
}

export default function DetailedAnalysis({ results }: DetailedAnalysisProps) {
    const { 
        colorAnalysis, 
        transparencyAnalysis, 
        noiseAnalysis, 
        watermarkAnalysis, 
        symmetryAnalysis,
        mlClassification 
    } = results;

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Análisis Detallado</h3>

            {/* Análisis de Color */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-2 mb-3">
                    <span className="text-2xl">🌈</span>
                    <h4 className="text-lg font-semibold text-gray-900">Análisis de Color</h4>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div 
                        className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${colorAnalysis.diversityScore * 100}%` }}
                    />
                </div>
                <p className="text-sm text-gray-600">
                    {colorAnalysis.uniqueColors} colores únicos. {' '}
                    {colorAnalysis.hasLimitedPalette 
                        ? 'Paleta limitada detectada (común en IA).' 
                        : 'Rica diversidad cromática.'}
                </p>
            </div>

            {/* Análisis de Transparencia */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-2 mb-3">
                    <span className="text-2xl">✨</span>
                    <h4 className="text-lg font-semibold text-gray-900">Análisis de Transparencia</h4>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div 
                        className="bg-cyan-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${transparencyAnalysis.transparencyRatio * 100}%` }}
                    />
                </div>
                <p className="text-sm text-gray-600">
                    {(transparencyAnalysis.transparencyRatio * 100).toFixed(1)}% píxeles transparentes. {' '}
                    {transparencyAnalysis.hasSignificantTransparency 
                        ? 'Transparencia significativa detectada.' 
                        : 'Imagen mayormente opaca.'}
                </p>
            </div>

            {/* Análisis de Ruido */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-2 mb-3">
                    <span className="text-2xl">🔊</span>
                    <h4 className="text-lg font-semibold text-gray-900">Análisis de Ruido</h4>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div 
                        className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${noiseAnalysis.noiseScore * 100}%` }}
                    />
                </div>
                <p className="text-sm text-gray-600">{noiseAnalysis.interpretation}</p>
            </div>

            {/* Análisis de Watermark */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-2 mb-3">
                    <span className="text-2xl">🔍</span>
                    <h4 className="text-lg font-semibold text-gray-900">Detección de Watermarks</h4>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div 
                        className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${watermarkAnalysis.watermarkScore * 100}%` }}
                    />
                </div>
                <p className="text-sm text-gray-600">{watermarkAnalysis.interpretation}</p>
            </div>

            {/* Análisis de Simetría */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-2 mb-3">
                    <span className="text-2xl">⚖️</span>
                    <h4 className="text-lg font-semibold text-gray-900">Análisis de Simetría</h4>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div 
                        className="bg-pink-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${symmetryAnalysis.symmetryAiScore * 100}%` }}
                    />
                </div>
                <p className="text-sm text-gray-600">{symmetryAnalysis.interpretation}</p>
            </div>

            {/* Características ML */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-2 mb-4">
                    <span className="text-2xl">🤖</span>
                    <h4 className="text-lg font-semibold text-gray-900">Características ML</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-xs text-gray-500 uppercase">Diversidad Color</span>
                        <p className="text-lg font-semibold text-gray-900">{mlClassification.features[0].toFixed(3)}</p>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 uppercase">Transparencia</span>
                        <p className="text-lg font-semibold text-gray-900">{mlClassification.features[1].toFixed(3)}</p>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 uppercase">Nivel Ruido</span>
                        <p className="text-lg font-semibold text-gray-900">{mlClassification.features[2].toFixed(3)}</p>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 uppercase">Simetría</span>
                        <p className="text-lg font-semibold text-gray-900">{mlClassification.features[3].toFixed(3)}</p>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 uppercase">Watermark</span>
                        <p className="text-lg font-semibold text-gray-900">{mlClassification.features[4].toFixed(3)}</p>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 uppercase">Paleta</span>
                        <p className="text-lg font-semibold text-gray-900">{mlClassification.features[5].toFixed(3)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
