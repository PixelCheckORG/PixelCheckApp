import { X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useState } from 'react';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
    const { user } = useAuthStore();
    const { theme, setTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-gray-900 shadow-xl z-50 overflow-y-auto transition-colors">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings.general')}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>

                    {/* General */}
                    <div className="mb-8">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                            {t('settings.general')}
                        </h3>
                        <div className="space-y-3">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.fullName')}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Michael</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cuenta */}
                    <div className="mb-8">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                            {t('settings.account')}
                        </h3>
                        <div className="space-y-3">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.email')}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user?.email}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.plan')}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {user?.subscription_tier === 'premium' ? 'Premium' : language === 'es' ? 'Gratuito' : 'Free'}
                                        </p>
                                    </div>
                                    {user?.subscription_tier === 'free' && (
                                        <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                                            {language === 'es' ? 'Actualizar' : 'Upgrade'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Apariencia */}
                    <div className="mb-8">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                            {t('settings.appearance')}
                        </h3>
                        <div className="space-y-3">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">{t('settings.theme')}</p>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => setTheme('light')}
                                        className={`p-3 border-2 rounded-lg transition-colors ${
                                            theme === 'light'
                                                ? 'border-blue-600 dark:border-blue-400'
                                                : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                    >
                                        <div className="w-full h-8 bg-white border border-gray-200 rounded mb-2"></div>
                                        <p className="text-xs font-medium text-gray-900 dark:text-white">{t('settings.lightMode')}</p>
                                    </button>
                                    <button
                                        onClick={() => setTheme('dark')}
                                        className={`p-3 border-2 rounded-lg transition-colors ${
                                            theme === 'dark'
                                                ? 'border-blue-600 dark:border-blue-400'
                                                : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                    >
                                        <div className="w-full h-8 bg-gray-900 rounded mb-2"></div>
                                        <p className="text-xs font-medium text-gray-900 dark:text-white">{t('settings.darkMode')}</p>
                                    </button>
                                    <button
                                        onClick={() => setTheme('system')}
                                        className={`p-3 border-2 rounded-lg transition-colors ${
                                            theme === 'system'
                                                ? 'border-blue-600 dark:border-blue-400'
                                                : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                    >
                                        <div className="w-full h-8 bg-gradient-to-r from-white to-gray-900 rounded mb-2"></div>
                                        <p className="text-xs font-medium text-gray-900 dark:text-white">{t('settings.systemMode')}</p>
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.language')}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {language === 'es' ? 'Español' : 'English'}
                                        </p>
                                    </div>
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                                            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                        >
                                            {t('settings.change')}
                                        </button>
                                        {showLanguageMenu && (
                                            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1 z-10">
                                                <button
                                                    onClick={() => {
                                                        setLanguage('es');
                                                        setShowLanguageMenu(false);
                                                    }}
                                                    className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 ${
                                                        language === 'es' ? 'bg-gray-50 dark:bg-gray-600' : ''
                                                    }`}
                                                >
                                                    <span className="text-gray-700 dark:text-gray-200">Español</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setLanguage('en');
                                                        setShowLanguageMenu(false);
                                                    }}
                                                    className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 ${
                                                        language === 'en' ? 'bg-gray-50 dark:bg-gray-600' : ''
                                                    }`}
                                                >
                                                    <span className="text-gray-700 dark:text-gray-200">English</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notificaciones */}
                    <div className="mb-8">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                            {t('settings.notifications')}
                        </h3>
                        <div className="space-y-3">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.emailNotifications')}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {language === 'es' ? 'Recibe actualizaciones importantes' : 'Receive important updates'}
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Privacidad */}
                    <div className="mb-8">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                            {t('settings.privacy')}
                        </h3>
                        <div className="space-y-3">
                            <button className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.changePassword')}</p>
                            </button>
                            <button className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.dataPrivacy')}</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
