import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Crown, ArrowRight, Loader2 } from 'lucide-react';
import Header from '../components/layout/Header';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';

export default function PaymentSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuthStore();
    const [isVerifying, setIsVerifying] = useState(true);
    const [isVerified, setIsVerified] = useState(false);

    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const externalReference = searchParams.get('external_reference');

    useEffect(() => {
        const verifyPayment = async () => {
            if (!paymentId || !user) {
                setIsVerifying(false);
                return;
            }

            try {
                // Llamar a Edge Function para verificar y procesar el pago
                const { data, error } = await supabase.functions.invoke('verify-payment', {
                    body: {
                        paymentId,
                        userId: user.id,
                        externalReference,
                    },
                });

                if (error) {
                    console.error('Error verifying payment:', error);
                } else if (data?.success) {
                    setIsVerified(true);
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsVerifying(false);
            }
        };

        verifyPayment();
    }, [paymentId, user, externalReference]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Header />

            <main className="max-w-2xl mx-auto px-4 py-16">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center border border-gray-200 dark:border-gray-800">
                    {isVerifying ? (
                        <>
                            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-6" />
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Verificando tu pago...
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Por favor espera mientras confirmamos tu transacción
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-12 h-12 text-green-500" />
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                ¡Pago exitoso!
                            </h1>

                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Tu suscripción Premium ha sido activada correctamente
                            </p>

                            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8">
                                <div className="flex items-center justify-center gap-3 mb-2">
                                    <Crown className="w-8 h-8 text-yellow-500" />
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Premium Activo
                                    </span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Ahora tienes acceso a todas las funciones premium
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    Ir al Dashboard
                                    <ArrowRight className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full text-gray-600 dark:text-gray-400 py-3 px-4 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Analizar una imagen
                                </button>
                            </div>

                            {paymentId && (
                                <p className="mt-6 text-sm text-gray-500">
                                    ID de transacción: {paymentId}
                                </p>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
