-- PixelCheck Database Schema for Supabase
-- Este script configura todas las tablas necesarias para la aplicación

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
    subscription_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de análisis de imágenes
CREATE TABLE IF NOT EXISTS image_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID, -- Para usuarios no registrados
    image_url TEXT NOT NULL,
    image_name TEXT NOT NULL,
    image_size INTEGER,
    image_width INTEGER,
    image_height INTEGER,
    
    -- Resultados del análisis ML
    classification TEXT NOT NULL CHECK (classification IN ('real', 'ai-generated', 'graphic-design', 'uncertain')),
    confidence TEXT NOT NULL CHECK (confidence IN ('high', 'medium', 'low')),
    probability DECIMAL(5,4) NOT NULL,
    
    -- Análisis detallado (JSON)
    color_analysis JSONB,
    transparency_analysis JSONB,
    noise_analysis JSONB,
    watermark_analysis JSONB,
    symmetry_analysis JSONB,
    metadata_analysis JSONB,
    
    -- Características ML (array de números)
    ml_features DECIMAL[],
    
    -- Probabilidades de todas las clases
    probability_real DECIMAL(5,4),
    probability_ai DECIMAL(5,4),
    probability_graphic DECIMAL(5,4),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Índice para búsquedas rápidas
    CONSTRAINT analyses_user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- Tabla de pagos y suscripciones
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
    plan_type TEXT NOT NULL DEFAULT 'premium',
    amount DECIMAL(10,2) NOT NULL DEFAULT 8.00,
    currency TEXT NOT NULL DEFAULT 'USD',
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de uso (para limitar análisis en usuarios free)
CREATE TABLE IF NOT EXISTS usage_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID, -- Para usuarios no registrados
    analyses_count INTEGER DEFAULT 0,
    last_reset_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT usage_user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON image_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_session_id ON image_analyses(session_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON image_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_user_id ON usage_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_session_id ON usage_limits(session_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Función para crear perfil de usuario automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil cuando se registra un usuario
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Función para limpiar análisis de usuarios no registrados (más de 24 horas)
CREATE OR REPLACE FUNCTION cleanup_guest_analyses()
RETURNS void AS $$
BEGIN
    DELETE FROM image_analyses
    WHERE user_id IS NULL 
    AND session_id IS NOT NULL
    AND created_at < NOW() - INTERVAL '24 hours';
    
    DELETE FROM usage_limits
    WHERE user_id IS NULL 
    AND session_id IS NOT NULL
    AND created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Políticas de seguridad (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;

-- Políticas para user_profiles
CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- Políticas para image_analyses
CREATE POLICY "Users can view their own analyses"
    ON image_analyses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert analyses"
    ON image_analyses FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can delete their own analyses"
    ON image_analyses FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para subscriptions
CREATE POLICY "Users can view their own subscriptions"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Políticas para usage_limits
CREATE POLICY "Users can view their own usage"
    ON usage_limits FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert usage records"
    ON usage_limits FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can update usage records"
    ON usage_limits FOR UPDATE
    USING (true);

-- Storage bucket para imágenes
INSERT INTO storage.buckets (id, name, public)
VALUES ('image-analyses', 'image-analyses', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage
CREATE POLICY "Anyone can upload images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'image-analyses');

CREATE POLICY "Anyone can view images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'image-analyses');

CREATE POLICY "Users can delete their own images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'image-analyses' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Crear un cron job para limpiar análisis de invitados (requiere extensión pg_cron)
-- Esto se debe configurar desde el dashboard de Supabase o ejecutar manualmente
-- SELECT cron.schedule('cleanup-guest-analyses', '0 2 * * *', 'SELECT cleanup_guest_analyses()');
