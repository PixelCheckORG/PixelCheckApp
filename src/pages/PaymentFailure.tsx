import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Header from '../components/layout/Header';

export default function PaymentFailure() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const status = searchParams.get('status');
    const paymentId = searchParams.get('payment_id');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Header />

            <main className="max-w-2xl mx-auto px-4 py-16">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center border border-gray-200 dark:border-gray-800">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-12 h-12 text-red-500" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Pago no completado
                    </h1>

                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {status === 'rejected' 
                            ? 'Tu pago fue rechazado. Por favor verifica los datos de tu tarjeta e intenta de nuevo.'
                            : 'El proceso de pago fue cancelado o no se pudo completar.'
                        }
                    </p>

                    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 mb-8">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Posibles razones:</strong>
                        </p>
                        <ul className="text-sm text-gray-500 dark:text-gray-500 mt-2 space-y-1">
                            <li>• Fondos insuficientes</li>
                            <li>• Datos de tarjeta incorrectos</li>
                            <li>• Límite de tarjeta excedido</li>
                            <li>• Pago cancelado por el usuario</li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/pricing')}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Intentar de nuevo
                        </button>

                        <button
                            onClick={() => navigate('/')}
                            className="w-full text-gray-600 dark:text-gray-400 py-3 px-4 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Volver al inicio
                        </button>
                    </div>

                    {paymentId && (
                        <p className="mt-6 text-sm text-gray-500">
                            Referencia: {paymentId}
                        </p>
                    )}

                    <p className="mt-6 text-sm text-gray-500">
                        ¿Necesitas ayuda?{' '}
                        <a href="mailto:support@pixelcheck.app" className="text-blue-600 hover:underline">
                            Contáctanos
                        </a>
                    </p>
                </div>
            </main>
        </div>
    );
}
