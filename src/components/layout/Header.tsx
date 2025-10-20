import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Search, Sun, Moon, Monitor, Languages } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
    const { user } = useAuthStore();
    const { theme, setTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const [showThemeMenu, setShowThemeMenu] = useState(false);
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);

    const themeIcons = {
        light: Sun,
        dark: Moon,
        system: Monitor,
    };

    const ThemeIcon = themeIcons[theme];

    return (
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 transition-colors">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link
                        to={user ? "/dashboard" : "/"}
                        className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                    >
                        <Search className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">PixelCheck</h1>
                    </Link>

                    <nav className="flex items-center space-x-2">
                        {/* Theme Selector */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowThemeMenu(!showThemeMenu);
                                    setShowLanguageMenu(false);
                                }}
                                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                title="Cambiar tema / Change theme"
                            >
                                <ThemeIcon className="w-5 h-5" />
                            </button>
                            {showThemeMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50">
                                    <button
                                        onClick={() => {
                                            setTheme('light');
                                            setShowThemeMenu(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                            theme === 'light' ? 'bg-gray-50 dark:bg-gray-700' : ''
                                        }`}
                                    >
                                        <Sun className="w-4 h-4" />
                                        <span className="text-gray-700 dark:text-gray-200">{t('settings.lightMode')}</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setTheme('dark');
                                            setShowThemeMenu(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                            theme === 'dark' ? 'bg-gray-50 dark:bg-gray-700' : ''
                                        }`}
                                    >
                                        <Moon className="w-4 h-4" />
                                        <span className="text-gray-700 dark:text-gray-200">{t('settings.darkMode')}</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setTheme('system');
                                            setShowThemeMenu(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                            theme === 'system' ? 'bg-gray-50 dark:bg-gray-700' : ''
                                        }`}
                                    >
                                        <Monitor className="w-4 h-4" />
                                        <span className="text-gray-700 dark:text-gray-200">{t('settings.systemMode')}</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Language Selector */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowLanguageMenu(!showLanguageMenu);
                                    setShowThemeMenu(false);
                                }}
                                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                title="Cambiar idioma / Change language"
                            >
                                <Languages className="w-5 h-5" />
                            </button>
                            {showLanguageMenu && (
                                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50">
                                    <button
                                        onClick={() => {
                                            setLanguage('es');
                                            setShowLanguageMenu(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                            language === 'es' ? 'bg-gray-50 dark:bg-gray-700' : ''
                                        }`}
                                    >
                                        <span className="text-gray-700 dark:text-gray-200">{t('settings.spanish')}</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setLanguage('en');
                                            setShowLanguageMenu(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                            language === 'en' ? 'bg-gray-50 dark:bg-gray-700' : ''
                                        }`}
                                    >
                                        <span className="text-gray-700 dark:text-gray-200">{t('settings.english')}</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {user ? (
                            <>
                                {user.subscription_tier === 'premium' && (
                                    <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs px-2 py-1 rounded font-medium">
                                        {t('header.premium')}
                                    </span>
                                )}
                                <Link
                                    to="/pricing"
                                    className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all transform hover:scale-105 shadow-md hover:shadow-lg text-sm font-semibold"
                                >
                                    {t('header.viewPlans')}
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/pricing"
                                    className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all transform hover:scale-105 shadow-md hover:shadow-lg text-sm font-semibold"
                                >
                                    {t('header.viewPlans')}
                                </Link>
                                <Link
                                    to="/login"
                                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium"
                                >
                                    {t('header.login')}
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                                >
                                    {t('header.signUp')}
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}
