import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { ImageAnalysis } from '../../types';

interface SidebarProps {
    onNewAnalysis: () => void;
    onSelectAnalysis: (analysis: ImageAnalysis) => void;
    currentAnalysisId?: string;
    refreshTrigger?: number;
}

export default function Sidebar({ onNewAnalysis, onSelectAnalysis, currentAnalysisId, refreshTrigger }: SidebarProps) {
    const [analyses, setAnalyses] = useState<ImageAnalysis[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { user, signOut } = useAuthStore();

    useEffect(() => {
        loadAnalyses();
    }, [refreshTrigger]);

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
        <div 
            className={`bg-white border-r border-gray-200 h-full flex flex-col transition-all duration-300 ${
                isCollapsed ? 'w-16' : 'w-80'
            }`}
        >
            {/* Header con botón de colapsar */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                {!isCollapsed && (
                    <button
                        onClick={onNewAnalysis}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 font-medium"
                    >
                        <span className="text-xl">+</span>
                        <span>Nueva Imagen</span>
                    </button>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${
                        isCollapsed ? 'mx-auto' : 'ml-2'
                    }`}
                    title={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
                >
                    <svg 
                        className="w-5 h-5 text-gray-600" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        {isCollapsed ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Lista de análisis */}
            <div className="flex-1 overflow-y-auto min-h-0">
                {!isCollapsed ? (
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
                ) : (
                    <div className="p-2 space-y-2">
                        {analyses.slice(0, 5).map((analysis) => (
                            <button
                                key={analysis.id}
                                onClick={() => onSelectAnalysis(analysis)}
                                className={`w-full p-2 rounded-lg transition-colors ${
                                    currentAnalysisId === analysis.id
                                        ? 'bg-blue-50 border-2 border-blue-500'
                                        : 'bg-gray-50 hover:bg-gray-100'
                                }`}
                                title={analysis.image_name}
                            >
                                <span className="text-2xl">
                                    {getClassificationIcon(analysis.classification)}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Menú de usuario */}
            <div className="border-t border-gray-200 relative flex-shrink-0">
                {showUserMenu && !isCollapsed && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 mx-4 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                        <button
                            onClick={() => {/* Configuración futura */}}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center space-x-3"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-sm text-gray-700">Configuración</span>
                        </button>
                        <button
                            onClick={() => {
                                signOut();
                                setShowUserMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center space-x-3 text-red-600"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="text-sm">Cerrar Sesión</span>
                        </button>
                    </div>
                )}

                <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center space-x-3"
                >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-semibold text-lg">
                            {user?.email?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.email}
                            </p>
                            {user?.subscription_tier === 'premium' && (
                                <p className="text-xs text-yellow-600">Premium</p>
                            )}
                        </div>
                    )}
                    {!isCollapsed && (
                        <svg 
                            className={`w-5 h-5 text-gray-400 transition-transform ${
                                showUserMenu ? 'transform rotate-180' : ''
                            }`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}
