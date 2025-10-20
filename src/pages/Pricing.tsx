import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { useAuthStore } from '../store/useAuthStore';

export default function Pricing() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        if (!user) {
            alert('Por favor inicia sesión para suscribirte');
            return;
        }

        setLoading(true);
        
        // Aquí integrarías Stripe para el pago
        alert('Próximamente: integración con Stripe para pagos');
        
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Planes y Precios
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Elige el plan que mejor se adapte a tus necesidades
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Plan Gratuito */}
                    <div className="bg-white rounded-lg shadow-md p-8 border-2 border-gray-200">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Gratis</h3>
                            <div className="text-4xl font-bold text-gray-900 mb-2">
                                $0
                                <span className="text-lg font-normal text-gray-600">/mes</span>
                            </div>
                            <p className="text-gray-600">Para usuarios ocasionales</p>
                        </div>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start">
                                <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-gray-700">Análisis de imágenes individuales</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-gray-700">Resultados básicos</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span className="text-gray-500">No se guardan los análisis</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span className="text-gray-500">Sin exportación de datos</span>
                            </li>
                        </ul>

                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                        >
                            Usar Gratis
                        </button>
                    </div>

                    {/* Plan Premium */}
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-xl p-8 text-white border-2 border-blue-400 relative">
                        <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 px-4 py-1 rounded-bl-lg rounded-tr-lg font-bold text-sm">
                            RECOMENDADO
                        </div>
                        
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold mb-2">Premium</h3>
                            <div className="text-4xl font-bold mb-2">
                                $8
                                <span className="text-lg font-normal">/mes</span>
                            </div>
                            <p className="text-blue-100">Para usuarios profesionales</p>
                        </div>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start">
                                <svg className="w-6 h-6 text-yellow-300 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Análisis ilimitados</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-6 h-6 text-yellow-300 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Historial completo guardado</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-6 h-6 text-yellow-300 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Análisis detallado avanzado</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-6 h-6 text-yellow-300 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Exportar resultados (CSV/PDF)</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-6 h-6 text-yellow-300 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Análisis por lotes (múltiples imágenes)</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-6 h-6 text-yellow-300 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Soporte prioritario</span>
                            </li>
                        </ul>

                        <button
                            onClick={handleSubscribe}
                            disabled={loading}
                            className="w-full bg-white text-blue-600 py-3 rounded-lg hover:bg-gray-100 transition-colors font-bold text-lg disabled:opacity-50"
                        >
                            {loading ? 'Procesando...' : 'Suscribirse Ahora'}
                        </button>
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Preguntas Frecuentes</h3>
                    
                    <div className="max-w-3xl mx-auto space-y-6">
                        <div className="bg-white rounded-lg shadow-md p-6 text-left">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                ¿Puedo cancelar mi suscripción en cualquier momento?
                            </h4>
                            <p className="text-gray-600">
                                Sí, puedes cancelar tu suscripción en cualquier momento. Tu plan seguirá activo 
                                hasta el final del período de facturación actual.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6 text-left">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                ¿Qué métodos de pago aceptan?
                            </h4>
                            <p className="text-gray-600">
                                Aceptamos todas las tarjetas de crédito y débito principales a través de Stripe.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6 text-left">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                ¿Los análisis son precisos?
                            </h4>
                            <p className="text-gray-600">
                                Nuestro sistema utiliza algoritmos de ML avanzados con alta precisión, pero siempre 
                                recomendamos usar los resultados como orientación, no como verdad absoluta.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
