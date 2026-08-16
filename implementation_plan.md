# 🚀 Plan Integral de Mejoras — Chambista

## Descripción del Proyecto

**Chambista** es un marketplace de servicios del hogar (plomeros, electricistas, gasfiteros, etc.) para el mercado peruano. Tiene:
- **Backend**: FastAPI + SQLAlchemy + SQLite (con soporte PostgreSQL)
- **Frontend**: Next.js 16 + React 19 + TailwindCSS + Shadcn/UI
- **IA**: Integración con Groq API

El proyecto fue generado con v0.app y está en fase MVP. El análisis reveló **vulnerabilidades críticas de seguridad**, deuda técnica importante, y oportunidades de mejora significativas en diseño y performance.

---

## 🔴 CRÍTICO — Leer antes de continuar

> [!CAUTION]
> **SECRETO API EXPUESTO**: El `.env` contiene la clave real de Groq API. **Rotarla inmediatamente en groq.com.**

> [!CAUTION]
> **SECRET_KEY HARDCODEADA**: `backend/core/security.py` línea 5: `SECRET_KEY = "supersecretkey_chambista_mvp"` — Cualquiera puede forjar tokens JWT de producción.

> [!CAUTION]
> **CORS abierto a `*`**: `backend/main.py` línea 20: `allowed_origins = ["*"]` — Desactiva todas las protecciones del navegador.

> [!CAUTION]
> **SQLite con datos personales en disco**: `chambista.db` contiene DNI, emails, passwords y conversaciones de usuarios reales.

> [!WARNING]
> **Endpoints sin autenticación**: `POST/GET/PATCH/DELETE /api/bookings/` — Cualquiera puede crear/ver/modificar/eliminar reservas sin autenticarse.

> [!WARNING]
> **JWT en localStorage**: Vulnerable a XSS. Un script malicioso puede robar todos los tokens.

---

## 🔐 PLAN 1 — Ciberseguridad

### Prioridad CRÍTICA (Antes de cualquier deploy a producción)

#### [MODIFY] [security.py](file:///c:/Users/joshç/Downloads/Chambas/chambista_final/backend/core/security.py)
- Leer `SECRET_KEY` desde variable de entorno obligatoria
- Reducir expiración de 1 semana → **60 minutos** (estándar de la industria)
- Agregar Refresh Token separado (7 días de vida)
- Agregar `jti` (JWT ID) para invalidar tokens individuales

```python
# ACTUAL (INSEGURO)
SECRET_KEY = "supersecretkey_chambista_mvp"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 1 semana

# PROPUESTO (SEGURO)
SECRET_KEY = os.environ["JWT_SECRET_KEY"]  # Falla al arrancar si no existe
REFRESH_SECRET_KEY = os.environ["JWT_REFRESH_SECRET_KEY"]
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # 1 hora
REFRESH_TOKEN_EXPIRE_DAYS = 7
```

#### [MODIFY] [main.py](file:///c:/Users/joshç/Downloads/Chambas/chambista_final/backend/main.py)
- CORS restrictivo con lista blanca explícita
- Rate Limiting con `slowapi`
- Security Headers (HSTS, X-Frame-Options, CSP)

```python
# ACTUAL (INSEGURO)
allowed_origins = ["*"]

# PROPUESTO
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

#### [MODIFY] [bookings.py](file:///c:/Users/joshç/Downloads/Chambas/chambista_final/backend/routers/bookings.py)
- Agregar `Depends(get_current_user)` a todos los endpoints
- Validar que `cliente_id` coincide con el usuario autenticado
- Prevenir IDOR: usuario solo puede ver sus propias reservas

#### [MODIFY] [conversations.py](file:///c:/Users/joshç/Downloads/Chambas/chambista_final/backend/routers/conversations.py)
- Usa `cliente_username` (string libre) en lugar de user ID del JWT
- Migrar a autenticación basada en JWT token
- Validar que el usuario solo puede ver sus propias conversaciones

#### [NEW] `backend/middleware/security_headers.py`
```python
# Headers HTTP de seguridad:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# Strict-Transport-Security: max-age=31536000
# Content-Security-Policy: default-src 'self'
# Referrer-Policy: strict-origin-when-cross-origin
```

#### [NEW] `backend/middleware/rate_limiter.py`
```python
# Rate limiting por IP con slowapi:
# - Login:    5 intentos/minuto  (prevención brute force)
# - Register: 3 intentos/minuto
# - AI:       10 llamadas/minuto
# - General:  60 req/minuto
```

---

### Prioridad ALTA

#### [MODIFY] Tokens JWT — Frontend (auth-screen.tsx, onboarding-wizard.tsx)
- Migrar de `localStorage` → **HttpOnly cookies** (inmunes a XSS)
- Implementar renovación automática con Refresh Token
- Implementar logout real que invalide el token

```tsx
// ACTUAL (INSEGURO — vulnerable a XSS)
localStorage.setItem('chambista_token', data.access_token)

