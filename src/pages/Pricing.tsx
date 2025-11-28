import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Crown, Zap, Shield, Infinity, Loader2, CreditCard } from 'lucide-react';
import Header from '../components/layout/Header';
import { useAuthStore } from '../store/useAuthStore';
import { useSubscription } from '../hooks/useSubscription';

export default function Pricing() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { isPremium, subscription, daysRemaining, createCheckout, isCreatingCheckout } = useSubscription();
    const [error, setError] = useState<string | null>(null);

    const handleSubscribe = async () => {
        if (!user) {
            navigate('/login', { state: { from: '/pricing' } });
            return;
        }

        try {
            setError(null);
            await createCheckout();
        } catch (err) {
            setError('Error al procesar el pago. Por favor intenta de nuevo.');
            console.error(err);
        }
    };

    const features = {
        free: [
            { text: '5 análisis por día', included: true },
            { text: 'Resultados básicos (AI/Real)', included: true },
            { text: 'Historial limitado (7 días)', included: true },
            { text: 'Análisis detallado con features', included: false },
            { text: 'Exportar reportes PDF', included: false },
            { text: 'Análisis por lotes', included: false },
            { text: 'Soporte prioritario', included: false },
        ],
        premium: [
            { text: 'Análisis ilimitados', included: true },
            { text: 'Resultados completos con confianza', included: true },
            { text: 'Historial ilimitado', included: true },
            { text: 'Análisis detallado con features', included: true },
            { text: 'Exportar reportes PDF', included: true },
            { text: 'Análisis por lotes', included: true },
            { text: 'Soporte prioritario', included: true },
        ],
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
            <Header />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Elige tu plan
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Detecta imágenes generadas por IA con la tecnología más avanzada
                    </p>
                </div>

                {/* Mostrar estado actual si es premium */}
                {isPremium && subscription && (
                    <div className="max-w-md mx-auto mb-8 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Crown className="w-6 h-6 text-yellow-500" />
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    ¡Eres Premium!
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Tu suscripción vence en {daysRemaining} días
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Plan */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-8">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Free
                            </h2>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-5xl font-bold text-gray-900 dark:text-white">$0</span>
                                <span className="text-gray-500">/mes</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Perfecto para empezar
                            </p>
                        </div>

                        <ul className="space-y-4 mb-8">
                            {features.free.map((feature, index) => (
                                <li key={index} className="flex items-center gap-3">
                                    {feature.included ? (
                                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                                    )}
                                    <span className={feature.included 
                                        ? 'text-gray-700 dark:text-gray-300' 
                                        : 'text-gray-400 dark:text-gray-600'
                                    }>
                                        {feature.text}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => navigate('/')}
                            className="w-full py-3 px-4 rounded-xl border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            Usar Gratis
                        </button>
                    </div>

                    {/* Premium Plan */}
                    <div className="relative bg-gradient-to-b from-blue-600 to-blue-700 rounded-2xl shadow-xl p-8 text-white">
                        {/* Badge */}
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                            <span className="bg-yellow-500 text-yellow-900 text-sm font-bold px-4 py-1 rounded-full flex items-center gap-1">
                                <Zap className="w-4 h-4" />
                                POPULAR
                            </span>
                        </div>

                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                                <Crown className="w-6 h-6 text-yellow-400" />
                                Premium
                            </h2>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-5xl font-bold">$8</span>
                                <span className="text-blue-200">/mes</span>
                            </div>
                            <p className="text-blue-100 mt-2">
                                Para profesionales y creadores
                            </p>
                        </div>

                        <ul className="space-y-4 mb-8">
                            {features.premium.map((feature, index) => (
                                <li key={index} className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                                    <span className="text-white">{feature.text}</span>
                                </li>
                            ))}
                        </ul>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleSubscribe}
                            disabled={isPremium || isCreatingCheckout}
                            className={`w-full py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                                isPremium
                                    ? 'bg-white/20 cursor-not-allowed'
                                    : 'bg-white text-blue-600 hover:bg-blue-50 hover:scale-105'
                            }`}
                        >
                            {isCreatingCheckout ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Procesando...
                                </>
                            ) : isPremium ? (
                                <>
                                    <Check className="w-5 h-5" />
                                    Ya eres Premium
                                </>
                            ) : (
                                <>
                                    <CreditCard className="w-5 h-5" />
                                    Pagar con Mercado Pago
                                </>
                            )}
                        </button>

                        {/* Trust badges */}
                        <div className="mt-6 flex items-center justify-center gap-4 text-blue-200 text-sm">
                            <div className="flex items-center gap-1">
                                <Shield className="w-4 h-4" />
                                Pago seguro
                            </div>
                            <div className="flex items-center gap-1">
                                <Infinity className="w-4 h-4" />
                                Cancela cuando quieras
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ */}
                <div className="mt-16 text-center">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Preguntas Frecuentes
                    </h3>
                    
                    <div className="max-w-3xl mx-auto space-y-4">
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 text-left border border-gray-200 dark:border-gray-800">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                ¿Puedo cancelar mi suscripción en cualquier momento?
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400">
                                Sí, puedes cancelar tu suscripción en cualquier momento. Tu plan seguirá activo 
                                hasta el final del período de facturación actual.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 text-left border border-gray-200 dark:border-gray-800">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                ¿Qué métodos de pago aceptan?
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400">
                                Aceptamos tarjetas de crédito, débito, transferencia bancaria y otros métodos 
                                disponibles en Mercado Pago según tu país.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 text-left border border-gray-200 dark:border-gray-800">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                ¿Los análisis son precisos?
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400">
                                Nuestro sistema utiliza modelos de IA avanzados con alta precisión, pero siempre 
                                recomendamos usar los resultados como orientación, no como verdad absoluta.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contact */}
                <div className="mt-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                        ¿Tienes preguntas? Contáctanos en{' '}
                        <a href="mailto:support@pixelcheck.app" className="text-blue-600 hover:underline">
                            support@pixelcheck.app
                        </a>
                    </p>
                </div>
            </main>
        </div>
    );
}
