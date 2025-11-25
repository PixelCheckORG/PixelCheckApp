-- ============================================
-- MIGRACIÓN: PixelCheck - Integración con API
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. Agregar nuevas columnas a image_analyses
ALTER TABLE image_analyses ADD COLUMN IF NOT EXISTS api_image_id TEXT;
ALTER TABLE image_analyses ADD COLUMN IF NOT EXISTS label TEXT;
ALTER TABLE image_analyses ADD COLUMN IF NOT EXISTS model_version TEXT DEFAULT 'v1';
ALTER TABLE image_analyses ADD COLUMN IF NOT EXISTS prob_ai DECIMAL(10,8);
ALTER TABLE image_analyses ADD COLUMN IF NOT EXISTS prob_real DECIMAL(10,8);
ALTER TABLE image_analyses ADD COLUMN IF NOT EXISTS threshold DECIMAL(3,2) DEFAULT 0.5;
ALTER TABLE image_analyses ADD COLUMN IF NOT EXISTS feature_scores JSONB DEFAULT '{
    "color_score": 0,
    "noise_score": 0,
    "symmetry_score": 0,
    "watermark_score": 0,
    "transparency_score": 0
}'::jsonb;
ALTER TABLE image_analyses ADD COLUMN IF NOT EXISTS observations JSONB DEFAULT '{
    "noise": "",
    "colors": "",
    "symmetry": "",
    "watermark": "",
    "transparency": ""
}'::jsonb;

-- 2. Migrar datos existentes (convertir clasificación antigua a nueva)
UPDATE image_analyses 
SET 
    label = CASE 
        WHEN classification = 'ai-generated' THEN 'AI' 
        WHEN classification = 'graphic-design' THEN 'AI'
        ELSE 'REAL' 
    END,
    prob_ai = COALESCE(probability_ai, probability, 0),
    prob_real = COALESCE(probability_real, 1 - COALESCE(probability, 0), 0),
    api_image_id = id::text,
    model_version = 'v1',
    threshold = 0.5,
    feature_scores = COALESCE(
        jsonb_build_object(
            'color_score', COALESCE((color_analysis->>'diversityScore')::decimal, 0),
            'noise_score', COALESCE((noise_analysis->>'noiseScore')::decimal, 0),
            'symmetry_score', COALESCE((symmetry_analysis->>'symmetryAiScore')::decimal, 0),
            'watermark_score', COALESCE((watermark_analysis->>'watermarkScore')::decimal, 0),
            'transparency_score', COALESCE((transparency_analysis->>'transparencyRatio')::decimal, 0)
        ),
        '{"color_score": 0, "noise_score": 0, "symmetry_score": 0, "watermark_score": 0, "transparency_score": 0}'::jsonb
    ),
    observations = '{"noise": "", "colors": "", "symmetry": "", "watermark": "", "transparency": ""}'::jsonb
WHERE api_image_id IS NULL OR label IS NULL;

-- 3. Hacer NOT NULL las columnas requeridas (después de migrar datos)
-- Solo ejecutar si todos los registros tienen datos
ALTER TABLE image_analyses ALTER COLUMN label SET NOT NULL;
ALTER TABLE image_analyses ALTER COLUMN api_image_id SET NOT NULL;
ALTER TABLE image_analyses ALTER COLUMN prob_ai SET NOT NULL;
ALTER TABLE image_analyses ALTER COLUMN prob_real SET NOT NULL;
ALTER TABLE image_analyses ALTER COLUMN feature_scores SET NOT NULL;
ALTER TABLE image_analyses ALTER COLUMN observations SET NOT NULL;

-- 4. Agregar constraint para label
ALTER TABLE image_analyses DROP CONSTRAINT IF EXISTS image_analyses_label_check;
ALTER TABLE image_analyses ADD CONSTRAINT image_analyses_label_check CHECK (label IN ('AI', 'REAL'));

-- 5. Actualizar constraint de confidence (ahora es decimal, no texto)
-- Primero eliminar el constraint antiguo si existe
ALTER TABLE image_analyses DROP CONSTRAINT IF EXISTS image_analyses_confidence_check;

-- Cambiar el tipo de columna de TEXT a DECIMAL
ALTER TABLE image_analyses ALTER COLUMN confidence TYPE DECIMAL(6,4) USING 
    CASE 
        WHEN confidence::text = 'high' THEN 0.9
        WHEN confidence::text = 'medium' THEN 0.7
        WHEN confidence::text = 'low' THEN 0.5
        WHEN confidence IS NULL THEN 0.5
        ELSE 
            CASE 
                WHEN confidence ~ '^[0-9.]+$' THEN confidence::decimal
                ELSE 0.5
            END
    END;

-- 6. Crear nuevos índices
CREATE INDEX IF NOT EXISTS idx_analyses_api_image_id ON image_analyses(api_image_id);
CREATE INDEX IF NOT EXISTS idx_analyses_label ON image_analyses(label);

-- 7. Eliminar columnas antiguas (OPCIONAL - ejecutar solo después de verificar que todo funciona)
-- ⚠️ CUIDADO: Esto eliminará datos permanentemente
-- Descomenta las siguientes líneas solo cuando estés seguro:

-- ALTER TABLE image_analyses DROP COLUMN IF EXISTS classification;
-- ALTER TABLE image_analyses DROP COLUMN IF EXISTS probability;
-- ALTER TABLE image_analyses DROP COLUMN IF EXISTS probability_ai;
-- ALTER TABLE image_analyses DROP COLUMN IF EXISTS probability_real;
-- ALTER TABLE image_analyses DROP COLUMN IF EXISTS probability_graphic;
-- ALTER TABLE image_analyses DROP COLUMN IF EXISTS color_analysis;
-- ALTER TABLE image_analyses DROP COLUMN IF EXISTS transparency_analysis;
-- ALTER TABLE image_analyses DROP COLUMN IF EXISTS noise_analysis;
-- ALTER TABLE image_analyses DROP COLUMN IF EXISTS watermark_analysis;
-- ALTER TABLE image_analyses DROP COLUMN IF EXISTS symmetry_analysis;
-- ALTER TABLE image_analyses DROP COLUMN IF EXISTS metadata_analysis;
-- ALTER TABLE image_analyses DROP COLUMN IF EXISTS ml_features;
-- ALTER TABLE image_analyses DROP COLUMN IF EXISTS image_width;
-- ALTER TABLE image_analyses DROP COLUMN IF EXISTS image_height;

-- También eliminar el constraint antiguo de classification
-- ALTER TABLE image_analyses DROP CONSTRAINT IF EXISTS image_analyses_classification_check;
-- ALTER TABLE image_analyses DROP CONSTRAINT IF EXISTS image_analyses_confidence_check;

-- ============================================
-- VERIFICACIÓN: Ejecutar después de la migración
-- ============================================

-- Ver estructura actual de la tabla
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'image_analyses' 
-- ORDER BY ordinal_position;

-- Ver algunos registros migrados
-- SELECT id, image_name, label, confidence, prob_ai, prob_real, api_image_id 
-- FROM image_analyses 
-- LIMIT 5;