// PROPUESTO — Backend setea cookie HttpOnly automáticamente
// POST /api/auth/login → Set-Cookie: session=...; HttpOnly; Secure; SameSite=Strict
```

#### [NEW] `backend/routers/auth.py` — Endpoints adicionales
- `POST /api/auth/logout` — invalida refresh token
- `POST /api/auth/refresh` — renueva access token
- Verificación de email antes de activar cuenta
- Bloqueo tras 5 intentos fallidos de login

#### [NEW] Tabla AuditLog en models.py
```python
class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    action = Column(String)      # "LOGIN", "BOOKING_CREATE", etc.
    resource = Column(String)
    ip_address = Column(String)
    user_agent = Column(String)
    timestamp = Column(DateTime, server_default=func.now())
```

#### [NEW] `.env.example` — Documentar variables obligatorias
```bash
JWT_SECRET_KEY=<python -c "import secrets; print(secrets.token_hex(64))">
JWT_REFRESH_SECRET_KEY=<python -c "import secrets; print(secrets.token_hex(64))">
DATABASE_URL=postgresql://user:pass@host/db
ALLOWED_ORIGINS=https://chambista.com,https://www.chambista.com
GROQ_API_KEY=<tu_clave>
ENVIRONMENT=production
```

---

### Prioridad MEDIA

- **Validación de contraseñas**: Frontend exige 6 chars, backend no valida longitud. Unificar en mínimo 8 + 1 mayúscula + 1 número.
- **Archivos subidos**: Validar tipo MIME real, limitar tamaño, mover a S3/Cloudflare R2.
- **Protección CSRF**: Tokens CSRF en formularios + `SameSite=Strict` en cookies.

---

## ⚙️ PLAN 2 — Backend

### Arquitectura y Base de Datos

#### [MODIFY] Migrar SQLite → PostgreSQL

**Fundamento**: SQLite no soporta concurrencia real (1 writer), carece de tipos avanzados (ARRAY, JSONB), y no es apto para producción. El `requirements.txt` ya incluye `psycopg2-binary` y `pgvector`.

```python
# database.py — PostgreSQL con connection pooling
from sqlalchemy.pool import QueuePool
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,  # Detecta conexiones caídas
)
```

#### [NEW] Migraciones con Alembic

`Base.metadata.create_all()` es destructivo en producción (recrea tablas si cambia el schema).

```bash
alembic init alembic
alembic revision --autogenerate -m "initial_schema"
alembic upgrade head
```

#### [MODIFY] [models.py](file:///c:/Users/joshç/Downloads/Chambas/chambista_final/backend/models.py) — Tipos de datos nativos

```python
# ACTUAL — datos como strings planos (imposible de consultar)
servicios = Column(String)       # "plomería,electricidad"
fotos_trabajos = Column(Text)   # "url1,url2,url3"

# PROPUESTO — tipos PostgreSQL nativos
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
servicios = Column(ARRAY(String))
fotos_trabajos = Column(ARRAY(String))
zonas_atencion = Column(ARRAY(String))
```

#### [MODIFY] [models.py](file:///c:/Users/joshç/Downloads/Chambas/chambista_final/backend/models.py) — Relaciones faltantes en Conversacion

```python
# ACTUAL — strings arbitrarios en lugar de FKs verificadas
cliente_username = Column(String, index=True)
prestador_id = Column(String, index=True)  # ¿String?

