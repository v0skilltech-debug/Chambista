export type EstadoSolicitud =
  | 'nueva'
  | 'pendiente'
  | 'programada'
  | 'completada'
  | 'cancelada'
  | 'rechazada'

export type Solicitud = {
  id: string
  cliente: string
  servicio: string
  descripcion: string
  fotos: string[]
  direccion: string
  fecha: string
  precioEstimado: number
  estado: EstadoSolicitud
}

export type EventoAgenda = {
  id: string
  titulo: string
  cliente: string
  hora: string
  duracion: string
  distrito: string
  tipo: 'trabajo' | 'bloqueo' | 'vacaciones'
}

export type Resena = {
  id: string
  cliente: string
  calificacion: number
  comentario: string
  fecha: string
  servicio: string
}

export const PERFIL = {
  nombre: 'Juan Carlos Pérez',
  oficio: 'Gasfitería · Electricidad',
  distrito: 'Surco, Lima',
  avatar: '/images/avatar-provider.png',
  nivelVerificacion: 'Verificado',
  progresoVerificacion: 85,
}

export const ESTADO_LABEL: Record<EstadoSolicitud, string> = {
  nueva: 'Nueva',
  pendiente: 'Pendiente',
  programada: 'Programada',
  completada: 'Completada',
  cancelada: 'Cancelada',
  rechazada: 'Rechazada',
}

export const ESTADO_STYLE: Record<EstadoSolicitud, string> = {
  nueva: 'border-transparent bg-primary/15 text-primary',
  pendiente: 'border-transparent bg-chart-3/20 text-foreground',
  programada: 'border-transparent bg-chart-4/15 text-chart-4',
  completada: 'border-transparent bg-success/15 text-success',
  cancelada: 'border-transparent bg-secondary text-muted-foreground',
  rechazada: 'border-transparent bg-destructive/15 text-destructive',
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 0,
  }).format(value)
}

export const HORARIOS_DIA = [
  { hora: '08:00', estado: 'libre' as const },
  { hora: '09:00', estado: 'libre' as const },
  { hora: '10:00', estado: 'libre' as const },
  { hora: '11:00', estado: 'ocupado' as const },
  { hora: '12:00', estado: 'ocupado' as const },
  { hora: '13:00', estado: 'bloqueado' as const },
  { hora: '14:00', estado: 'libre' as const },
  { hora: '15:00', estado: 'libre' as const },
  { hora: '16:00', estado: 'ocupado' as const },
  { hora: '17:00', estado: 'libre' as const },
]

export type Bloqueo = {
  id: string
  titulo: string
  rango: string
  tipo: 'vacaciones' | 'bloqueo'
}

export const BLOQUEOS: Bloqueo[] = [
  { id: 'b-1', titulo: 'Vacaciones', rango: '20 - 24 jul', tipo: 'vacaciones' },
  { id: 'b-2', titulo: 'Almuerzo (diario)', rango: '13:00 - 14:00', tipo: 'bloqueo' },
  { id: 'b-3', titulo: 'Curso de certificación', rango: 'Sáb 19 jul, todo el día', tipo: 'bloqueo' },
]
