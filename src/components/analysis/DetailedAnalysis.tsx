import type { AnalysisResults } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

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
    const { t, language } = useLanguage();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-3 transition-colors">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t('analysis.detailedAnalysis')}</h3>

            {/* Análisis de Color - compacto */}
            <div className="pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">🌈</span>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{t('analysis.colorAnalysis')}</h4>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1.5">
                    <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${colorAnalysis.diversityScore * 100}%` }}
                    />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                    {colorAnalysis.uniqueColors} {language === 'es' ? 'colores únicos. ' : 'unique colors. '}
                    {colorAnalysis.hasLimitedPalette
                        ? t('analysis.limitedPalette')
                        : t('analysis.richDiversity')}
                </p>
            </div>

            {/* Análisis de Transparencia - compacto */}
            <div className="pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">✨</span>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{t('analysis.transparency')}</h4>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1.5">
                    <div
                        className="bg-cyan-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${transparencyAnalysis.transparencyRatio * 100}%` }}
                    />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                    {(transparencyAnalysis.transparencyRatio * 100).toFixed(1)}% {' '}
                    {transparencyAnalysis.hasSignificantTransparency
                        ? t('analysis.transparentPixels')
                        : t('analysis.opaqueImage')}
                </p>
            </div>

            {/* Análisis de Ruido - compacto */}
            <div className="pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">🔊</span>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{t('analysis.noiseAnalysis')}</h4>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1.5">
                    <div
                        className="bg-orange-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${noiseAnalysis.noiseScore * 100}%` }}
                    />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{noiseAnalysis.interpretation}</p>
            </div>

            {/* Análisis de Watermark - compacto */}
            <div className="pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">🔍</span>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{t('analysis.watermarks')}</h4>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1.5">
                    <div
                        className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${watermarkAnalysis.watermarkScore * 100}%` }}
                    />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{watermarkAnalysis.interpretation}</p>
            </div>

            {/* Análisis de Simetría - compacto */}
            <div className="pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">⚖️</span>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{t('analysis.symmetry')}</h4>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1.5">
                    <div
                        className="bg-pink-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${symmetryAnalysis.symmetryAiScore * 100}%` }}
                    />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{symmetryAnalysis.interpretation}</p>
            </div>

            {/* Características ML - compacto */}
            <div>
                <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">🤖</span>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{t('analysis.mlFeatures')}</h4>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block">Color</span>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{mlClassification.features[0].toFixed(2)}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block">Trans.</span>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{mlClassification.features[1].toFixed(2)}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block">{language === 'es' ? 'Ruido' : 'Noise'}</span>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{mlClassification.features[2].toFixed(2)}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block">Sim.</span>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{mlClassification.features[3].toFixed(2)}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block">Mark</span>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{mlClassification.features[4].toFixed(2)}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block">Pal.</span>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{mlClassification.features[5].toFixed(2)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
