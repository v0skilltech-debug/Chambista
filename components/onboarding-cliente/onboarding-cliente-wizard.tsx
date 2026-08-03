'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Home, MapPin, Star } from 'lucide-react'
import { ChambistaLogo } from '@/components/chambista-logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CIUDADES, DISTRITOS_LIMA, categories } from '@/lib/chambista-data'

type ClienteData = {
  nombre: string
  email: string
  password: string
  ciudad: string
  distrito: string
  zona: string
  serviciosFrecuentes: string[]
}

const PASOS_CLIENTE = [
  { id: 'cuenta', titulo: 'Crea tu cuenta', icon: Home },
  { id: 'ubicacion', titulo: 'Tu ubicación', icon: MapPin },
  { id: 'preferencias', titulo: 'Tus preferencias', icon: Star },
]

export function OnboardingClienteWizard() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [data, setData] = useState<ClienteData>({
    nombre: '',
    email: '',
    password: '',
    ciudad: 'Lima',
    distrito: '',
    zona: '',
    serviciosFrecuentes: [],
  })

  function update(patch: Partial<ClienteData>) {
    setData((prev) => ({ ...prev, ...patch }))
  }

  function toggleServicio(id: string) {
    const list = data.serviciosFrecuentes
    update({
      serviciosFrecuentes: list.includes(id)
        ? list.filter((s) => s !== id)
        : [...list, id],
    })
  }

  function isValid(): boolean {
    switch (step) {
      case 0:
        return !!data.nombre && !!data.email && data.password.length >= 6
      case 1:
        return !!data.ciudad && !!data.distrito
      default:
        return true
    }
  }

  async function handleFinish() {
    setLoading(true)
    try {
      // 1. Register
      const res = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: data.nombre,
          email: data.email,
          password: data.password,
          rol: 'cliente',
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        const msg = typeof d.detail === 'string' ? d.detail : (Array.isArray(d.detail) ? d.detail[0].msg : 'Error al registrar')
        alert(msg)
        setLoading(false)
        return
      }

      // 2. Auto-login
      const lr = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      })
      if (lr.ok) {
        const ld = await lr.json()
        localStorage.setItem('chambista_token', ld.access_token)
        localStorage.setItem('chambista_rol', ld.rol)
        localStorage.setItem('chambista_nombre', ld.nombre || data.nombre)
      }

      // 3. Save client profile
      const token = localStorage.getItem('chambista_token')
      if (token) {
        await fetch('http://localhost:8000/api/clientes/perfil', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            ciudad: data.ciudad,
            distrito: data.distrito,
            zona: data.zona,
            servicios_frecuentes: data.serviciosFrecuentes.join(','),
          }),
        }).catch(() => { /* Non-critical */ })
      }

      router.push('/cliente')
    } catch {
      alert('No se pudo conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  function next() {
    if (!isValid()) {
      alert('Completa los campos obligatorios para continuar.')
      return
    }
    if (step < PASOS_CLIENTE.length - 1) {
      setStep((s) => s + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      handleFinish()
    }
  }

  function back() {
    if (step === 0) { router.push('/'); return }
    setStep((s) => s - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const progress = ((step + 1) / PASOS_CLIENTE.length) * 100

  return (
    <div className="force-light min-h-dvh">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
          <ChambistaLogo />
          <span className="text-sm text-gray-500">Paso {step + 1} de {PASOS_CLIENTE.length}</span>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-8 pb-28">
        {/* Step pills */}
        <ol className="mb-8 flex gap-2">
          {PASOS_CLIENTE.map((p, i) => {
            const Icon = p.icon
            return (
              <li
                key={p.id}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  i === step
                    ? 'border-primary bg-primary text-primary-foreground'
                    : i < step
                      ? 'border-primary/30 bg-primary/10 text-primary'
                      : 'border-border bg-card text-muted-foreground'
                }`}
              >
                {i < step ? <Check className="size-3" /> : <Icon className="size-3" />}
                {p.titulo}
              </li>
            )
          })}
        </ol>

        <h1 className="mb-6 font-heading text-2xl font-bold text-foreground">
          {PASOS_CLIENTE[step].titulo}
        </h1>

        {/* ─── Step 0: Account ─── */}
        {step === 0 && (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">
              Crea tu cuenta de cliente para encontrar profesionales de confianza.
            </p>
            <div className="space-y-2">
              <Label htmlFor="cl-nombre">Nombre completo *</Label>
              <Input
                id="cl-nombre"
                placeholder="Ej. María García"
                value={data.nombre}
                onChange={(e) => update({ nombre: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cl-email">Correo electrónico *</Label>
              <Input
                id="cl-email"
                type="email"
                placeholder="tucorreo@ejemplo.com"
                value={data.email}
                onChange={(e) => update({ email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cl-pass">Contraseña *</Label>
              <div className="relative">
                <Input
                  id="cl-pass"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={data.password}
                  onChange={(e) => update({ password: e.target.value })}
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
          </div>
        )}

        {/* ─── Step 1: Location ─── */}
        {step === 1 && (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">
              Así podremos mostrarte profesionales disponibles cerca de ti.
            </p>

            <div className="space-y-2">
              <Label>Ciudad *</Label>
              <div className="flex flex-wrap gap-2">
                {CIUDADES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => update({ ciudad: c })}
                    className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                      data.ciudad === c
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-foreground hover:border-primary/40'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Distrito *</Label>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                {DISTRITOS_LIMA.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => update({ distrito: d })}
                    className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                      data.distrito === d
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-foreground hover:border-primary/40'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cl-zona">Urbanización / zona (opcional)</Label>
              <Input
                id="cl-zona"
                placeholder="Ej. Higuereta, Camacho..."
                value={data.zona}
                onChange={(e) => update({ zona: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* ─── Step 2: Preferences ─── */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              ¿Qué tipo de servicios sueles necesitar? (Opcional, selecciona los que quieras)
            </p>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon
                const active = data.serviciosFrecuentes.includes(cat.id)
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleServicio(cat.id)}
                    className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                      active
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card hover:border-primary/40'
                    }`}
                  >
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: cat.color + '20', color: cat.color }}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="text-xs font-medium text-foreground">{cat.label}</span>
                    {active && <Check className="ml-auto size-3.5 text-primary" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* Bottom nav */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4 px-4 py-3">
          <Button variant="ghost" onClick={back} className="gap-2">
            <ArrowLeft className="size-4" />
            {step === 0 ? 'Salir' : 'Atrás'}
          </Button>
          <Button onClick={next} disabled={loading} className="gap-2">
            {loading
              ? 'Creando cuenta...'
              : step === PASOS_CLIENTE.length - 1
                ? '¡Empezar a buscar!'
                : 'Continuar'}
            {!loading && (step === PASOS_CLIENTE.length - 1
              ? <Check className="size-4" />
              : <ArrowRight className="size-4" />)}
          </Button>
        </div>
      </div>
    </div>
  )
}
