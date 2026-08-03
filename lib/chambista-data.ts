import {
  Wrench,
  Zap,
  Hammer,
  PaintRoller,
  Sparkles,
  Leaf,
  Snowflake,
  KeyRound,
  Bug,
  Truck,
  Wind,
  Droplets,
  type LucideIcon,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

export type Provider = {
  id: string
  name: string
  trade: string
  rating: number
  reviews: number
  price: string
  priceUnit: string
  district: string
  responseTime: string
  completionRate: number
  avatar: string
  verified: boolean
  featured: boolean
  categoryId: string
  bio: string
  tags: string[]
  portfolio: string[]
}

export type Category = {
  id: string
  label: string
  icon: LucideIcon
  color: string
}

export type Reminder = {
  id: string
  title: string
  description: string
  dueInDays: number
  categoryId: string
  icon: LucideIcon
}

// ─── Categories ──────────────────────────────────────────────────────────────

export const categories: Category[] = [
  { id: 'gasfiteria',    label: 'Gasfitería',    icon: Droplets,    color: '#3B82F6' },
  { id: 'electricidad',  label: 'Electricidad',  icon: Zap,         color: '#F59E0B' },
  { id: 'carpinteria',   label: 'Carpintería',   icon: Hammer,      color: '#8B5CF6' },
  { id: 'pintura',       label: 'Pintura',       icon: PaintRoller, color: '#EC4899' },
  { id: 'limpieza',      label: 'Limpieza',      icon: Sparkles,    color: '#10B981' },
  { id: 'jardineria',    label: 'Jardinería',    icon: Leaf,        color: '#22C55E' },
  { id: 'refrigeracion', label: 'Refrigeración', icon: Snowflake,   color: '#06B6D4' },
  { id: 'cerrajeria',    label: 'Cerrajería',    icon: KeyRound,    color: '#F97316' },
  { id: 'fumigacion',    label: 'Fumigación',    icon: Bug,         color: '#EF4444' },
  { id: 'mudanzas',      label: 'Mudanzas',      icon: Truck,       color: '#6B7280' },
  { id: 'albanileria',   label: 'Albañilería',   icon: Wrench,      color: '#A16207' },
  { id: 'ventilacion',   label: 'Ventilación',   icon: Wind,        color: '#64748B' },
]

// ─── Providers ───────────────────────────────────────────────────────────────

export const providers: Provider[] = []

export const recentProviders: Provider[] = providers.slice(0, 3)

export function getProvider(id: string): Provider | undefined {
  return providers.find((p) => p.id === id)
}

export function providersByCategory(categoryId: string): Provider[] {
  return providers.filter((p) => p.categoryId === categoryId)
}

export function matchCategory(query: string): Category | undefined {
  const q = query.toLowerCase()
  return categories.find(
    (c) => c.label.toLowerCase().includes(q) || c.id.includes(q)
  )
}

// ─── Reminders ───────────────────────────────────────────────────────────────

export const reminders: Reminder[] = [
  {
    id: 'r1',
    title: 'Revisión de instalaciones eléctricas',
    description: 'Recomendado cada 2 años para prevenir cortocircuitos.',
    dueInDays: 14,
    categoryId: 'electricidad',
    icon: Zap,
  },
  {
    id: 'r2',
    title: 'Mantenimiento de tanque de agua',
    description: 'Limpia y desinfecta tu tanque cada 6 meses.',
    dueInDays: 30,
    categoryId: 'gasfiteria',
    icon: Droplets,
  },
  {
    id: 'r3',
    title: 'Fumigación del hogar',
    description: 'Fumigación preventiva recomendada cada 3 meses.',
    dueInDays: 45,
    categoryId: 'fumigacion',
    icon: Bug,
  },
]

// ─── Ads ─────────────────────────────────────────────────────────────────────

export const ads = [
  {
    id: 'ad1',
    title: 'Gasfiteros verificados cerca de ti',
    subtitle: 'Respuesta en menos de 30 minutos',
    cta: 'Buscar ahora',
    tone: 'primary',
    image: '/images/ad-gasfitero.jpg',
  },
  {
    id: 'ad2',
    title: 'Limpieza profunda para tu hogar',
    subtitle: '20% de descuento esta semana',
    cta: 'Ver oferta',
    tone: 'accent',
    image: '/images/ad-limpieza.jpg',
  },
  {
    id: 'ad3',
    title: 'Electricistas certificados',
    subtitle: 'Seguridad para toda tu familia',
    cta: 'Contratar',
    tone: 'primary',
    image: '/images/ad-electricista.jpg',
  },
]

export type Oficio = {
  id: string
  nombre: string
  icon: LucideIcon
  especialidades: string[]
}

export const OFICIOS: Oficio[] = [
  {
    id: 'gasfiteria',
    nombre: 'Gasfitería',
    icon: Droplets,
    especialidades: ['Reparación de fugas', 'Instalación de grifería', 'Desatoros', 'Instalación de sanitarios'],
  },
  {
    id: 'electricidad',
    nombre: 'Electricidad',
    icon: Zap,
    especialidades: ['Instalaciones eléctricas', 'Tableros', 'Iluminación', 'Detección de fallas'],
  },
  {
    id: 'carpinteria',
    nombre: 'Carpintería',
    icon: Hammer,
    especialidades: ['Muebles a medida', 'Puertas', 'Melamina', 'Reparaciones'],
  },
  {
    id: 'pintura',
    nombre: 'Pintura',
    icon: PaintRoller,
    especialidades: ['Pintado de interiores', 'Fachadas', 'Empastado', 'Gotelé'],
  },
  {
    id: 'limpieza',
    nombre: 'Limpieza',
    icon: Sparkles,
    especialidades: ['Limpieza profunda', 'Post construcción', 'Limpieza de vidrios', 'Mantenimiento'],
  },
  {
    id: 'jardineria',
    nombre: 'Jardinería',
    icon: Leaf,
    especialidades: ['Corte de césped', 'Poda', 'Diseño de jardines', 'Riego'],
  },
  {
    id: 'refrigeracion',
    nombre: 'Refrigeración',
    icon: Snowflake,
    especialidades: ['Aire acondicionado', 'Refrigeradoras', 'Congeladoras', 'Mantenimiento'],
  },
  {
    id: 'cerrajeria',
    nombre: 'Cerrajería',
    icon: KeyRound,
    especialidades: ['Apertura de puertas', 'Cambio de cerraduras', 'Copia de llaves', 'Chapas de seguridad'],
  },
  {
    id: 'fumigacion',
    nombre: 'Fumigación',
    icon: Bug,
    especialidades: ['Control de plagas', 'Desinfección', 'Desratización', 'Fumigación de jardines'],
  },
  {
    id: 'mudanzas',
    nombre: 'Mudanzas',
    icon: Truck,
    especialidades: ['Mudanzas locales', 'Embalaje', 'Transporte de muebles', 'Fletes'],
  },
  {
    id: 'albanileria',
    nombre: 'Albañilería',
    icon: Wrench,
    especialidades: ['Tarrajeo', 'Enchapado', 'Muros', 'Reparaciones'],
  },
  {
    id: 'ventilacion',
    nombre: 'Ventilación',
    icon: Wind,
    especialidades: ['Extractores', 'Ductos', 'Purificación de aire', 'Mantenimiento'],
  },
]

export const CIUDADES: string[] = ['Lima', 'Arequipa', 'Trujillo', 'Cusco', 'Chiclayo', 'Piura']

export const DISTRITOS_POR_CIUDAD: Record<string, string[]> = {
  'Lima': [
    'Miraflores', 'San Isidro', 'Santiago de Surco', 'San Borja', 'La Molina', 
    'Magdalena del Mar', 'Jesus Maria', 'Lince', 'San Miguel', 'Pueblo Libre',
    'Barranco', 'Chorrillos', 'Surquillo', 'La Victoria', 'Cercado de Lima', 'Callao'
  ],
  'Arequipa': [
    'Arequipa', 'Cayma', 'Yanahuara', 'Cerro Colorado', 'José Luis Bustamante',
    'Mariano Melgar', 'Miraflores'
  ],
  'Trujillo': [
    'Trujillo', 'Víctor Larco Herrera', 'Huanchaco', 'La Esperanza', 'El Porvenir'
  ],
  'Cusco': [
    'Cusco', 'Wanchaq', 'San Sebastián', 'Santiago', 'San Jerónimo'
  ],
  'Chiclayo': [
    'Chiclayo', 'José Leonardo Ortiz', 'La Victoria', 'Pimentel'
  ],
  'Piura': [
    'Piura', 'Castilla', 'Catacaos', 'Veintiséis de Octubre'
  ]
}

export const DISTRITOS_LIMA: string[] = DISTRITOS_POR_CIUDAD['Lima']

export const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

