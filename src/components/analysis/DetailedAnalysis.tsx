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
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Análisis Detallado</h3>

            {/* Análisis de Color - compacto */}
            <div className="pb-3 border-b border-gray-100">
                <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">🌈</span>
                    <h4 className="text-sm font-semibold text-gray-900">Análisis de Color</h4>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1.5">
                    <div 
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${colorAnalysis.diversityScore * 100}%` }}
                    />
                </div>
                <p className="text-xs text-gray-600">
                    {colorAnalysis.uniqueColors} colores únicos. {' '}
                    {colorAnalysis.hasLimitedPalette 
                        ? 'Paleta limitada detectada.' 
                        : 'Rica diversidad cromática.'}
                </p>
            </div>

            {/* Análisis de Transparencia - compacto */}
            <div className="pb-3 border-b border-gray-100">
                <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">✨</span>
                    <h4 className="text-sm font-semibold text-gray-900">Transparencia</h4>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1.5">
                    <div 
                        className="bg-cyan-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${transparencyAnalysis.transparencyRatio * 100}%` }}
                    />
                </div>
                <p className="text-xs text-gray-600">
                    {(transparencyAnalysis.transparencyRatio * 100).toFixed(1)}% píxeles transparentes. {' '}
                    {transparencyAnalysis.hasSignificantTransparency 
                        ? 'Transparencia significativa.' 
                        : 'Imagen opaca.'}
                </p>
            </div>

            {/* Análisis de Ruido - compacto */}
            <div className="pb-3 border-b border-gray-100">
                <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">🔊</span>
                    <h4 className="text-sm font-semibold text-gray-900">Análisis de Ruido</h4>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1.5">
                    <div 
                        className="bg-orange-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${noiseAnalysis.noiseScore * 100}%` }}
                    />
                </div>
                <p className="text-xs text-gray-600">{noiseAnalysis.interpretation}</p>
            </div>

            {/* Análisis de Watermark - compacto */}
            <div className="pb-3 border-b border-gray-100">
                <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">🔍</span>
                    <h4 className="text-sm font-semibold text-gray-900">Watermarks</h4>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1.5">
                    <div 
                        className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${watermarkAnalysis.watermarkScore * 100}%` }}
                    />
                </div>
                <p className="text-xs text-gray-600">{watermarkAnalysis.interpretation}</p>
            </div>

            {/* Análisis de Simetría - compacto */}
            <div className="pb-3 border-b border-gray-100">
                <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">⚖️</span>
                    <h4 className="text-sm font-semibold text-gray-900">Simetría</h4>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1.5">
                    <div 
                        className="bg-pink-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${symmetryAnalysis.symmetryAiScore * 100}%` }}
                    />
                </div>
                <p className="text-xs text-gray-600">{symmetryAnalysis.interpretation}</p>
            </div>

            {/* Características ML - compacto */}
            <div>
                <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">🤖</span>
                    <h4 className="text-sm font-semibold text-gray-900">Características ML</h4>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-gray-50 rounded">
                        <span className="text-xs text-gray-500 block">Color</span>
                        <p className="text-sm font-semibold text-gray-900">{mlClassification.features[0].toFixed(2)}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                        <span className="text-xs text-gray-500 block">Trans.</span>
                        <p className="text-sm font-semibold text-gray-900">{mlClassification.features[1].toFixed(2)}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                        <span className="text-xs text-gray-500 block">Ruido</span>
                        <p className="text-sm font-semibold text-gray-900">{mlClassification.features[2].toFixed(2)}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                        <span className="text-xs text-gray-500 block">Sim.</span>
                        <p className="text-sm font-semibold text-gray-900">{mlClassification.features[3].toFixed(2)}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                        <span className="text-xs text-gray-500 block">Mark</span>
                        <p className="text-sm font-semibold text-gray-900">{mlClassification.features[4].toFixed(2)}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                        <span className="text-xs text-gray-500 block">Pal.</span>
                        <p className="text-sm font-semibold text-gray-900">{mlClassification.features[5].toFixed(2)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
