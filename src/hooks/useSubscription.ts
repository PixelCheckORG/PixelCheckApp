import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { mercadoPagoService } from '../lib/mercadopago';
import { supabase } from '../lib/supabase';

interface Subscription {
  id: string;
  status: 'active' | 'cancelled' | 'expired';
  plan_type: string;
  starts_at: string;
  expires_at: string;
  payments?: {
    amount: number;
    currency: string;
    paid_at: string;
    payment_method: string;
  };
}

interface UseSubscriptionReturn {
  isPremium: boolean;
  subscription: Subscription | null;
  isLoading: boolean;
  daysRemaining: number | null;
  checkoutUrl: string | null;
  isCreatingCheckout: boolean;
  createCheckout: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const { user } = useAuthStore();
  const [isPremium, setIsPremium] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setIsPremium(false);
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Verificar estado premium
      const premium = await mercadoPagoService.checkPremiumStatus(user.id);
      setIsPremium(premium);

      // Obtener detalles de la suscripción
      if (premium) {
        const sub = await mercadoPagoService.getSubscription(user.id);
        setSubscription(sub);
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setIsPremium(false);
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Cargar suscripción al montar o cuando cambie el usuario
  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refrescar cuando haya cambios
          fetchSubscription();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchSubscription]);

  // Calcular días restantes
  const daysRemaining = subscription?.expires_at
    ? Math.max(0, Math.ceil(
        (new Date(subscription.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ))
    : null;

  // Crear checkout de Mercado Pago
  const createCheckout = useCallback(async () => {
    if (!user?.email) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setIsCreatingCheckout(true);
      const url = await mercadoPagoService.getCheckoutUrl(user.id, user.email);
      setCheckoutUrl(url);
      
      // Redirigir al checkout de Mercado Pago
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout:', error);
      throw error;
    } finally {
      setIsCreatingCheckout(false);
    }
  }, [user]);

  return {
    isPremium,
    subscription,
    isLoading,
    daysRemaining,
    checkoutUrl,
    isCreatingCheckout,
    createCheckout,
    refreshSubscription: fetchSubscription,
  };
}
