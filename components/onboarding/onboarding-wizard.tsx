'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff } from 'lucide-react'
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

// Step -1: Account creation
function StepCuenta({
  nombre, setNombre,
  email, setEmail,
  password, setPassword,
  rol, setRol,
  loading, onSubmit,
}: {
  nombre: string; setNombre: (v: string) => void
  email: string; setEmail: (v: string) => void
  password: string; setPassword: (v: string) => void
  rol: string; setRol: (v: string) => void
  loading: boolean; onSubmit: () => void
}) {
  const [showPass, setShowPass] = useState(false)
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Tipo de cuenta</Label>
        <div className="flex gap-2">
          {[
            { value: 'independiente', label: 'Independiente' },
            { value: 'empresa', label: 'Empresa' },
          ].map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setRol(t.value)}
              className={`flex-1 rounded-lg border-2 py-2.5 text-sm font-medium transition-colors ${
                rol === t.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-foreground hover:border-primary/40'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="oc-nombre">Nombre completo *</Label>
        <Input
          id="oc-nombre"
          placeholder="Ej. Juan Pérez"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="oc-email">Correo electrónico *</Label>
        <Input
          id="oc-email"
          type="email"
          placeholder="tucorreo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="oc-pass">Contraseña *</Label>
        <div className="relative">
          <Input
            id="oc-pass"
            type={showPass ? 'text' : 'password'}
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <Button
        onClick={onSubmit}
        disabled={loading || !nombre || !email || !password || password.length < 6}
        className="w-full"
      >
        {loading ? 'Creando cuenta...' : 'Crear cuenta y continuar →'}
      </Button>
    </div>
  )
}

export function OnboardingWizard() {
  const router = useRouter()

  // Account step state
  const [accountDone, setAccountDone] = useState(false)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState('independiente')
  const [registering, setRegistering] = useState(false)

  // Wizard steps state
  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>(INITIAL_ONBOARDING)

  const update = (patch: Partial<OnboardingData>) =>
    setData((prev) => ({ ...prev, ...patch }))

  const progress = useMemo(() =>
    accountDone ? ((step + 1) / PASOS.length) * 100 : 0,
    [accountDone, step]
  )

  async function handleCreateAccount() {
    if (!nombre || !email || !password) return
    setRegistering(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password, rol }),
      })
      if (!res.ok) {
        const d = await res.json()
        const msg = typeof d.detail === 'string' ? d.detail : (Array.isArray(d.detail) ? d.detail[0].msg : 'Error al registrar')
        alert(msg)
        return
      }
      // Auto-login
      const lr = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (lr.ok) {
        const ld = await lr.json()
        localStorage.setItem('chambista_token', ld.access_token)
        localStorage.setItem('chambista_rol', ld.rol)
        localStorage.setItem('chambista_nombre', ld.nombre || nombre)
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
    const token = localStorage.getItem('chambista_token')
    if (!token) {
      alert('Sesión expirada. Por favor, vuelve a iniciar sesión.')
      router.push('/')
      return
    }

    try {
      // Obtener el ID del usuario actual
      const meRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!meRes.ok) {
        // Si no hay /me aún funcionando, simplemente redirigimos
        router.push('/dashboard')
        return
      }

      const meData = await meRes.json()

      // Crear o actualizar el perfil de prestador con todos los datos del wizard
      const profilePayload = {
        usuario_id: meData.id,
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

      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/providers/perfil`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profilePayload)
      })
    } catch (err) {
      console.error('Error guardando perfil:', err)
    }

    router.push('/dashboard')
  }

  function next() {
    if (!isStepValid()) {
      alert('Completa los campos obligatorios para continuar.')
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
    if (!accountDone) { router.push('/'); return }
    if (step === 0) { setAccountDone(false); return }
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

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <ChambistaLogo />
          <span className="text-sm text-muted-foreground">
            {accountDone ? `Paso ${step + 1} de ${PASOS.length}` : 'Crea tu cuenta'}
          </span>
        </div>
        {accountDone && <Progress value={progress} className="h-1 rounded-none" />}
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 pb-28">
        {!accountDone ? (
          <>
            <div className="mb-6">
              <h1 className="font-heading text-2xl font-bold text-foreground">Crea tu cuenta de proveedor</h1>
              <p className="mt-1 text-muted-foreground">Primero cuéntanos quién eres para comenzar.</p>
            </div>
            <StepCuenta
              nombre={nombre} setNombre={setNombre}
              email={email} setEmail={setEmail}
              password={password} setPassword={setPassword}
              rol={rol} setRol={setRol}
              loading={registering}
              onSubmit={handleCreateAccount}
            />
          </>
        ) : (
          <>
            {/* Step indicator */}
            <ol className="mb-8 hidden flex-wrap gap-2 md:flex">
              {PASOS.map((p, i) => (
                <li
                  key={p.id}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    i === step
                      ? 'border-primary bg-primary text-primary-foreground'
                      : i < step
                        ? 'border-success/30 bg-accent text-accent-foreground'
                        : 'border-border bg-card text-muted-foreground'
                  }`}
                >
                  {i < step ? <Check className="size-3.5" /> : <span className="grid size-4 place-items-center">{i + 1}</span>}
                  {p.titulo}
                </li>
              ))}
            </ol>

            <div className="mb-2">
              <h1 className="font-heading text-2xl font-bold text-foreground text-balance">
                {PASOS[step].titulo}
              </h1>
            </div>
            <div className="mt-6">{stepComponents[step]}</div>
          </>
        )}
      </main>

      {accountDone && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
            <Button variant="ghost" onClick={back} className="gap-2">
              <ArrowLeft className="size-4" />
              {step === 0 ? 'Volver' : 'Atrás'}
            </Button>
            <Button onClick={next} className="gap-2">
              {step === PASOS.length - 1 ? 'Finalizar y entrar' : 'Continuar'}
              {step === PASOS.length - 1 ? <Check className="size-4" /> : <ArrowRight className="size-4" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
