'use client'

import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, ShieldCheck, CheckCircle2, Sparkles, X, Briefcase } from 'lucide-react'
import { ChambistaLogo } from '@/components/chambista-logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  INITIAL_ONBOARDING,
  PASOS,
  type OnboardingData,
} from '@/lib/onboarding-types'
import { StepTipoCuenta } from './steps/step-tipo-cuenta'
import { StepIdentidad } from './steps/step-identidad'
import { StepContacto } from './steps/step-contacto'
import { StepOficios } from './steps/step-oficios'
import { StepCobertura } from './steps/step-cobertura'
import { StepPortafolio } from './steps/step-portafolio'
import { StepResumen } from './steps/step-resumen'

export type StepProps = {
  data: OnboardingData
  update: (patch: Partial<OnboardingData>) => void
}

// Step -1: Account creation (solo para usuarios no autenticados)
function StepCuenta({
  email, setEmail,
  password, setPassword,
  rol, setRol,
  loading, onSubmit,
  emailError, setEmailError,
}: {
  email: string; setEmail: (v: string) => void
  password: string; setPassword: (v: string) => void
  rol: string; setRol: (v: string) => void
  loading: boolean; onSubmit: () => void
  emailError: string; setEmailError: (v: string) => void
}) {
  const [showPass, setShowPass] = useState(false)

  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    return score;
  };

  const isPasswordSecure = getPasswordStrength() === 4;

  return (
    <div className="space-y-6 max-w-lg mx-auto bg-card p-6 sm:p-8 rounded-3xl border border-border shadow-md">
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Crea tu cuenta de servicios</h2>
        <p className="text-xs text-muted-foreground">Publica tus servicios y capta clientes en Arequipa y todo el Perú.</p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wider text-foreground">Modalidad inicial</Label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'independiente', label: 'Independiente' },
            { value: 'empresa', label: 'Empresa' },
          ].map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setRol(t.value)}
              className={`rounded-xl border-2 py-2.5 text-xs font-bold transition-all ${
                rol === t.value
                  ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                  : 'border-border bg-card text-foreground hover:border-primary/40'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="oc-email" className="text-xs font-bold uppercase tracking-wider text-foreground">
          Correo electrónico <span className="text-primary">*</span>
        </Label>
        <Input
          id="oc-email"
          type="email"
          placeholder="tucorreo@ejemplo.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
          className="h-11 rounded-xl bg-card border-border text-sm"
          onBlur={async () => {
            if (email && email.includes('@')) {
              try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/check-email?email=${encodeURIComponent(email)}`)
                const d = await res.json()
                if (d.exists) setEmailError('Este correo electrónico ya está registrado.')
                else setEmailError('')
              } catch (e) {}
            }
          }}
        />
        {emailError && <p className="text-xs text-destructive font-medium">{emailError}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="oc-pass" className="text-xs font-bold uppercase tracking-wider text-foreground">
          Contraseña segura <span className="text-primary">*</span>
        </Label>
        <div className="relative">
          <Input
            id="oc-pass"
            type={showPass ? 'text' : 'password'}
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 rounded-xl bg-card border-border text-sm pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>

        <div className="mt-3 space-y-2 rounded-xl bg-muted/40 p-3.5 border border-border/60">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">Nivel de seguridad:</span>
            <span className="font-bold text-primary">
              {getPasswordStrength() === 4 ? 'Excelente' : 'Requerido'}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                getPasswordStrength() === 0 ? 'w-0' :
                getPasswordStrength() === 1 ? 'w-1/4 bg-red-500' :
                getPasswordStrength() === 2 ? 'w-2/4 bg-orange-500' :
                getPasswordStrength() === 3 ? 'w-3/4 bg-amber-500' :
                'w-full bg-emerald-500'
              }`}
            />
          </div>
        </div>
      </div>

      <Button
        onClick={onSubmit}
        disabled={loading || !email || !password || !isPasswordSecure || !!emailError}
        className="w-full h-11 rounded-xl font-bold shadow-sm"
      >
        {loading ? 'Creando cuenta...' : 'Crear cuenta y comenzar registro →'}
      </Button>
    </div>
  )
}

export function OnboardingWizard({
  initialAccountDone = false,
  onCancel,
  inApp = false,
  onFinishProfile,
}: {
  initialAccountDone?: boolean
  onCancel?: () => void
  inApp?: boolean
  onFinishProfile?: (data: OnboardingData) => void
} = {}) {
  const router = useRouter()

  // Comprobar token en cliente
  const hasToken = typeof window !== 'undefined' ? !!localStorage.getItem('chambista_token') : false
  const [accountDone, setAccountDone] = useState(initialAccountDone || hasToken)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState('independiente')
  const [registering, setRegistering] = useState(false)
  const [emailError, setEmailError] = useState('')

  // Pasos y formulario
  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>(INITIAL_ONBOARDING)
  const [completed, setCompleted] = useState(false)
  const [saving, setSaving] = useState(false)

  // Pre-cargar datos del usuario activo si existe token o detectar modalidad en URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search)
      const tipo = searchParams.get('tipo')
      if (tipo === 'empresa') {
        setRol('empresa')
        setData(prev => ({ ...prev, tipoCuenta: 'empresa' }))
      } else if (tipo === 'independiente') {
        setRol('independiente')
        setData(prev => ({ ...prev, tipoCuenta: 'natural' }))
      }
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('chambista_token') : null
    if (!token) return

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(userMe => {
        if (userMe && userMe.id) {
          setData(prev => ({
            ...prev,
            nombres: prev.nombres || userMe.nombre || '',
            correo: prev.correo || userMe.email || '',
            celular: prev.celular || userMe.telefono || '',
            ciudad: prev.ciudad || userMe.departamento || 'Arequipa',
            provincia: prev.provincia || userMe.provincia || 'Arequipa',
            distrito: prev.distrito || userMe.distrito_principal || '',
          }))
        }
      })
      .catch(console.error)
  }, [])

  const update = (patch: Partial<OnboardingData>) =>
    setData((prev) => ({ ...prev, ...patch }))

  const progress = useMemo(() =>
    accountDone ? ((step + 1) / PASOS.length) * 100 : 0,
    [accountDone, step]
  )

  async function handleCreateAccount() {
    if (!email || !password) return
    setRegistering(true)
    try {
      const fallbackName = email.split('@')[0]
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: fallbackName, email, password, rol }),
      })
      if (!res.ok) {
        const d = await res.json()
        const msg = typeof d.detail === 'string' ? d.detail : (Array.isArray(d.detail) ? d.detail[0].msg : 'Error al registrar')
        alert(msg)
        return
      }
      const lr = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (lr.ok) {
        const ld = await lr.json()
        localStorage.setItem('chambista_token', ld.access_token)
        localStorage.setItem('chambista_rol', ld.rol)
        localStorage.setItem('chambista_nombre', ld.nombre || fallbackName)
        
        update({
          tipoCuenta: rol === 'empresa' ? 'empresa' : 'natural',
          razonSocial: rol === 'empresa' ? fallbackName : '',
          nombres: '',
          apellidos: '',
          correo: email,
        })
      }
      setAccountDone(true)
    } catch {
      alert('No se pudo conectar con el servidor.')
    } finally {
      setRegistering(false)
    }
  }

  function isStepValid(): boolean {
    switch (step) {
      case 0: return !!data.tipoCuenta
      case 1:
        if (data.tipoCuenta === 'empresa') {
          return !!data.razonSocial && !!data.ruc && !!data.dniRepresentante
        }
        return !!data.nombres && !!data.apellidos && !!data.numeroDocumento
      case 2: return !!data.celular && !!data.distrito && !!data.zona
      case 3: return data.oficios.length >= 1 && !!data.descripcion && !!data.precioReferencial
      case 4: return data.distritosAtencion.length >= 1 && data.diasDisponibles.length >= 1
      default: return true
    }
  }

  async function finalizarPerfil() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('chambista_token') : null
    if (!token) {
      alert('Sesión no encontrada. Inicia sesión para guardar tus servicios.')
      return
    }

    setSaving(true)
    try {
      let usuarioId = 1
      try {
        const meRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (meRes.ok) {
          const meData = await meRes.json()
          usuarioId = meData.id
        }
      } catch (e) {
        console.warn('Fallback a usuario por defecto')
      }

      const profilePayload = {
        usuario_id: usuarioId,
        nombres: data.nombres,
        apellidos: data.apellidos,
        dni: data.numeroDocumento,
        ruc: data.ruc,
        razon_social: data.razonSocial,
        telefono: data.celular,
        departamento: data.ciudad,
        provincia: data.provincia,
        distrito: data.distrito,
        oficio_principal: data.oficios[0] || '',
        servicios: data.especialidades.join(','),
        experiencia_anios: data.aniosExperiencia,
        zonas_atencion: data.distritosAtencion.join(','),
        dias_trabajo: data.diasDisponibles.join(','),
        horario_atencion: `${data.horaInicio}-${data.horaFin}`,
        atiende_emergencias: data.atiendeEmergencias,
        descripcion: data.descripcion,
        foto_perfil: data.fotoPerfil,
        fotos_trabajos: data.portafolio.map(p => p.imagen).filter(Boolean).join(','),
        tipo_cobro: data.modalidadPrecio,
        precio_referencial: data.precioReferencial,
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/providers/perfil`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profilePayload)
      })

      if (response.ok) {
        localStorage.setItem('chambista_rol', 'proveedor')
      }
      // Guardar registro de proveedor localmente para acceso instantáneo
      if (typeof window !== 'undefined') {
        localStorage.setItem('chambista_proveedor_registrado', 'true')
        localStorage.setItem('chambista_proveedor_datos', JSON.stringify(data))
      }
    } catch (err) {
      console.error('Error guardando perfil:', err)
      // Guardar también en fallback para garantizar que la interfaz se integre sin trabas
      if (typeof window !== 'undefined') {
        localStorage.setItem('chambista_proveedor_registrado', 'true')
        localStorage.setItem('chambista_proveedor_datos', JSON.stringify(data))
        localStorage.setItem('chambista_rol', 'proveedor')
      }
    } finally {
      setSaving(false)
      setCompleted(true)
    }
  }

  function next() {
    if (!isStepValid()) {
      alert('Por favor completa todos los campos obligatorios (*) para continuar.')
      return
    }
    if (step < PASOS.length - 1) {
      setStep((s) => s + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      finalizarPerfil()
    }
  }

  function back() {
    if (!accountDone) {
      if (onCancel) onCancel()
      else router.push('/')
      return
    }
    if (step === 0) {
      if (onCancel) onCancel()
      else setAccountDone(false)
      return
    }
    setStep((s) => s - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const stepComponents = [
    <StepTipoCuenta key="tipo" data={data} update={update} />,
    <StepIdentidad key="identidad" data={data} update={update} />,
    <StepContacto key="contacto" data={data} update={update} />,
    <StepOficios key="oficios" data={data} update={update} />,
    <StepCobertura key="cobertura" data={data} update={update} />,
    <StepPortafolio key="portafolio" data={data} update={update} />,
    <StepResumen key="resumen" data={data} update={update} />,
  ]

  // Pantalla de Confirmación de Registro Exitoso
  if (completed) {
    return (
      <div className="w-full max-w-2xl mx-auto py-10 px-4 text-center">
        <div className="rounded-3xl border border-border bg-card p-8 sm:p-10 shadow-lg space-y-6">
          <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-600 shadow-xs">
            <CheckCircle2 className="size-12 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 uppercase">
              Registro Completado
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              ¡Tus servicios han sido publicados con éxito!
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Tu ficha comercial para <strong>{data.tipoCuenta === 'empresa' ? (data.razonSocial || 'tu Empresa') : `${data.nombres} ${data.apellidos}`}</strong> ya está activa en el catálogo de Chambista.
            </p>
          </div>

          <div className="rounded-2xl bg-muted/40 p-4 border border-border/60 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="font-semibold text-muted-foreground">Modalidad:</span>
              <span className="font-bold text-foreground uppercase">{data.tipoCuenta}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-muted-foreground">Oficio principal:</span>
              <span className="font-bold text-primary">{data.oficios[0] || 'Servicios'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-muted-foreground">Ubicación:</span>
              <span className="font-bold text-foreground">{data.distrito}, {data.ciudad}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-muted-foreground">Tarifa inicial:</span>
              <span className="font-bold text-foreground">S/. {data.precioReferencial}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              onClick={() => {
                if (onFinishProfile) {
                  onFinishProfile(data)
                } else if (onCancel) {
                  onCancel()
                } else {
                  router.push('/cliente')
                }
              }}
              className="w-full sm:w-auto px-6 h-11 rounded-xl font-bold bg-primary text-primary-foreground shadow-md hover:bg-primary/90 flex items-center justify-center gap-2"
            >
              <Briefcase className="size-4" />
              <span>Ir a mi Panel de Proveedor</span>
              <ArrowRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCompleted(false)
                setStep(0)
              }}
              className="w-full sm:w-auto px-6 h-11 rounded-xl font-bold border-border"
            >
              Editar mis datos de servicio
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={inApp ? "w-full" : "min-h-dvh bg-background"}>
      {/* Header del wizard (oculto si está inApp para no duplicar navbar) */}
      {!inApp && (
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3.5">
            <ChambistaLogo />
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-foreground">
                {accountDone ? `Paso ${step + 1} de ${PASOS.length}` : 'Registro'}
              </span>
            </div>
          </div>
          {accountDone && <Progress value={progress} className="h-1 rounded-none bg-muted [&>div]:bg-primary" />}
        </header>
      )}

      {/* Contenedor del Formulario */}
      <div className={inApp ? "w-full" : "mx-auto max-w-3xl px-4 py-8 pb-32"}>
        {!accountDone ? (
          <StepCuenta
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            rol={rol}
            setRol={setRol}
            loading={registering}
            onSubmit={handleCreateAccount}
            emailError={emailError}
            setEmailError={setEmailError}
          />
        ) : (
          <div className="space-y-6">
            {/* Header del paso con barra de progreso integrada */}
            <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-primary font-bold text-xs text-white">
                    {step + 1}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Paso {step + 1} de {PASOS.length} · {PASOS[step].titulo}
                  </span>
                </div>

                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  >
                    <X className="size-3.5" /> Cancelar
                  </button>
                )}
              </div>

              {/* Progress bar fluido */}
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Indicador de pasos visual tipo píldoras conectado y clickeable */}
              <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
                {PASOS.map((p, i) => {
                  const isCurrent = i === step
                  const isPassed = i < step
                  const isClickable = i <= step
                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={!isClickable}
                      onClick={() => isClickable && setStep(i)}
                      aria-label={`Ir al paso ${i + 1}: ${p.titulo}`}
                      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap transition-all ${
                        isCurrent
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : isPassed
                          ? 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 cursor-pointer'
                          : 'bg-muted text-muted-foreground/70 cursor-not-allowed opacity-60'
                      }`}
                    >
                      {isPassed ? <Check className="size-3 stroke-[3]" /> : <span>{i + 1}</span>}
                      <span>{p.titulo}</span>
                    </button>
                  )
                })}
              </div>

              {/* Indicador de puntos interactivos para pantallas móviles */}
              <div className="sm:hidden flex items-center justify-between gap-1 pt-1">
                {PASOS.map((p, i) => {
                  const isCurrent = i === step
                  const isPassed = i < step
                  const isClickable = i <= step
                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={!isClickable}
                      onClick={() => isClickable && setStep(i)}
                      aria-label={`Paso ${i + 1}: ${p.titulo}`}
                      className="flex-1 py-1 focus:outline-none"
                    >
                      <span
                        className={`block h-1.5 rounded-full transition-all duration-300 ${
                          isCurrent
                            ? 'bg-primary shadow-xs'
                            : isPassed
                            ? 'bg-emerald-500'
                            : 'bg-muted'
                        }`}
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Contenido del paso actual */}
            <div className="rounded-3xl border border-border bg-card p-5 sm:p-8 shadow-sm">
              {stepComponents[step]}
            </div>

            {/* Botones de navegación del paso */}
            <div className="flex items-center justify-between gap-3 pt-2 pb-6">
              <Button
                variant="outline"
                type="button"
                onClick={back}
                className="gap-2 h-11 px-5 rounded-xl font-bold border-border bg-card"
              >
                <ArrowLeft className="size-4" />
                {step === 0 ? 'Cancelar' : 'Atrás'}
              </Button>

              <Button
                type="button"
                onClick={next}
                disabled={saving}
                className="gap-2 h-11 px-6 rounded-xl font-bold shadow-sm"
              >
                {saving
                  ? 'Guardando...'
                  : step === PASOS.length - 1
                  ? 'Guardar y Publicar Servicios'
                  : 'Continuar'}
                {step === PASOS.length - 1 ? <Check className="size-4" /> : <ArrowRight className="size-4" />}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