# PROPUESTO — Foreign Keys reales
cliente_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
prestador_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
```

---

### Calidad de Código y APIs

#### [MODIFY] Estandarizar autenticación — 3 implementaciones distintas detectadas

| Router | Implementación actual |
|--------|----------------------|
| `auth.py` | `Header(None)` directo |
| `providers.py` | Helper `get_user_from_token()` |
| `dashboard.py` | Inline + fallback hardcoded a usuario `id=1` |

**Propuesta**: Un único `Depends(get_current_user)` en `core/auth_deps.py`

```python
# core/auth_deps.py
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> models.Usuario:
    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    user = db.query(models.Usuario).filter(
        models.Usuario.email == payload.get("sub"),
        models.Usuario.activo == True
    ).first()
    if not user:
        raise HTTPException(status_code=401)
    return user
```

#### [MODIFY] [dashboard.py](file:///c:/Users/joshç/Downloads/Chambas/chambista_final/backend/routers/dashboard.py)

> [!CAUTION]
> **Línea 67**: `resolved_id = 1` — Cualquier request anónimo recibe datos del usuario 1. Eliminar este fallback inmediatamente.

#### [NEW] Capa de Servicios

```
backend/services/
├── booking_service.py      # Lógica de negocio
├── payment_service.py      # Culqi / Stripe
├── notification_service.py
├── search_service.py       # Búsqueda optimizada
└── ai_service.py           # ← ya existe
```

#### [MODIFY] [search.py](file:///c:/Users/joshç/Downloads/Chambas/chambista_final/backend/routers/search.py)

**Problema**: Carga TODOS los proveedores en memoria y hace N queries para calcular ratings.

```python
# PROPUESTO — Un solo JOIN en lugar de N queries
avg_rating_sq = (
    db.query(
        models.Review.provider_id,
        func.avg(models.Review.rating).label("avg_rating"),
        func.count(models.Review.id).label("total_reviews"),
    )
    .group_by(models.Review.provider_id)
    .subquery()
)
query = (
    db.query(models.Usuario, models.PerfilPrestador, avg_rating_sq)
    .join(models.PerfilPrestador)
    .outerjoin(avg_rating_sq, avg_rating_sq.c.provider_id == models.Usuario.id)
    .offset(skip).limit(limit)  # Paginación
)
```

#### [NEW] [payments.py](file:///c:/Users/joshç/Downloads/Chambas/chambista_final/backend/routers/payments.py) — Implementar
- Actualmente: 4 líneas vacías
- Integración con **Culqi** (pasarela peruana) o Stripe
- Webhooks para confirmar pagos asíncronos
- Historial de transacciones con recibos

#### [NEW] WebSockets para chat en tiempo real

```python
# routers/ws_chat.py
@router.websocket("/ws/chat/{conv_id}")
async def websocket_chat(websocket: WebSocket, conv_id: int, token: str = Query(...)):
    # Actualmente: polling HTTP ineficiente
    # Propuesta: conexión persistente WebSocket
```

#### [NEW] Tests unitarios y de integración

```
backend/tests/
├── conftest.py        # Base de datos en memoria para tests
├── test_auth.py
├── test_bookings.py
└── test_search.py
```

---

## 🎨 PLAN 3 — Diseño (UI/UX)

### Problemas Críticos de CSS

#### Dark mode forzosamente desactivado

```css
/* ACTUAL — Bloquea dark mode con !important en todos los selectores */
:root, .dark, .force-light {
  color-scheme: light !important;
  --background: oklch(1 0 0) !important;
}
```

**Propuesta**: Variables CSS separadas para `:root` (light) y `.dark` sin `!important`, respetando `prefers-color-scheme`.

---

### Nueva Paleta de Marca

```css
/* Chambista Brand — Inspirada en el mercado peruano */
:root {
  --primary: oklch(0.48 0.24 258);        /* Azul Andino profundo */
  --primary-light: oklch(0.88 0.12 258);
  --accent-tool: oklch(0.70 0.22 42);     /* Naranja herramienta */
  --success: oklch(0.62 0.18 145);        /* Verde verificado */
  --surface-1: oklch(0.99 0.005 240);    /* Off-white premium */
  --surface-2: oklch(0.97 0.008 240);    /* Cards */
}

