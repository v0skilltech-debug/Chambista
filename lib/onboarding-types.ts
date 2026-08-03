export type TipoCuenta = 'natural' | 'natural_negocio' | 'empresa'
export type TipoDocumento = 'dni' | 'ce' | 'pasaporte'
export type ModalidadPrecio = 'hora' | 'visita' | 'servicio' | 'cotizacion'
export type ModalidadAtencion = 'domicilio' | 'taller' | 'ambos'

export type TrabajoPortafolio = {
  id: string
  titulo: string
  descripcion: string
  precio: string
  imagen: string | null
}

export type OnboardingData = {
  tipoCuenta: TipoCuenta
  // Identidad
  nombres: string
  apellidos: string
  razonSocial: string
  tipoDocumento: TipoDocumento
  numeroDocumento: string
  ruc: string
  dniRepresentante: string
  fechaNacimiento: string
  fotoPerfil: string | null
  // Contacto
  celular: string
  celularVerificado: boolean
  correo: string
  ciudad: string
  distrito: string
  zona: string
  // Oficios
  oficios: string[]
  especialidades: string[]
  descripcion: string
  aniosExperiencia: string
  precioReferencial: string
  modalidadPrecio: ModalidadPrecio
  // Cobertura y disponibilidad
  distritosAtencion: string[]
  diasDisponibles: string[]
  horaInicio: string
  horaFin: string
  atiendeEmergencias: boolean
  modalidadAtencion: ModalidadAtencion
  // Portafolio
  portafolio: TrabajoPortafolio[]
  certificados: string[]
}

export const INITIAL_ONBOARDING: OnboardingData = {
  tipoCuenta: 'natural',
  nombres: '',
  apellidos: '',
  razonSocial: '',
  tipoDocumento: 'dni',
  numeroDocumento: '',
  ruc: '',
  dniRepresentante: '',
  fechaNacimiento: '',
  fotoPerfil: null,
  celular: '',
  celularVerificado: false,
  correo: '',
  ciudad: 'Lima',
  distrito: '',
  zona: '',
  oficios: [],
  especialidades: [],
  descripcion: '',
  aniosExperiencia: '',
  precioReferencial: '',
  modalidadPrecio: 'hora',
  distritosAtencion: [],
  diasDisponibles: [],
  horaInicio: '08:00',
  horaFin: '18:00',
  atiendeEmergencias: false,
  modalidadAtencion: 'domicilio',
  portafolio: [],
  certificados: [],
}

export const PASOS = [
  { id: 'tipo', titulo: 'Tipo de cuenta' },
  { id: 'identidad', titulo: 'Datos personales' },
  { id: 'contacto', titulo: 'Contacto y ubicación' },
  { id: 'oficios', titulo: 'Tus oficios' },
  { id: 'cobertura', titulo: 'Cobertura y horarios' },
  { id: 'portafolio', titulo: 'Portafolio' },
  { id: 'resumen', titulo: 'Resumen' },
] as const
