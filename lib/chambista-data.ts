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
  trade?: string
  rating?: number
  reviews?: number
  price?: string
  priceUnit?: string
  district?: string
  responseTime?: string
  completionRate?: number
  avatar?: string
  verified?: boolean
  featured?: boolean
  categoryId?: string
  bio?: string
  tags?: string[]
  portfolio?: string[]
  // Optional mapped properties for UI compatibility
  photo?: string
  categoryName?: string
  zone?: string
  priceFrom?: number
  tagline?: string
  jobsDone?: number
  // Empresa specific initial fields
  isEmpresa?: boolean
  chatDisabled?: boolean
  nombre?: string
  servicio?: string
  ubicacion?: string
  calificacion?: string
  reviewsCount?: number
  ruc?: string
  correo?: string
  telefono?: string
  phone?: string
  telefonoClean?: string
  logo?: string | null
  link?: string
  badgeText?: string
  infoRaw?: string
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

export const providers: Provider[] = [
  {
    id: 'alonso-medina',
    name: 'Alonso Medina',
    trade: 'Gasfitería & Plomería',
    rating: 4.9,
    reviews: 38,
    price: 'S/. 45',
    priceUnit: 'visita / diagnóstico',
    district: 'Cayma, Arequipa',
    responseTime: '< 30 min',
    completionRate: 98,
    avatar: '/providers/alonso-medina.png',
    photo: '/providers/alonso-medina.png',
    verified: true,
    featured: true,
    categoryId: 'gasfiteria',
    categoryName: 'Gasfitería',
    bio: 'Más de 10 años resolviendo fugas, desatoros e instalaciones sanitarias en toda Arequipa.',
    tags: ['Fugas de agua', 'Desatoros', 'Grifería', 'Termas'],
    jobsDone: 142,
  },
  {
    id: 'camila-vargas',
    name: 'Camila Vargas',
    trade: 'Electricidad Residencial & Comercial',
    rating: 4.8,
    reviews: 29,
    price: 'S/. 50',
    priceUnit: 'revisión técnica',
    district: 'Yanahuara, Arequipa',
    responseTime: '< 45 min',
    completionRate: 99,
    avatar: '/providers/camila-vargas.png',
    photo: '/providers/camila-vargas.png',
    verified: true,
    featured: true,
    categoryId: 'electricidad',
    categoryName: 'Electricidad',
    bio: 'Técnica electricista certificada. Especialista en tableros, cableados e iluminación LED segura.',
    tags: ['Cortocircuitos', 'Tableros', 'Iluminación', 'Puestas a tierra'],
    jobsDone: 96,
  },
  {
    id: 'bruno-caceres',
    name: 'Bruno Cáceres',
    trade: 'Cerrajería de Emergencia',
    rating: 5.0,
    reviews: 44,
    price: 'S/. 40',
    priceUnit: 'apertura',
    district: 'José Luis Bustamante, Arequipa',
    responseTime: '< 20 min',
    completionRate: 100,
    avatar: '/providers/bruno-caceres.png',
    photo: '/providers/bruno-caceres.png',
    verified: true,
    featured: true,
    categoryId: 'cerrajeria',
    categoryName: 'Cerrajería',
    bio: 'Apertura de puertas sin dañar cerraduras. Chapas de alta seguridad residenciales y vehiculares.',
    tags: ['Aperturas 24/7', 'Chapas de seguridad', 'Duplicados', 'Cerraduras digitales'],
    jobsDone: 210,
  },
  {
    id: 'elena-rivera',
    name: 'Elena Rivera',
    trade: 'Limpieza Profunda & Desinfección',
    rating: 4.9,
    reviews: 52,
    price: 'S/. 70',
    priceUnit: 'jornada 4h',
    district: 'Miraflores, Arequipa',
    responseTime: '< 1 hora',
    completionRate: 97,
    avatar: '/providers/elena-rivera.png',
    photo: '/providers/elena-rivera.png',
    verified: true,
    featured: true,
    categoryId: 'limpieza',
    categoryName: 'Limpieza',
    bio: 'Servicios integrales de limpieza para departamentos, casas y oficinas con insumos ecológicos.',
    tags: ['Limpieza profunda', 'Post mudanza', 'Vidrios en altura', 'Oficinas'],
    jobsDone: 185,
  },
  {
    id: 'jorge-delgado',
    name: 'Jorge Delgado',
    trade: 'Carpintería & Melamina',
    rating: 4.7,
    reviews: 31,
    price: 'S/. 60',
    priceUnit: 'cotización en sitio',
    district: 'Cerro Colorado, Arequipa',
    responseTime: '< 2 horas',
    completionRate: 96,
    avatar: '/providers/jorge-delgado.png',
    photo: '/providers/jorge-delgado.png',
    verified: true,
    featured: true,
    categoryId: 'carpinteria',
    categoryName: 'Carpintería',
    bio: 'Muebles de cocina a medida, closets, reposteros y reparación de puertas y estructuras de madera.',
    tags: ['Melamina', 'Muebles a medida', 'Puertas', 'Ajustes y bisagras'],
    jobsDone: 88,
  },
  {
    id: 'lucas-condori',
    name: 'Lucas Condori',
    trade: 'Pintura & Empastado',
    rating: 4.8,
    reviews: 24,
    price: 'S/. 55',
    priceUnit: 'm² estimado',
    district: 'Arequipa Centro',
    responseTime: '< 1 hora',
    completionRate: 95,
    avatar: '/providers/lucas-condori.png',
    photo: '/providers/lucas-condori.png',
    verified: true,
    featured: false,
    categoryId: 'pintura',
    categoryName: 'Pintura',
    bio: 'Acabados impecables en pintura látex, óleo, empastados y tratamiento antihumedad.',
    tags: ['Pintado interior', 'Fachadas', 'Empaste', 'Antihumedad'],
    jobsDone: 73,
  },
  {
    id: 'diego-salazar',
    name: 'Diego Salazar',
    trade: 'Refrigeración & Climatización',
    rating: 4.9,
    reviews: 19,
    price: 'S/. 65',
    priceUnit: 'mantenimiento',
    district: 'Cayma, Arequipa',
    responseTime: '< 1 hora',
    completionRate: 98,
    avatar: '/providers/diego-salazar.png',
    photo: '/providers/diego-salazar.png',
    verified: true,
    featured: false,
    categoryId: 'refrigeracion',
    categoryName: 'Refrigeración',
    bio: 'Carga de gas, reparación de refrigeradoras no frost, congeladoras y aire acondicionado.',
    tags: ['Refrigeradoras', 'Carga de gas', 'Aire acondicionado', 'Congeladoras'],
    jobsDone: 64,
  },
  {
    id: 'sofia-nunez',
    name: 'Sofía Núñez',
    trade: 'Fumigación & Control de Plagas',
    rating: 4.9,
    reviews: 35,
    price: 'S/. 90',
    priceUnit: 'servicio certificado',
    district: 'Yanahuara, Arequipa',
    responseTime: '< 2 horas',
    completionRate: 100,
    avatar: '/providers/sofia-nunez.png',
    photo: '/providers/sofia-nunez.png',
    verified: true,
    featured: false,
    categoryId: 'fumigacion',
    categoryName: 'Fumigación',
    bio: 'Control seguro y certificado de plagas para residencias, restaurantes y comercios con certificado MINSA.',
    tags: ['Desinsectación', 'Desratización', 'Certificado oficial', 'Cero olores'],
    jobsDone: 112,
  }
]

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

