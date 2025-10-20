-- Guía Rápida de SQL para PixelCheck
-- Comandos útiles para administrar la base de datos

-- ============================================
-- CONSULTAS ÚTILES
-- ============================================

-- Ver todos los usuarios registrados
SELECT 
    id,
    email,
    subscription_tier,
    created_at
FROM user_profiles
ORDER BY created_at DESC;

-- Ver análisis recientes (últimos 10)
SELECT 
    id,
    user_id,
    image_name,
    classification,
    confidence,
    probability,
    created_at
FROM image_analyses
ORDER BY created_at DESC
LIMIT 10;

-- Ver estadísticas de clasificación
SELECT 
    classification,
    COUNT(*) as total,
    AVG(probability) as promedio_probabilidad
FROM image_analyses
GROUP BY classification
ORDER BY total DESC;

-- Ver usuarios con análisis guardados
SELECT 
    up.email,
    COUNT(ia.id) as total_analisis,
    up.subscription_tier
FROM user_profiles up
LEFT JOIN image_analyses ia ON up.id = ia.user_id
GROUP BY up.id, up.email, up.subscription_tier
ORDER BY total_analisis DESC;

-- Ver análisis de invitados (no registrados)
SELECT 
    session_id,
    COUNT(*) as total_analisis,
    MAX(created_at) as ultimo_analisis
FROM image_analyses
WHERE user_id IS NULL
GROUP BY session_id
ORDER BY ultimo_analisis DESC;

-- ============================================
-- MANTENIMIENTO
-- ============================================

-- Limpiar análisis antiguos de invitados (más de 24 horas)
SELECT cleanup_guest_analyses();

-- Ver cuántos análisis de invitados se eliminarían
SELECT COUNT(*) as analisis_a_eliminar
FROM image_analyses
WHERE user_id IS NULL 
AND session_id IS NOT NULL
AND created_at < NOW() - INTERVAL '24 hours';

-- Eliminar análisis específicos (reemplazar con ID real)
DELETE FROM image_analyses 
WHERE id = 'uuid-aqui';

-- ============================================
-- SUSCRIPCIONES
-- ============================================

-- Actualizar usuario a premium manualmente
UPDATE user_profiles
SET subscription_tier = 'premium',
    subscription_expires_at = NOW() + INTERVAL '30 days'
WHERE email = 'usuario@ejemplo.com';

-- Ver suscripciones activas
SELECT 
    up.email,
    s.plan_type,
    s.status,
    s.current_period_end
FROM subscriptions s
JOIN user_profiles up ON s.user_id = up.id
WHERE s.status = 'active'
ORDER BY s.current_period_end;

-- Cancelar suscripción manualmente
UPDATE subscriptions
SET status = 'cancelled',
    cancelled_at = NOW()
WHERE user_id = 'uuid-del-usuario';

-- Actualizar expiración de suscripción
UPDATE user_profiles
SET subscription_tier = 'free',
    subscription_expires_at = NULL
WHERE subscription_expires_at < NOW();

-- ============================================
-- ESTADÍSTICAS
-- ============================================

-- Análisis totales por día (últimos 7 días)
SELECT 
    DATE(created_at) as fecha,
    COUNT(*) as total_analisis
FROM image_analyses
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY fecha DESC;

-- Distribución de confianza
SELECT 
    confidence,
    COUNT(*) as total,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as porcentaje
FROM image_analyses
GROUP BY confidence
ORDER BY total DESC;

-- Usuarios más activos
SELECT 
    up.email,
    COUNT(ia.id) as total_analisis,
    MAX(ia.created_at) as ultimo_analisis
FROM user_profiles up
JOIN image_analyses ia ON up.id = ia.user_id
GROUP BY up.id, up.email
ORDER BY total_analisis DESC
LIMIT 10;

-- ============================================
-- STORAGE
-- ============================================

-- Ver tamaño total de storage usado (requiere permisos especiales)
-- Nota: Ejecutar desde el dashboard de Supabase > Storage

-- Listar archivos huérfanos (imágenes sin registro en BD)
-- Esto requiere consultar la tabla storage.objects y comparar con image_analyses

-- ============================================
-- BACKUP Y RESTORE
-- ============================================

-- Exportar análisis de un usuario específico
COPY (
    SELECT * FROM image_analyses 
    WHERE user_id = 'uuid-del-usuario'
) TO '/tmp/user_analyses_backup.csv' WITH CSV HEADER;

-- ============================================
-- TRIGGERS Y FUNCIONES
-- ============================================

-- Ver todos los triggers activos
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- Ver todas las funciones personalizadas
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%pixelcheck%' OR routine_name LIKE '%cleanup%';

-- ============================================
-- POLÍTICAS RLS
-- ============================================

-- Ver todas las políticas de seguridad
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public';

-- Desactivar RLS temporalmente (solo para desarrollo/testing)
-- ¡CUIDADO! Solo usar en desarrollo
-- ALTER TABLE image_analyses DISABLE ROW LEVEL SECURITY;

-- Reactivar RLS
-- ALTER TABLE image_analyses ENABLE ROW LEVEL SECURITY;

-- ============================================
-- MONITOREO
-- ============================================

-- Ver conexiones activas
SELECT 
    datname,
    usename,
    COUNT(*) as connections
FROM pg_stat_activity
WHERE datname IS NOT NULL
GROUP BY datname, usename;

-- Ver tamaño de las tablas
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Ver índices y su uso
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- ============================================
-- TESTING
-- ============================================

-- Crear usuario de prueba
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
VALUES (
    gen_random_uuid(),
    'test@ejemplo.com',
    crypt('password123', gen_salt('bf')),
    NOW()
);

-- Crear análisis de prueba
INSERT INTO image_analyses (
    user_id,
    image_url,
    image_name,
    image_size,
    image_width,
    image_height,
    classification,
    confidence,
    probability,
    color_analysis,
    transparency_analysis,
    noise_analysis,
    watermark_analysis,
    symmetry_analysis,
    metadata_analysis,
    ml_features,
    probability_real,
    probability_ai,
    probability_graphic
) VALUES (
    (SELECT id FROM user_profiles WHERE email = 'test@ejemplo.com'),
    'https://ejemplo.com/imagen.jpg',
    'test_image.jpg',
    1024000,
    1920,
    1080,
    'ai-generated',
    'high',
    0.85,
    '{"uniqueColors": 1000, "diversityScore": 0.7}',
    '{"transparencyRatio": 0.0, "hasSignificantTransparency": false}',
    '{"noiseScore": 0.2, "noiseLevel": "low"}',
    '{"watermarkScore": 0.3, "hasWatermark": false}',
    '{"horizontalSymmetry": 0.8, "verticalSymmetry": 0.7}',
    '{"basicMetadata": {"format": "image/jpeg"}}',
    ARRAY[0.7, 0.0, 0.2, 0.8, 0.3, 0],
    0.1,
    0.85,
    0.05
);

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

/*
1. Siempre haz backup antes de ejecutar comandos de eliminación masiva
2. Las políticas RLS protegen los datos - no las desactives en producción
3. La función cleanup_guest_analyses() debe ejecutarse regularmente
4. Monitorea el tamaño del storage regularmente
5. Revisa los logs de Supabase para detectar problemas
6. Considera implementar rate limiting para prevenir abuso
*/
