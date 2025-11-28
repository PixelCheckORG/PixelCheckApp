import { useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, ArrowLeft, RefreshCw } from 'lucide-react';
import Header from '../components/layout/Header';

export default function PaymentPending() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const paymentId = searchParams.get('payment_id');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Header />

            <main className="max-w-2xl mx-auto px-4 py-16">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center border border-gray-200 dark:border-gray-800">
                    <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-12 h-12 text-yellow-500" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Pago pendiente
                    </h1>

                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Tu pago está siendo procesado. Esto puede tomar unos minutos.
                    </p>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-8">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            <strong>¿Qué significa esto?</strong>
                        </p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                            Si elegiste pagar con transferencia bancaria, efectivo (OXXO, Rapipago, etc.) 
                            o algún otro método offline, el pago puede tardar en ser confirmado.
                        </p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                            Una vez que se confirme el pago, tu cuenta será actualizada automáticamente 
                            a Premium.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                            Ir al Dashboard
                        </button>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Verificar estado
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
                            ID de transacción: {paymentId}
                        </p>
                    )}

                    <p className="mt-6 text-sm text-gray-500">
                        Te enviaremos un email cuando se confirme tu pago.
                    </p>
                </div>
            </main>
        </div>
    );
}
