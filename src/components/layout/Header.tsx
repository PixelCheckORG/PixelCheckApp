import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useLanguage } from '../../contexts/LanguageContext';
import { Search } from 'lucide-react';

export default function Header() {
    const { user } = useAuthStore();
    const { t } = useLanguage();

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
