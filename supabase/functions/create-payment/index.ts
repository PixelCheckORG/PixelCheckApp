// Supabase Edge Function: create-payment
// Crea una preferencia de pago en Mercado Pago

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentRequest {
  userId: string
  userEmail: string
  amount: number
  currency: string
  description: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const APP_URL = Deno.env.get('APP_URL') || 'https://pixelcheckpreview.netlify.app'

    if (!MP_ACCESS_TOKEN) {
      throw new Error('MP_ACCESS_TOKEN not configured')
    }

    const { userId, userEmail, amount, currency, description }: PaymentRequest = await req.json()

    if (!userId || !userEmail) {
      throw new Error('userId and userEmail are required')
    }

    // Crear cliente de Supabase con service role
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Generar referencia externa única
    const externalReference = `pixelcheck_${userId}_${Date.now()}`

    // Crear preferencia en Mercado Pago
    const preference = {
      items: [
        {
          id: 'premium-monthly',
          title: 'PixelCheck Premium - 1 Mes',
          description: description || 'Suscripción mensual a PixelCheck Premium',
          quantity: 1,
          currency_id: currency || 'USD',
          unit_price: amount || 8.00,
        },
      ],
      payer: {
        email: userEmail,
      },
      back_urls: {
        success: `${APP_URL}/payment/success`,
        failure: `${APP_URL}/payment/failure`,
        pending: `${APP_URL}/payment/pending`,
      },
      auto_return: 'approved',
      external_reference: externalReference,
      notification_url: `${SUPABASE_URL}/functions/v1/mp-webhook`,
      statement_descriptor: 'PIXELCHECK',
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
    }

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    })

    if (!mpResponse.ok) {
      const error = await mpResponse.text()
      console.error('Mercado Pago error:', error)
      throw new Error(`Mercado Pago API error: ${mpResponse.status}`)
    }

    const mpData = await mpResponse.json()

    // Guardar registro de pago pendiente en Supabase
    const { error: insertError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        mp_preference_id: mpData.id,
        amount: amount || 8.00,
        currency: currency || 'USD',
        status: 'pending',
        description: description || 'PixelCheck Premium - 1 Mes',
        external_reference: externalReference,
      })

    if (insertError) {
      console.error('Error inserting payment:', insertError)
    }

    return new Response(
      JSON.stringify({
        id: mpData.id,
        init_point: mpData.init_point,
        sandbox_init_point: mpData.sandbox_init_point,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
