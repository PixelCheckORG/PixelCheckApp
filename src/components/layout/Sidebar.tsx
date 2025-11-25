import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { useLanguage } from '../../contexts/LanguageContext';
import { ImageAnalysis } from '../../types';
import { Plus, ChevronsLeft, ChevronsRight, Settings, LogOut, ChevronUp, Image as ImageIcon } from 'lucide-react';
import SettingsPanel from './SettingsPanel';
import toast from 'react-hot-toast';

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
    const [showSettings, setShowSettings] = useState(false);
    const { user, signOut } = useAuthStore();
    const { t, language } = useLanguage();

    const handleSignOut = async () => {
        await signOut();
        toast.success(t('sidebar.logout'));
        setShowUserMenu(false);
    };

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
        const locale = language === 'es' ? 'es-ES' : 'en-US';
        return date.toLocaleDateString(locale, {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getClassificationIcon = () => {
        return <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    };

    const getConfidenceText = (confidence: string) => {
        if (confidence === 'high') return t('sidebar.highConfidence');
        if (confidence === 'medium') return t('sidebar.mediumConfidence');
        return t('sidebar.lowConfidence');
    };

    return (
        <>
            <div
                className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col transition-all duration-300 ${
                    isCollapsed ? 'w-16' : 'w-80'
                }`}
            >
                {/* Header con botón de colapsar */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
                    {!isCollapsed && (
                        <button
                            onClick={onNewAnalysis}
                            className="flex-1 bg-blue-600 dark:bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            <span>{t('sidebar.newImage')}</span>
                        </button>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors ${
                            isCollapsed ? 'mx-auto' : 'ml-2'
                        }`}
                        title={isCollapsed ? t('sidebar.expand') : t('sidebar.collapse')}
                    >
                        {isCollapsed ? (
                            <ChevronsRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        ) : (
                            <ChevronsLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        )}
                    </button>
                </div>

            {/* Lista de análisis */}
            <div className="flex-1 overflow-y-auto min-h-0">
                {!isCollapsed ? (
                    <div className="p-4">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                            {t('sidebar.recentAnalysis')}
                        </h3>

                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : analyses.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
                                {language === 'es' ? 'No hay análisis guardados' : 'No saved analyses'}
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {analyses.map((analysis) => (
                                    <button
                                        key={analysis.id}
                                        onClick={() => onSelectAnalysis(analysis)}
                                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                                            currentAnalysisId === analysis.id
                                                ? 'bg-blue-50 dark:bg-blue-950 border-2 border-blue-500'
                                                : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent'
                                        }`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            {analysis.image_url ? (
                                                <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                                                    <img
                                                        src={analysis.image_url}
                                                        alt={analysis.image_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <span className="flex-shrink-0">
                                                    {getClassificationIcon()}
                                                </span>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {analysis.image_name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {formatDate(analysis.created_at)}
                                                </p>
                                                <div className="flex items-center space-x-2 mt-2">
                                                    <span className={`text-xs px-2 py-1 rounded ${
                                                        analysis.label === 'REAL'
                                                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                                    }`}>
                                                        {analysis.label === 'REAL' ? '✅ Real' : '🤖 IA'}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {(analysis.confidence * 100).toFixed(0)}%
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
                                className={`w-full h-12 rounded-lg transition-colors overflow-hidden ${
                                    currentAnalysisId === analysis.id
                                        ? 'bg-blue-50 dark:bg-blue-950 border-2 border-blue-500'
                                        : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent'
                                }`}
                                title={analysis.image_name}
                            >
                                {analysis.image_url ? (
                                    <img
                                        src={analysis.image_url}
                                        alt={analysis.image_name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        {getClassificationIcon()}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

                {/* User menu */}
                <div className="border-t border-gray-200 dark:border-gray-700 relative flex-shrink-0">
                    {showUserMenu && !isCollapsed && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-10">
                            <button
                                onClick={() => {
                                    setShowSettings(true);
                                    setShowUserMenu(false);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3"
                            >
                                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{t('sidebar.settings')}</span>
                            </button>
                            <button
                                onClick={handleSignOut}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3 text-red-600 dark:text-red-400"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="text-sm">{t('sidebar.logout')}</span>
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center space-x-3"
                    >
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 dark:text-blue-300 font-semibold text-lg">
                                {user?.email?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {user?.email}
                                </p>
                                {user?.subscription_tier === 'premium' && (
                                    <p className="text-xs text-yellow-600 dark:text-yellow-400">{t('header.premium')}</p>
                                )}
                            </div>
                        )}
                        {!isCollapsed && (
                            <ChevronUp
                                className={`w-5 h-5 text-gray-400 transition-transform ${
                                    showUserMenu ? 'transform rotate-180' : ''
                                }`}
                            />
                        )}
                    </button>
                </div>
            </div>

            <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
        </>
    );
}
