import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/useAuthStore'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Pricing from './pages/Pricing'
import Login from './pages/Login'
import Register from './pages/Register'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentFailure from './pages/PaymentFailure'
import PaymentPending from './pages/PaymentPending'
import { Toaster } from 'react-hot-toast'

function App() {
    const { user, isLoading } = useAuthStore()

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <ThemeProvider>
            <LanguageProvider>
                <BrowserRouter>
                    <Toaster position="top-right" />
                    <Routes>
                        <Route
                            path="/"
                            element={user ? <Navigate to="/dashboard" replace /> : <Home />}
                        />
                        <Route
                            path="/login"
                            element={user ? <Navigate to="/dashboard" replace /> : <Login />}
                        />
                        <Route
                            path="/register"
                            element={user ? <Navigate to="/dashboard" replace /> : <Register />}
                        />
                        <Route
                            path="/dashboard"
                            element={user ? <Dashboard /> : <Navigate to="/login" replace />}
                        />
                        <Route path="/pricing" element={<Pricing />} />
                        {/* Payment result pages */}
                        <Route path="/payment/success" element={<PaymentSuccess />} />
                        <Route path="/payment/failure" element={<PaymentFailure />} />
                        <Route path="/payment/pending" element={<PaymentPending />} />
                    </Routes>
                </BrowserRouter>
            </LanguageProvider>
        </ThemeProvider>
    )
}

export default App