import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ImageAnalysis } from '../../types';

interface SidebarProps {
    onNewAnalysis: () => void;
    onSelectAnalysis: (analysis: ImageAnalysis) => void;
    currentAnalysisId?: string;
}

export default function Sidebar({ onNewAnalysis, onSelectAnalysis, currentAnalysisId }: SidebarProps) {
    const [analyses, setAnalyses] = useState<ImageAnalysis[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalyses();
    }, []);

    const loadAnalyses = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) return;

            const { data, error } = await supabase
                .from('image_analyses')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setAnalyses(data || []);
        } catch (error) {
            console.error('Error loading analyses:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getClassificationIcon = (classification: string) => {
        const icons: Record<string, string> = {
            'real': '✅',
            'ai-generated': '🤖',
            'graphic-design': '🎨',
            'uncertain': '❓'
        };
        return icons[classification] || '📷';
    };

    return (
        <div className="w-80 bg-white border-r border-gray-200 h-screen flex flex-col">
            <div className="p-4 border-b border-gray-200">
                <button
                    onClick={onNewAnalysis}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 font-medium"
                >
                    <span className="text-xl">+</span>
                    <span>Nueva Imagen</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Análisis Recientes
                    </h3>

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : analyses.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-8">
                            No hay análisis guardados
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {analyses.map((analysis) => (
                                <button
                                    key={analysis.id}
                                    onClick={() => onSelectAnalysis(analysis)}
                                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                                        currentAnalysisId === analysis.id
                                            ? 'bg-blue-50 border-2 border-blue-500'
                                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                                    }`}
                                >
                                    <div className="flex items-start space-x-2">
                                        <span className="text-2xl flex-shrink-0">
                                            {getClassificationIcon(analysis.classification)}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {analysis.image_name}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formatDate(analysis.created_at)}
                                            </p>
                                            <div className="flex items-center space-x-2 mt-2">
                                                <span className={`text-xs px-2 py-1 rounded ${
                                                    analysis.classification === 'real' 
                                                        ? 'bg-green-100 text-green-800'
                                                        : analysis.classification === 'ai-generated'
                                                        ? 'bg-red-100 text-red-800'
                                                        : analysis.classification === 'graphic-design'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {analysis.confidence === 'high' ? 'Alta' : 
                                                     analysis.confidence === 'medium' ? 'Media' : 'Baja'} confianza
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