.dark {
  --primary: oklch(0.65 0.22 258);
  --surface-1: oklch(0.12 0.01 240);
  --surface-2: oklch(0.18 0.01 240);
}
```

---

### Mejoras Específicas por Pantalla

#### 1. Landing/Auth — [auth-screen.tsx](file:///c:/Users/joshç/Downloads/Chambas/chambista_final/components/auth/auth-screen.tsx)

| Problema actual | Mejora propuesta |
|----------------|-----------------|
| Colores hero hardcodeados (`from-slate-900`) | Usar design system tokens |
| Estadísticas inventadas (500+, 30min, 4.8★) | Cargar números reales desde API |
| Sin animaciones de entrada | CSS stagger animations o Framer Motion |
| Sin imagen real | Generar imagen con artesano peruano trabajando |

#### 2. Onboarding Wizard — [onboarding-wizard.tsx](file:///c:/Users/joshç/Downloads/Chambas/chambista_final/components/onboarding/onboarding-wizard.tsx)

| Problema actual | Mejora propuesta |
|----------------|-----------------|
| `alert()` nativo del navegador | Toast notifications (Sonner) |
| Contraseña mínimo 6 chars | Mínimo 8 + indicador de fortaleza |
| Sin guardado de progreso | `sessionStorage` para recuperación |
| Sin animaciones entre pasos | Slide/fade transitions |
| Sin preview de foto de perfil | Preview en tiempo real |

#### 3. Dashboard del Proveedor

- Gráfica de ingresos con `recharts` (actualmente solo números estáticos)
- Mapa de Perú con zonas de atención resaltadas
- Micro-animaciones en tarjetas de estadísticas al cargar
- Vista de calendario para la agenda
- Notificaciones en tiempo real con badge animado

#### 4. Búsqueda de Proveedores

- Vista mapa + lista (toggle)
- Filtros laterales con sliders (precio, rating, distancia)
- Cards de proveedor con badge de verificación
- **Skeleton loading** mientras carga
- Búsqueda en tiempo real con debounce (300ms)

#### 5. Componentes del Sistema — Faltantes

```tsx
// Crear en components/ui/:
<VerificationBadge level="premium|standard|basic" />
<RatingStars value={4.8} count={23} />
<ProviderCard provider={...} />
<BookingStatusBadge status="nueva|programada|completada" />
<Toast />           // Reemplazar alert()
<SkeletonCard />    // Loading states
<EmptyState icon={...} message="..." action={...} />
<ConfirmDialog />   // Reemplazar confirm()
```

---

### Accesibilidad (WCAG AA)

- `aria-label` en botones con solo íconos (ojo en password, flecha en wizard)
- Ratio de contraste mínimo 4.5:1 (verificar paleta actual)
- Navegación por teclado completa en el wizard
- `role="alert"` en mensajes de error dinámicos

---

## 🖥️ PLAN 4 — Frontend

### Estado de la Aplicación — Problemática Actual

| Dato | Almacenamiento actual | Problema |
|------|--------------------|---------|
| JWT Token | `localStorage` | Vulnerable a XSS |
| Datos del usuario | `useState` local | Sincronización entre rutas |
| Datos del servidor | Mix de `useState` + React Query | Inconsistente |
| Estado global | Zustand (subutilizado) | Importado pero poco usado |

**Propuesta — Arquitectura de estado limpia**:
```
Estado del servidor  → React Query  (cache, refetch, mutations)
Estado global de UI  → Zustand      (sidebar, modals, notificaciones)
Formularios          → react-hook-form + Zod
Auth                 → Context + HttpOnly cookies
```

---

#### [NEW] `lib/api-client.ts` — Cliente HTTP centralizado

```typescript
// ACTUAL — fetch() hardcodeado en cada componente:
// `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/...`

// PROPUESTO
import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,  // Para cookies HttpOnly
})

// Request interceptor — agrega token automáticamente
apiClient.interceptors.request.use(config => {
  const token = authStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor — manejo global de errores + renovación
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      try {
        await refreshToken()
        return apiClient.request(error.config)
      } catch {
        authStore.getState().logout()
        router.push('/login')
      }
    }
    return Promise.reject(error)
  }
)
```

---

#### [NEW] `lib/hooks/` — Custom hooks tipados

```typescript
// hooks/use-auth.ts
export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiClient.get('/api/auth/me').then(r => r.data),
    retry: false,
    staleTime: 5 * 60 * 1000,  // 5 minutos
  })
  return { user, isLoading, isAuthenticated: !!user }
}

