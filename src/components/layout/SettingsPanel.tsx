import { X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
    const { user } = useAuthStore();

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-xl z-50 overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Configuración</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    {/* General */}
                    <div className="mb-8">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                            General
                        </h3>
                        <div className="space-y-3">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Nombre completo</p>
                                        <p className="text-sm text-gray-500 mt-1">Michael</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">¿Cómo quieres que te llame?</p>
                                        <p className="text-sm text-gray-500 mt-1">Michael</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cuenta */}
                    <div className="mb-8">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                            Cuenta
                        </h3>
                        <div className="space-y-3">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Correo electrónico</p>
                                        <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Plan</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {user?.subscription_tier === 'premium' ? 'Premium' : 'Gratuito'}
                                        </p>
                                    </div>
                                    {user?.subscription_tier === 'free' && (
                                        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                            Actualizar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Apariencia */}
                    <div className="mb-8">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                            Apariencia
                        </h3>
                        <div className="space-y-3">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium text-gray-900 mb-3">Tema</p>
                                <div className="grid grid-cols-3 gap-2">
                                    <button className="p-3 border-2 border-blue-600 rounded-lg bg-white">
                                        <div className="w-full h-8 bg-white border border-gray-200 rounded mb-2"></div>
                                        <p className="text-xs font-medium text-gray-900">Claro</p>
                                    </button>
                                    <button className="p-3 border-2 border-transparent hover:border-gray-300 rounded-lg bg-white">
                                        <div className="w-full h-8 bg-gray-900 rounded mb-2"></div>
                                        <p className="text-xs font-medium text-gray-900">Oscuro</p>
                                    </button>
                                    <button className="p-3 border-2 border-transparent hover:border-gray-300 rounded-lg bg-white">
                                        <div className="w-full h-8 bg-gradient-to-r from-white to-gray-900 rounded mb-2"></div>
                                        <p className="text-xs font-medium text-gray-900">Sistema</p>
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Idioma</p>
                                        <p className="text-sm text-gray-500 mt-1">Español</p>
                                    </div>
                                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                        Cambiar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notificaciones */}
                    <div className="mb-8">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                            Notificaciones
                        </h3>
                        <div className="space-y-3">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Notificaciones por email</p>
                                        <p className="text-sm text-gray-500 mt-1">Recibe actualizaciones importantes</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Privacidad */}
                    <div className="mb-8">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                            Privacidad y Seguridad
                        </h3>
                        <div className="space-y-3">
                            <button className="w-full p-4 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors">
                                <p className="text-sm font-medium text-gray-900">Cambiar contraseña</p>
                            </button>
                            <button className="w-full p-4 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors">
                                <p className="text-sm font-medium text-gray-900">Privacidad de datos</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
