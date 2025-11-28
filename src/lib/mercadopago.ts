// Servicio de Mercado Pago para PixelCheck
import { supabase } from './supabase';

const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY;

export interface PaymentPreference {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

export interface PaymentStatus {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'refunded' | 'cancelled';
  status_detail: string;
  payment_method: string;
  amount: number;
}

class MercadoPagoService {
  constructor() {
    // Public key disponible para uso futuro si se necesita SDK de MP
    // const publicKey = MP_PUBLIC_KEY || '';
  }

  /**
   * Crea una preferencia de pago en Mercado Pago
   * Llama a una Supabase Edge Function que maneja el Access Token de forma segura
   */
  async createPaymentPreference(userId: string, userEmail: string): Promise<PaymentPreference> {
    // Llamar a la Edge Function de Supabase
    const { data, error } = await supabase.functions.invoke('create-payment', {
      body: {
        userId,
        userEmail,
        amount: 8.00,
        currency: 'USD',
        description: 'PixelCheck Premium - 1 Mes',
      },
    });

    if (error) {
      console.error('Error creating payment preference:', error);
      throw new Error('No se pudo crear la preferencia de pago');
    }

    return data as PaymentPreference;
  }

  /**
   * Verifica el estado de un pago
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatus | null> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('mp_payment_id', paymentId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.mp_payment_id,
      status: data.status,
      status_detail: data.status_detail,
      payment_method: data.payment_method,
      amount: data.amount,
    };
  }

  /**
   * Obtiene la URL de pago para redirigir al usuario
   */
  async getCheckoutUrl(userId: string, userEmail: string): Promise<string> {
    const preference = await this.createPaymentPreference(userId, userEmail);
    
    // En producción usar init_point, en desarrollo sandbox_init_point
    const isProduction = import.meta.env.PROD;
    return isProduction ? preference.init_point : preference.sandbox_init_point;
  }

  /**
   * Verifica si el usuario tiene suscripción premium activa
   */
  async checkPremiumStatus(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return false;
    }

    return true;
  }

  /**
   * Obtiene los detalles de la suscripción del usuario
   */
  async getSubscription(userId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        payments (
          amount,
          currency,
          paid_at,
          payment_method
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  /**
   * Obtiene el historial de pagos del usuario
   */
  async getPaymentHistory(userId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return [];
    }

    return data;
  }
}

export const mercadoPagoService = new MercadoPagoService();
export default mercadoPagoService;