// hooks/use-bookings.ts
export function useBookings(filters?: BookingFilters) {
  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: () => apiClient.get('/api/bookings', { params: filters }),
  })
}

// hooks/use-notifications.ts
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiClient.get('/api/notifications'),
    refetchInterval: 30_000,  // Polling cada 30s hasta implementar WebSockets
  })
}
```

---

#### [NEW] Validación con Zod — Frontend

```typescript
// lib/schemas/auth.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
})

export const registerSchema = z.object({
  nombre: z.string().min(2, "Nombre muy corto").max(100),
  email: z.string().email("Email inválido"),
  password: z.string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),
})
```

---

### Performance

- **`next/image`** con `sizes` y `priority` apropiados para imágenes de perfil y portafolio
- **Lazy loading** de secciones pesadas del dashboard

```typescript
// Dashboard sections — carga bajo demanda
const SectionMensajes = dynamic(() => import('./section-mensajes'), {
  loading: () => <SkeletonCard />,
  ssr: false,
})
```

- **Eliminar N+1**: Usar endpoints que devuelvan datos completos (ratings incluidos) en 1 llamada

---

### Estructura de Rutas — Reorganización

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── registro/page.tsx
├── (proveedor)/
│   ├── dashboard/
│   │   ├── page.tsx                  (resumen)
│   │   ├── agenda/page.tsx
│   │   ├── solicitudes/page.tsx
│   │   ├── mensajes/page.tsx
│   │   ├── pagos/page.tsx            ← FALTA
│   │   └── perfil/page.tsx           ← FALTA
│   └── onboarding/page.tsx
├── (cliente)/
│   ├── buscar/page.tsx               ← FALTA UI robusta
│   ├── mis-servicios/page.tsx        ← FALTA
│   └── perfil/page.tsx               ← FALTA
└── (public)/
    ├── page.tsx                      (landing pública)
    └── proveedor/[id]/page.tsx       ← Perfil público
```

---

## 📋 Orden de Implementación Recomendado

### Sprint 1 — Seguridad crítica (1–2 días)
1. Rotar clave Groq API
2. Mover `SECRET_KEY` a variable de entorno
3. Restringir CORS
4. Agregar autenticación a endpoints de bookings
5. Eliminar fallback `resolved_id = 1` en dashboard
6. Crear `.env.example`

### Sprint 2 — Backend sólido (1 semana)
1. Configurar Alembic
2. Migrar a PostgreSQL (Supabase free tier)
3. Estandarizar `get_current_user` en todos los routers
4. Optimizar búsqueda (subquery para ratings)
5. Implementar paginación en listados

### Sprint 3 — Frontend robusto (1 semana)
1. `api-client.ts` centralizado
2. Reemplazar `alert()` con toasts (Sonner)
3. Validación Zod en todos los formularios
4. `useAuth()` centralizado
5. Lazy loading en dashboard

### Sprint 4 — Features críticos (2 semanas)
1. Integrar Culqi (pasarela de pago peruana)
2. WebSockets para chat
3. Notificaciones push (Web Push API)
4. Perfil público del proveedor

### Sprint 5 — Diseño premium (1 semana)
1. Modo oscuro real
2. Animaciones de entrada en landing
3. Componentes del sistema faltantes
4. Vista de mapa para búsqueda

---

## Verificación del Plan

### Tests de Seguridad
```bash
pytest backend/tests/test_auth.py     # Endpoints protegidos
pytest backend/tests/test_bookings.py  # IDOR prevention
# Verificar: 6 intentos de login fallidos → HTTP 429
```

### Tests de Performance
- **Lighthouse audit**: target 90+ en Performance, Accessibility, SEO
- **Búsqueda**: < 200ms con 1000 proveedores
- **Bundle JS**: < 150KB initial load

### QA Manual
- Flujo completo: registro → onboarding → booking → pago → review
- Dark mode en Chrome, Safari, Firefox
- Mobile: iPhone SE (375px) y Android (360px)
