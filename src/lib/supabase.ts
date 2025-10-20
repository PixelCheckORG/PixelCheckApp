import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types para las tablas de Supabase
export interface Analysis {
    id: string
    user_id: string | null
    image_url: string
    image_name: string
    classification: 'real' | 'ai-generated' | 'graphic-design' | 'uncertain'
    confidence: 'high' | 'medium' | 'low'
    probability: number
    features: Record<string, any>
    created_at: string
}

export interface UserProfile {
    id: string
    email: string
    subscription_tier: 'free' | 'premium'
    subscription_expires_at: string | null
    created_at: string
}