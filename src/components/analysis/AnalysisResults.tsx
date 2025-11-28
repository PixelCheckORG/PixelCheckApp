import { useState } from 'react';
import type { AnalysisResult } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSubscription } from '../../hooks/useSubscription';
import { useAuthStore } from '../../store/useAuthStore';
import { pixelCheckAPI } from '../../lib/api/pixelcheck';

interface AnalysisResultsProps {
    results: AnalysisResult;
    imageUrl: string;
}

export default function AnalysisResults({ results, imageUrl }: AnalysisResultsProps) {
    const { t } = useLanguage();
    const { isPremium: isPremiumFromSubscription } = useSubscription();
    const { user } = useAuthStore();
    
    // Verificar premium desde ambas fuentes: subscription hook O user profile
    const isPremium = isPremiumFromSubscription || user?.subscription_tier === 'premium';
    
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState<string | null>(null);

    const getClassificationInfo = () => {
        const info = {
            'REAL': {
                icon: '✅',
                text: t('analysis.realImage'),
                color: 'green',
                description: t('analysis.realImageDesc')
            },
            'AI': {
                icon: '🤖',
                text: t('analysis.aiGenerated'),
                color: 'red',
                description: t('analysis.aiGeneratedDesc')
            }
        };

        return info[results.label];
    };

    const getConfidenceLevel = () => {
        if (results.confidence >= 0.8) return { text: t('analysis.highConfidence'), color: 'green' };
        if (results.confidence >= 0.6) return { text: t('analysis.mediumConfidence'), color: 'yellow' };
        return { text: t('analysis.lowConfidence'), color: 'red' };
    };

    const classInfo = getClassificationInfo();
    const confidenceInfo = getConfidenceLevel();

    // Función para descargar el reporte PDF
    const handleDownloadPDF = async () => {
        if (!results.reportId) {
            setDownloadError('No hay reporte disponible para esta imagen');
            return;
        }

        try {
            setIsDownloading(true);
            setDownloadError(null);
            await pixelCheckAPI.downloadReportAsFile(results.reportId, `analisis-${results.apiImageId}.pdf`);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            setDownloadError(error instanceof Error ? error.message : 'Error al descargar el reporte');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Imagen analizada - tamaño medio */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <img
                    src={imageUrl}
                    alt="Imagen analizada"
                    className="w-full h-80 object-cover bg-gray-50 dark:bg-gray-700"
                />
            </div>

            {/* Resultado principal - más compacto */}
            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-l-4 border-${classInfo.color}-500`}>
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('analysis.result')}</h3>
                    <span className={`bg-${confidenceInfo.color}-100 dark:bg-${confidenceInfo.color}-900 text-${confidenceInfo.color}-800 dark:text-${confidenceInfo.color}-200 text-xs font-medium px-2 py-1 rounded-full`}>
                        {confidenceInfo.text} ({(results.confidence * 100).toFixed(1)}%)
                    </span>
                </div>

                <div className="flex items-center space-x-3 mb-3">
                    <span className="text-4xl">{classInfo.icon}</span>
                    <div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">{classInfo.text}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{classInfo.description}</p>
                    </div>
                </div>

                {/* Probabilidades - solo Real vs IA */}
                <div className="mt-4 space-y-2">
                    <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">{t('analysis.probabilities')}</h5>

                    <div className="space-y-1.5">
                        <div>
                            <div className="flex justify-between text-xs mb-0.5">
                                <span className="text-gray-600 dark:text-gray-400">{t('analysis.realImage')}</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {(results.probReal * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                <div
                                    className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${results.probReal * 100}%` }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs mb-0.5">
                                <span className="text-gray-600 dark:text-gray-400">{t('analysis.aiGenerated')}</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {(results.probAi * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                <div
                                    className="bg-red-500 h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${results.probAi * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info del modelo */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('analysis.modelVersion')}: {results.modelVersion} | Threshold: {results.threshold}
                    </p>
                </div>

                {/* Botón de descarga PDF - Solo para premium */}
                {isPremium && results.reportId && (
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isDownloading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDownloading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>{t('analysis.downloading') || 'Descargando...'}</span>
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>{t('analysis.downloadPdf') || 'Descargar Reporte PDF'}</span>
                                </>
                            )}
                        </button>
                        {downloadError && (
                            <p className="mt-2 text-sm text-red-500 text-center">{downloadError}</p>
                        )}
                    </div>
                )}

                {/* Mensaje para usuarios no premium */}
                {!isPremium && (
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                                    {t('analysis.premiumFeature') || 'Función Premium'}
                                </p>
                                <p className="text-xs text-purple-700 dark:text-purple-300">
                                    {t('analysis.upgradeToPdf') || 'Actualiza a Premium para descargar reportes PDF detallados'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
