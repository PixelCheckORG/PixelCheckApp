import type { AnalysisResult } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface AnalysisResultsProps {
    results: AnalysisResult;
    imageUrl: string;
}

export default function AnalysisResults({ results, imageUrl }: AnalysisResultsProps) {
    const { t } = useLanguage();

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
            </div>
        </div>
    );
}
