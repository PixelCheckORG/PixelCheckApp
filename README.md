# PixelCheck - Detector de Imágenes Generadas por IA

Aplicación web para detectar imágenes generadas por IA utilizando Machine Learning.

## 🚀 Características

### Para Usuarios No Registrados (Invitados)
- ✅ Subir y analizar una imagen
- ✅ Ver resultados del análisis
- ✅ Los datos se eliminan al cerrar la sesión o después de 24 horas
- ❌ No se guardan los análisis
- ❌ Sin historial

### Para Usuarios Registrados (Gratis)
- ✅ Todas las características de invitados
- ✅ Historial de análisis guardados
- ✅ Ver análisis previos desde el sidebar
- ✅ Botón "Nueva Imagen" para múltiples análisis
- ✅ Persistencia de datos

### Para Usuarios Premium ($8/mes)
- ✅ Todas las características de usuarios registrados
- ✅ Análisis ilimitados
- ✅ Exportar resultados a CSV
- ✅ Exportar resultados a PDF (próximamente)
- ✅ Análisis por lotes (próximamente)
- ✅ Soporte prioritario

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Cuenta en Supabase (https://supabase.com)
- Git

## 🔧 Configuración

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd PixelCheckApp
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Supabase

#### 3.1 Crear un Proyecto en Supabase

1. Ve a https://supabase.com
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Espera a que el proyecto se inicialice

#### 3.2 Configurar la Base de Datos

1. En el dashboard de Supabase, ve a **SQL Editor**
2. Copia todo el contenido del archivo `supabase-schema.sql`
3. Pégalo en el editor SQL
4. Ejecuta el script haciendo clic en "Run"

Esto creará:
- ✅ Tablas: `user_profiles`, `image_analyses`, `subscriptions`, `usage_limits`
- ✅ Políticas de seguridad (Row Level Security)
- ✅ Storage bucket para imágenes
- ✅ Triggers automáticos
- ✅ Funciones de limpieza

#### 3.3 Configurar Variables de Entorno

1. En el dashboard de Supabase, ve a **Settings** > **API**
2. Copia la `URL` del proyecto y la `anon public` key
3. Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_supabase_url_aqui
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key_aqui
```

### 4. Ejecutar la Aplicación

#### Modo Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

#### Modo Producción

```bash
npm run build
npm run preview
```

## 📁 Estructura del Proyecto

```
PixelCheckApp/
├── src/
│   ├── components/
│   │   ├── analysis/          # Componentes de resultados
│   │   │   ├── AnalysisResults.tsx
│   │   │   └── DetailedAnalysis.tsx
│   │   ├── auth/              # Componentes de autenticación
│   │   │   ├── LoginModal.tsx
│   │   │   └── RegisterModal.tsx
│   │   ├── layout/            # Componentes de layout
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   └── upload/            # Componente de carga
│   │       └── ImageUploader.tsx
│   ├── lib/
│   │   ├── analyzer/          # Lógica de análisis ML
│   │   │   ├── index.ts
│   │   │   └── utils.ts
│   │   └── supabase.ts        # Cliente de Supabase
│   ├── pages/                 # Páginas principales
│   │   ├── Home.tsx           # Página de inicio (invitados)
│   │   ├── Dashboard.tsx      # Dashboard (usuarios registrados)
│   │   └── Pricing.tsx        # Página de precios
│   ├── store/
│   │   └── useAuthStore.ts    # Store de autenticación (Zustand)
│   ├── types/
│   │   └── index.ts           # Tipos TypeScript
│   ├── styles/
│   │   └── index.css          # Estilos globales
│   ├── App.tsx                # Componente principal
│   └── main.tsx               # Punto de entrada
├── supabase-schema.sql        # Schema de la base de datos
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🗄️ Schema de Base de Datos

### Tablas Principales

#### `user_profiles`
Almacena información de los usuarios registrados.
- `id`: UUID (referencia a auth.users)
- `email`: Email del usuario
- `subscription_tier`: 'free' | 'premium'
- `subscription_expires_at`: Fecha de expiración (nullable)
- `created_at`: Fecha de creación

#### `image_analyses`
Almacena todos los análisis de imágenes.
- `id`: UUID único
- `user_id`: UUID del usuario (nullable para invitados)
- `session_id`: UUID de sesión (para invitados)
- `image_url`: URL de la imagen en Storage
- `image_name`: Nombre del archivo
- `classification`: 'real' | 'ai-generated' | 'graphic-design' | 'uncertain'
- `confidence`: 'high' | 'medium' | 'low'
- `probability`: Número decimal
- Análisis detallados (JSONB): color, transparencia, ruido, watermark, simetría
- `ml_features`: Array de características ML
- `created_at`: Fecha de análisis

#### `subscriptions`
Gestiona las suscripciones de pago.
- `id`: UUID único
- `user_id`: UUID del usuario
- `stripe_subscription_id`: ID de Stripe
- `status`: 'active' | 'cancelled' | 'expired' | 'pending'
- `amount`: Precio (8.00)
- `current_period_end`: Fecha de finalización

#### `usage_limits`
Controla los límites de uso.
- `id`: UUID único
- `user_id`: UUID del usuario (nullable)
- `session_id`: UUID de sesión (nullable)
- `analyses_count`: Contador de análisis
- `last_reset_at`: Última fecha de reseteo

## 🔐 Seguridad

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con políticas que garantizan:

1. **user_profiles**: Los usuarios solo pueden ver y editar su propio perfil
2. **image_analyses**: Los usuarios solo pueden ver sus propios análisis
3. **subscriptions**: Los usuarios solo pueden ver sus propias suscripciones
4. **Storage**: Los usuarios solo pueden eliminar sus propias imágenes

### Limpieza Automática

Se incluye una función `cleanup_guest_analyses()` que elimina:
- Análisis de invitados mayores a 24 horas
- Registros de uso de invitados antiguos

Para ejecutar automáticamente, configura un cron job en Supabase:

```sql
SELECT cron.schedule(
  'cleanup-guest-analyses', 
  '0 2 * * *', 
  'SELECT cleanup_guest_analyses()'
);
```

## 🎨 Flujo de Usuario

### Usuario Invitado (No Registrado)
1. Entra a la página principal
2. Sube una imagen
3. Ve el análisis
4. Si cierra la web o recarga, pierde los datos
5. Los datos se eliminan automáticamente después de 24 horas

### Usuario Registrado
1. Se registra/inicia sesión
2. Accede al Dashboard
3. Ve el botón "Nueva Imagen" (+) en el sidebar
4. Sube y analiza imágenes
5. Los análisis se guardan en el sidebar con fecha
6. Puede hacer clic en análisis previos para verlos
7. Cada análisis muestra:
   - Icono según clasificación (✅ real, 🤖 IA, 🎨 diseño)
   - Fecha y hora
   - Nivel de confianza

### Usuario Premium
1. Todo lo anterior
2. Puede exportar resultados a CSV
3. Botón "Exportar CSV" en la parte superior del análisis
4. El CSV incluye todos los datos del análisis

## 🚀 Próximas Características

- [ ] Exportación a PDF
- [ ] Análisis por lotes (múltiples imágenes)
- [ ] Integración completa con Stripe
- [ ] API REST para integraciones
- [ ] Análisis más avanzados con modelos ML externos
- [ ] Comparación entre imágenes

## 📝 Notas Importantes

1. **Session ID para Invitados**: Se almacena en `localStorage` como `guest_session_id`
2. **Límites**: No hay límites estrictos en la versión actual, pero pueden implementarse fácilmente
3. **Storage**: Las imágenes se organizan por `user_id` o `session_id` en carpetas
4. **Autenticación**: Usa Supabase Auth con email/password
5. **ML**: El análisis ML actual es simplificado; puedes integrarlo con modelos reales

## 🐛 Solución de Problemas

### Error: "Missing Supabase environment variables"
- Verifica que el archivo `.env` existe y tiene las variables correctas
- Reinicia el servidor de desarrollo

### Error al subir imágenes
- Verifica que el bucket `image-analyses` existe en Supabase Storage
- Verifica las políticas de Storage

### Los análisis no se guardan
- Verifica que ejecutaste el script SQL completo
- Revisa los logs de Supabase para errores de RLS

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Soporte

Para soporte, contacta a: [tu-email@ejemplo.com]
