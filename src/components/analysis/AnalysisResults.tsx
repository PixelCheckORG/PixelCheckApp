import type { AnalysisResults } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface AnalysisResultsProps {
    results: AnalysisResults;
    imageUrl: string;
}

export default function AnalysisResults({ results, imageUrl }: AnalysisResultsProps) {
    const { mlClassification } = results;
    const { t } = useLanguage();

    const getClassificationInfo = () => {
        const info = {
            'real': {
                icon: '✅',
                text: t('analysis.realImage'),
                color: 'green',
                description: t('analysis.realImage')
            },
            'ai-generated': {
                icon: '🤖',
                text: t('analysis.aiGenerated'),
                color: 'red',
                description: t('analysis.aiGenerated')
            },
            'graphic-design': {
                icon: '🎨',
                text: t('analysis.graphicDesign'),
                color: 'purple',
                description: t('analysis.graphicDesign')
            },
            'uncertain': {
                icon: '❓',
                text: t('analysis.uncertain'),
                color: 'gray',
                description: t('analysis.uncertain')
            }
        };

        return info[mlClassification.classification];
    };

    const getConfidenceText = () => {
        const texts = {
            'high': t('analysis.highConfidence'),
            'medium': t('analysis.mediumConfidence'),
            'low': t('analysis.lowConfidence')
        };
        return texts[mlClassification.confidence];
    };

    const classInfo = getClassificationInfo();

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
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Resultado</h3>
                    <span className={`bg-${classInfo.color}-100 dark:bg-${classInfo.color}-900 text-${classInfo.color}-800 dark:text-${classInfo.color}-200 text-xs font-medium px-2 py-1 rounded-full`}>
                        {getConfidenceText()} ({(mlClassification.probability * 100).toFixed(1)}%)
                    </span>
                </div>

                <div className="flex items-center space-x-3 mb-3">
                    <span className="text-4xl">{classInfo.icon}</span>
                    <div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">{classInfo.text}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{classInfo.description}</p>
                    </div>
                </div>

                {/* Probabilidades - más compactas */}
                <div className="mt-4 space-y-2">
                    <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">{t('analysis.probabilities')}</h5>

                    <div className="space-y-1.5">
                        <div>
                            <div className="flex justify-between text-xs mb-0.5">
                                <span className="text-gray-600 dark:text-gray-400">{t('analysis.realImage')}</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {(mlClassification.allProbabilities.real * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                <div
                                    className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${mlClassification.allProbabilities.real * 100}%` }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs mb-0.5">
                                <span className="text-gray-600 dark:text-gray-400">{t('analysis.aiGenerated')}</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {(mlClassification.allProbabilities.aiGenerated * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                <div
                                    className="bg-red-500 h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${mlClassification.allProbabilities.aiGenerated * 100}%` }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs mb-0.5">
                                <span className="text-gray-600 dark:text-gray-400">{t('analysis.graphicDesign')}</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {(mlClassification.allProbabilities.graphicDesign * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                <div
                                    className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${mlClassification.allProbabilities.graphicDesign * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
