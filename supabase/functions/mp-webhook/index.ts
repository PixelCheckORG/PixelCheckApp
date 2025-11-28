// Supabase Edge Function: mp-webhook
// Recibe notificaciones de Mercado Pago (IPN)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Obtener datos del webhook
    const url = new URL(req.url)
    const topic = url.searchParams.get('topic') || url.searchParams.get('type')
    const id = url.searchParams.get('id') || url.searchParams.get('data.id')

    // También puede venir en el body
    let body: any = {}
    try {
      body = await req.json()
    } catch {
      // Body vacío o no JSON
    }

    const paymentId = id || body?.data?.id
    const eventType = topic || body?.type || body?.action

    console.log('Webhook received:', { eventType, paymentId, body })

    // Guardar evento en webhook_events para debugging
    await supabase.from('webhook_events').insert({
      event_type: eventType || 'unknown',
      event_id: paymentId,
      payload: body,
      processed: false,
    })

    // Solo procesar eventos de pago
    if (eventType === 'payment' || eventType === 'payment.created' || eventType === 'payment.updated') {
      if (!paymentId) {
        console.log('No payment ID found')
        return new Response('OK', { status: 200, headers: corsHeaders })
      }

      // Obtener detalles del pago desde Mercado Pago
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        },
      })

      if (!mpResponse.ok) {
        console.error('Error fetching payment from MP:', await mpResponse.text())
        return new Response('OK', { status: 200, headers: corsHeaders })
      }

      const payment = await mpResponse.json()
      console.log('Payment details:', payment)

      const externalReference = payment.external_reference
      const status = payment.status // approved, pending, rejected, etc.

      // Actualizar pago en nuestra base de datos
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          mp_payment_id: paymentId.toString(),
          status: status === 'approved' ? 'approved' : 
                  status === 'pending' || status === 'in_process' ? 'pending' :
                  status === 'rejected' ? 'rejected' : 
                  status === 'refunded' ? 'refunded' : 'cancelled',
          status_detail: payment.status_detail,
          payment_method: payment.payment_method_id,
          payment_type: payment.payment_type_id,
          paid_at: status === 'approved' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('external_reference', externalReference)

      if (updateError) {
        console.error('Error updating payment:', updateError)
      }

      // Si el pago fue aprobado, activar suscripción premium
      if (status === 'approved') {
        // Obtener el user_id del pago
        const { data: paymentData } = await supabase
          .from('payments')
          .select('id, user_id')
          .eq('external_reference', externalReference)
          .single()

        if (paymentData) {
          // Llamar función para activar premium
          const { error: rpcError } = await supabase.rpc('activate_premium_subscription', {
            p_user_id: paymentData.user_id,
            p_payment_id: paymentData.id,
            p_months: 1,
          })

          if (rpcError) {
            console.error('Error activating premium:', rpcError)
          } else {
            console.log('Premium activated for user:', paymentData.user_id)
          }
        }
      }

      // Marcar evento como procesado
      await supabase
        .from('webhook_events')
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq('event_id', paymentId)
    }

    return new Response('OK', { status: 200, headers: corsHeaders })
  } catch (error) {
    console.error('Webhook error:', error)
    // Siempre responder 200 para que MP no reintente
    return new Response('OK', { status: 200, headers: corsHeaders })
  }
})
