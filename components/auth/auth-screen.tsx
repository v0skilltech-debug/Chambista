'use client'

import type React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, ShieldCheck, Star, Users } from 'lucide-react'
import { ChambistaLogo } from '@/components/chambista-logo'
import { GoogleIcon } from '@/components/google-icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function AuthScreen() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [accountType, setAccountType] = useState<"cliente" | "independiente" | "empresa">("cliente")
  const [loginError, setLoginError] = useState("")
  const [emailHint, setEmailHint] = useState("")

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    try {
      const payload = {
        nombre: name,
        email,
        password,
        rol: accountType
        // telefono is optional, omitted on purpose
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const data = await res.json()
        const errMsg = typeof data.detail === 'string' ? data.detail : (Array.isArray(data.detail) ? data.detail[0].msg : "Error en el registro")
        throw new Error(errMsg)
      }

      // Auto login inmediato
      const loginRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
      if (!loginRes.ok) throw new Error("Error al iniciar sesión automático")
      const loginData = await loginRes.json()
      localStorage.setItem("chambista_token", loginData.access_token)
      localStorage.setItem("chambista_rol", loginData.rol)
      localStorage.setItem("chambista_nombre", loginData.nombre || name)

      // Clientes van a la app de cliente; proveedores completan su perfil en onboarding
      if (accountType === "cliente") {
        router.push('/cliente')
      } else {
        router.push('/onboarding')
      }
    } catch (err: any) {
      alert(err.message || "Error al registrar")
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError("")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
      if (!res.ok) {
        const data = await res.json()
        const errMsg = typeof data.detail === 'string' ? data.detail : (Array.isArray(data.detail) ? data.detail[0].msg : "Credenciales incorrectas")
        throw new Error(errMsg)
      }
      const data = await res.json()
      localStorage.setItem("chambista_token", data.access_token)
      localStorage.setItem("chambista_rol", data.rol)
      localStorage.setItem("chambista_nombre", data.nombre || email.split("@")[0])

      // Redirigir segun rol
      if (data.rol === "cliente") {
        router.push('/cliente')
      } else if (data.rol === "trabajador" || data.rol === "independiente" || data.rol === "empresa" || data.rol === "proveedor") {
        router.push('/dashboard')
      } else {
        router.push('/cliente') // default
      }
    } catch (err: any) {
      setLoginError(err.message || "Error al iniciar sesión")
    }
  }

  function handleGoogle(destination: string) {
    // Google auth no implementado - mostrar mensaje informativo
    alert("El inicio de sesión con Google no está disponible aún. Usa tu correo y contraseña.")
  }

  const accountTypes = [
    {
      id: 'cliente',
      title: 'Cliente',
      desc: 'Busco profesionales para mi hogar',
      emoji: '🏠',
      href: '/onboarding-cliente',
    },
    {
      id: 'independiente',
      title: 'Independiente',
      desc: 'Ofrezco mis servicios como persona natural',
      emoji: '🛠️',
      href: '/onboarding',
    },
    {
      id: 'empresa',
      title: 'Empresa',
      desc: 'Tengo un negocio y quiero captar más clientes',
      emoji: '🏢',
      href: '/onboarding',
    },
  ]

  return (
    <main className="flex min-h-dvh flex-col lg:flex-row">
      <section className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <Image
          src="/images/auth-hero.png"
          alt="Proveedor de servicios para el hogar sonriendo con sus herramientas"
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="relative z-10">
          <ChambistaLogo className="[&_span:last-child]:text-primary-foreground" />
        </div>
        <div className="relative z-10 space-y-6">
          <h1 className="font-heading text-4xl font-bold leading-tight text-balance">
            La chamba llega a ti, no al revés.
          </h1>
          <p className="max-w-md text-lg text-primary-foreground/90 leading-relaxed">
            Únete a la red de profesionales de confianza para el hogar.
          </p>
          <div className="flex flex-wrap gap-6 pt-2">
            <div className="flex items-center gap-2">
              <Users className="size-5" aria-hidden="true" />
              <span className="text-sm font-medium">+12,000 usuarios</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="size-5" aria-hidden="true" />
              <span className="text-sm font-medium">4.8 de valoración</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5" aria-hidden="true" />
              <span className="text-sm font-medium">Perfiles verificados</span>
            </div>
          </div>
        </div>
      </section>

      <section className="flex w-full flex-1 items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <ChambistaLogo />
          </div>

          <div className="mb-6">
            <h2 className="font-heading text-2xl font-bold text-foreground">Bienvenido a Chambista</h2>
            <p className="mt-1 text-muted-foreground">
              Ingresa o regístrate para continuar.
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
              <TabsTrigger value="register">Crear cuenta</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <Button type="button" variant="outline" className="w-full gap-2 bg-transparent" onClick={() => handleGoogle('/dashboard')}>
                <GoogleIcon className="size-4" /> Continuar con Google
              </Button>
              <Divider />
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Correo electrónico</Label>
                  <Input 
                    id="login-email" 
                    type="email" 
                    value={email} 
                    onChange={e => { setEmail(e.target.value); setLoginError(""); setEmailHint("") }} 
                    onBlur={async () => {
                      if (email && email.includes("@")) {
                        try {
                          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/check-email?email=${encodeURIComponent(email)}`)
                          const data = await res.json()
                          if (!data.exists) {
                            setEmailHint("Este correo no está registrado. ¿Quieres crear una cuenta?")
                          } else {
                            setEmailHint("")
                          }
                        } catch (e) {}
                      }
                    }}
                    placeholder="tucorreo@ejemplo.com" 
                    required 
                  />
                  {emailHint && (
                    <p className="text-xs text-amber-500">{emailHint}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Contraseña</Label>
                  </div>
                  <PasswordInput id="login-password" value={password} onChange={e => setPassword(e.target.value)} show={showPassword} onToggle={() => setShowPassword((v) => !v)} placeholder="Tu contraseña" />
                </div>
                {loginError && (
                  <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{loginError}</p>
                )}
                <Button type="submit" className="w-full">Iniciar sesión</Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="mt-6">
              <p className="mb-4 text-sm text-muted-foreground text-center">¿Cómo quieres usar Chambista?</p>
              <div className="flex flex-col gap-3">
                {accountTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => router.push(type.href)}
                    className="flex items-center gap-4 rounded-xl border-2 border-border bg-card p-4 text-left transition-all hover:border-primary hover:bg-primary/5 active:scale-[0.98]"
                  >
                    <span className="text-3xl">{type.emoji}</span>
                    <div>
                      <p className="font-semibold text-foreground">{type.title}</p>
                      <p className="text-xs text-muted-foreground">{type.desc}</p>
                    </div>
                    <span className="ml-auto text-muted-foreground">›</span>
                  </button>
                ))}
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </section>
    </main>
  )
}

function Divider() {
  return (
    <div className="my-5 flex items-center gap-3">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs text-muted-foreground">o con tu correo</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}

function PasswordInput({ id, show, onToggle, placeholder, value, onChange }: { id: string, show: boolean, onToggle: () => void, placeholder?: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="relative">
      <Input id={id} type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder} required />
      <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}
