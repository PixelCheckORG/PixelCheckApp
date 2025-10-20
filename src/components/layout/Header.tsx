import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Search } from 'lucide-react';

export default function Header() {
    const { user } = useAuthStore();

    return (
        <header className="bg-white border-b border-gray-200 flex-shrink-0">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link 
                        to={user ? "/dashboard" : "/"} 
                        className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                    >
                        <Search className="w-8 h-8 text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-900">PixelCheck</h1>
                    </Link>

                    <nav className="flex items-center space-x-4">
                        {user ? (
                            <>
                                {user.subscription_tier === 'premium' && (
                                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-medium">
                                        Premium
                                    </span>
                                )}
                                <Link
                                    to="/pricing"
                                    className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-md hover:shadow-lg text-sm font-semibold"
                                >
                                    Ver Planes
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/pricing"
                                    className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-md hover:shadow-lg text-sm font-semibold"
                                >
                                    Ver Planes
                                </Link>
                                <Link
                                    to="/login"
                                    className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
                                >
                                    Iniciar Sesión
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                                >
                                    Registrarse
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}
