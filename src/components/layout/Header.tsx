import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import LoginModal from '../auth/LoginModal';
import RegisterModal from '../auth/RegisterModal';

export default function Header() {
    const { user, signOut } = useAuthStore();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);

    const handleSwitchToRegister = () => {
        setShowLoginModal(false);
        setShowRegisterModal(true);
    };

    const handleSwitchToLogin = () => {
        setShowRegisterModal(false);
        setShowLoginModal(true);
    };

    return (
        <>
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link 
                            to={user ? "/dashboard" : "/"} 
                            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                        >
                            <span className="text-3xl">🔍</span>
                            <h1 className="text-2xl font-bold text-gray-900">PixelCheck</h1>
                        </Link>

                        <nav className="flex items-center space-x-6">
                            {user ? (
                                <>
                                    <span className="text-sm text-gray-600">{user.email}</span>
                                    {user.subscription_tier === 'premium' && (
                                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                                            Premium
                                        </span>
                                    )}
                                    <Link
                                        to="/pricing"
                                        className="text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        Planes
                                    </Link>
                                    <button
                                        onClick={signOut}
                                        className="text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        Cerrar Sesión
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/pricing"
                                        className="text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        Planes
                                    </Link>
                                    <button
                                        onClick={() => setShowLoginModal(true)}
                                        className="text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        Iniciar Sesión
                                    </button>
                                    <button
                                        onClick={() => setShowRegisterModal(true)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Registrarse
                                    </button>
                                </>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSwitchToRegister={handleSwitchToRegister}
            />
            <RegisterModal
                isOpen={showRegisterModal}
                onClose={() => setShowRegisterModal(false)}
                onSwitchToLogin={handleSwitchToLogin}
            />
        </>
    );
}
