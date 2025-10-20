import type { AnalysisResults } from '../../types';

interface AnalysisResultsProps {
    results: AnalysisResults;
    imageUrl: string;
}

export default function AnalysisResults({ results, imageUrl }: AnalysisResultsProps) {
    const { mlClassification } = results;

    const getClassificationInfo = () => {
        const info = {
            'real': {
                icon: '✅',
                text: 'Imagen Real',
                color: 'green',
                description: 'Esta imagen parece ser una fotografía real sin generación por IA.'
            },
            'ai-generated': {
                icon: '🤖',
                text: 'Generada por IA',
                color: 'red',
                description: 'Esta imagen presenta características típicas de generación por IA.'
            },
            'graphic-design': {
                icon: '🎨',
                text: 'Diseño Gráfico',
                color: 'purple',
                description: 'Esta imagen parece ser un diseño gráfico o ilustración digital.'
            },
            'uncertain': {
                icon: '❓',
                text: 'Resultado Incierto',
                color: 'gray',
                description: 'No se pudo determinar con certeza el origen de esta imagen.'
            }
        };

        return info[mlClassification.classification];
    };

    const getConfidenceText = () => {
        const texts = {
            'high': 'Alta Confianza',
            'medium': 'Confianza Media',
            'low': 'Baja Confianza'
        };
        return texts[mlClassification.confidence];
    };

    const classInfo = getClassificationInfo();

    return (
        <div className="space-y-4">
            {/* Imagen analizada - tamaño medio */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <img 
                    src={imageUrl} 
                    alt="Imagen analizada" 
                    className="w-full h-80 object-cover bg-gray-50"
                />
            </div>

            {/* Resultado principal - más compacto */}
            <div className={`bg-white rounded-lg shadow-sm p-4 border-l-4 border-${classInfo.color}-500`}>
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900">Resultado</h3>
                    <span className={`bg-${classInfo.color}-100 text-${classInfo.color}-800 text-xs font-medium px-2 py-1 rounded-full`}>
                        {getConfidenceText()} ({(mlClassification.probability * 100).toFixed(1)}%)
                    </span>
                </div>

                <div className="flex items-center space-x-3 mb-3">
                    <span className="text-4xl">{classInfo.icon}</span>
                    <div>
                        <h4 className="text-xl font-bold text-gray-900">{classInfo.text}</h4>
                        <p className="text-sm text-gray-600 mt-1">{classInfo.description}</p>
                    </div>
                </div>

                {/* Probabilidades - más compactas */}
                <div className="mt-4 space-y-2">
                    <h5 className="text-xs font-semibold text-gray-700 uppercase">Probabilidades</h5>
                    
                    <div className="space-y-1.5">
                        <div>
                            <div className="flex justify-between text-xs mb-0.5">
                                <span className="text-gray-600">Imagen Real</span>
                                <span className="font-medium text-gray-900">
                                    {(mlClassification.allProbabilities.real * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                    className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${mlClassification.allProbabilities.real * 100}%` }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs mb-0.5">
                                <span className="text-gray-600">Generada por IA</span>
                                <span className="font-medium text-gray-900">
                                    {(mlClassification.allProbabilities.aiGenerated * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                    className="bg-red-500 h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${mlClassification.allProbabilities.aiGenerated * 100}%` }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs mb-0.5">
                                <span className="text-gray-600">Diseño Gráfico</span>
                                <span className="font-medium text-gray-900">
                                    {(mlClassification.allProbabilities.graphicDesign * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
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
