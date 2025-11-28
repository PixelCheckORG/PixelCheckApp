// Supabase Edge Function: verify-payment
// Verifica un pago cuando el usuario vuelve de Mercado Pago

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VerifyRequest {
  paymentId: string
  userId: string
  externalReference?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!MP_ACCESS_TOKEN) {
      throw new Error('MP_ACCESS_TOKEN not configured')
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    const { paymentId, userId, externalReference }: VerifyRequest = await req.json()

    if (!paymentId) {
      throw new Error('paymentId is required')
    }

    // Obtener detalles del pago desde Mercado Pago
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
      },
    })

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text()
      console.error('Error fetching payment:', errorText)
      throw new Error('Could not verify payment')
    }

    const payment = await mpResponse.json()
    console.log('Payment verification:', payment)

    const status = payment.status

    if (status !== 'approved') {
      return new Response(
        JSON.stringify({ success: false, status, message: 'Payment not approved' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Verificar que el pago pertenezca al usuario
    const paymentExternalRef = payment.external_reference
    if (paymentExternalRef && !paymentExternalRef.includes(userId)) {
      console.error('Payment does not belong to user')
      throw new Error('Payment verification failed')
    }

    // Actualizar pago en nuestra base de datos
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('mp_payment_id', paymentId.toString())
      .single()

    if (!existingPayment) {
      // Crear registro si no existe (por si el webhook falló)
      await supabase.from('payments').insert({
        user_id: userId,
        mp_payment_id: paymentId.toString(),
        amount: payment.transaction_amount,
        currency: payment.currency_id,
        status: 'approved',
        status_detail: payment.status_detail,
        payment_method: payment.payment_method_id,
        payment_type: payment.payment_type_id,
        external_reference: paymentExternalRef,
        paid_at: new Date().toISOString(),
      })
    }

    // Verificar si ya tiene suscripción activa
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .single()

    if (!existingSub) {
      // Activar suscripción premium
      const { data: paymentData } = await supabase
        .from('payments')
        .select('id')
        .eq('mp_payment_id', paymentId.toString())
        .single()

      if (paymentData) {
        const { error: rpcError } = await supabase.rpc('activate_premium_subscription', {
          p_user_id: userId,
          p_payment_id: paymentData.id,
          p_months: 1,
        })

        if (rpcError) {
          console.error('Error activating premium:', rpcError)
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, status: 'approved' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Verification error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
