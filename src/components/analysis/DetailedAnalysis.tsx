import type { AnalysisResult } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface DetailedAnalysisProps {
    results: AnalysisResult;
}

export default function DetailedAnalysis({ results }: DetailedAnalysisProps) {
    const { featureScores, observations } = results;
    const { t, language } = useLanguage();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-3 transition-colors">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t('analysis.detailedAnalysis')}</h3>

            {/* Análisis de Color */}
            <div className="pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">🌈</span>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{t('analysis.colorAnalysis')}</h4>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1.5">
                    <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${featureScores.color_score * 100}%` }}
                    />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                    {observations.colors || `${(featureScores.color_score * 100).toFixed(0)}%`}
                </p>
            </div>

            {/* Análisis de Transparencia */}
            <div className="pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">✨</span>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{t('analysis.transparency')}</h4>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1.5">
                    <div
                        className="bg-cyan-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${featureScores.transparency_score * 100}%` }}
                    />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                    {observations.transparency || `${(featureScores.transparency_score * 100).toFixed(0)}%`}
                </p>
            </div>

            {/* Análisis de Ruido */}
            <div className="pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">🔊</span>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{t('analysis.noiseAnalysis')}</h4>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1.5">
                    <div
                        className="bg-orange-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${featureScores.noise_score * 100}%` }}
                    />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                    {observations.noise || `${(featureScores.noise_score * 100).toFixed(0)}%`}
                </p>
            </div>

            {/* Análisis de Watermark */}
            <div className="pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">🔍</span>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{t('analysis.watermarks')}</h4>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1.5">
                    <div
                        className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${featureScores.watermark_score * 100}%` }}
                    />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                    {observations.watermark || `${(featureScores.watermark_score * 100).toFixed(0)}%`}
                </p>
            </div>

            {/* Análisis de Simetría */}
            <div className="pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">⚖️</span>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{t('analysis.symmetry')}</h4>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1.5">
                    <div
                        className="bg-pink-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${featureScores.symmetry_score * 100}%` }}
                    />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                    {observations.symmetry || `${(featureScores.symmetry_score * 100).toFixed(0)}%`}
                </p>
            </div>

            {/* Resumen de Features */}
            <div>
                <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">📊</span>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{t('analysis.featureScores')}</h4>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block">Color</span>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{(featureScores.color_score * 100).toFixed(0)}%</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block">Trans.</span>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{(featureScores.transparency_score * 100).toFixed(0)}%</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block">{language === 'es' ? 'Ruido' : 'Noise'}</span>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{(featureScores.noise_score * 100).toFixed(0)}%</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block">Sim.</span>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{(featureScores.symmetry_score * 100).toFixed(0)}%</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block">Mark</span>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{(featureScores.watermark_score * 100).toFixed(0)}%</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block">{language === 'es' ? 'Conf.' : 'Conf.'}</span>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{(results.confidence * 100).toFixed(0)}%</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
