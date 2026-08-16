'use client'

import type React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowRight, ShieldCheck, Star, Users, Zap } from 'lucide-react'
import { ChambistaLogo } from '@/components/chambista-logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function AuthScreen() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loginError, setLoginError] = useState('')
  const [emailHint, setEmailHint] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        const errMsg = typeof data.detail === 'string' ? data.detail : (Array.isArray(data.detail) ? data.detail[0].msg : 'Credenciales incorrectas')
        throw new Error(errMsg)
      }
      const data = await res.json()
      localStorage.setItem('chambista_token', data.access_token)
      localStorage.setItem('chambista_rol', data.rol)
      localStorage.setItem('chambista_nombre', data.nombre || email.split('@')[0])

      if (data.rol === 'cliente') {
        router.push('/cliente')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setLoginError(err.message || 'Error al iniciar sesión')
    }
  }

  const accountTypes = [
    {
      id: 'cliente',
      title: 'Soy cliente',
      desc: 'Busco profesionales para mi hogar',
      emoji: '🏠',
      href: '/onboarding-cliente',
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'independiente',
      title: 'Soy independiente',
      desc: 'Ofrezco mis servicios como persona natural',
      emoji: '🛠️',
      href: '/onboarding',
      color: 'from-orange-500 to-orange-600',
    },
    {
      id: 'empresa',
      title: 'Tengo una empresa',
      desc: 'Quiero captar más clientes para mi negocio',
      emoji: '🏢',
      href: '/onboarding',
      color: 'from-purple-500 to-purple-600',
    },
  ]

  return (
    <main className="flex min-h-dvh flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <ChambistaLogo />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('login')}
            className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${tab === 'login' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => setTab('register')}
            className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${tab === 'register' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Crear cuenta
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Left Panel - Hero */}
        <section className="relative flex flex-col justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-10 py-16 lg:w-1/2 lg:min-h-full">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)', backgroundSize: '32px 32px'}} />
          </div>

          <div className="relative z-10 max-w-lg">
            {/* Pill badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
              La forma más simple de resolverlo
            </div>

            <h1 className="font-bold text-white leading-tight text-4xl lg:text-5xl mb-4">
              Conecta con quien{' '}
              <span className="text-secondary">sí sabe hacerlo.</span>
            </h1>
            <p className="text-blue-200/80 text-lg leading-relaxed mb-8">
              Encuentra profesionales confiables para todo lo que necesitas. Sin vueltas, sin perder tiempo.
            </p>

            {/* Social proof */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex -space-x-2">
                {['ML','CM','AT','+'].map((init, i) => (
                  <div key={i} className={`flex size-9 items-center justify-center rounded-full border-2 border-slate-900 text-xs font-bold text-white ${i === 3 ? 'bg-primary' : 'bg-gradient-to-br from-blue-400 to-blue-600'}`}>
                    {init}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex text-secondary text-sm">{'★'.repeat(5)}</div>
                <p className="text-blue-200/70 text-xs">Más de 2,000 personas ya confían en Chambista</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: ShieldCheck, label: 'Profesionales verificados', value: '500+' },
                { icon: Zap, label: 'Respuesta rápida', value: '30min' },
                { icon: Star, label: 'Calificación', value: '4.8★' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                  <stat.icon className="size-4 text-secondary mb-1" />
                  <p className="text-white font-bold text-lg leading-none">{stat.value}</p>
                  <p className="text-blue-200/60 text-[10px] mt-0.5 leading-tight">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Panel - Forms */}
        <section className="flex w-full flex-1 items-center justify-center p-6 lg:w-1/2 bg-white">
          <div className="w-full max-w-md">
            {tab === 'login' ? (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-foreground">Bienvenido de nuevo</h2>
                  <p className="mt-1 text-muted-foreground">Ingresa a tu cuenta para continuar.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Correo electrónico</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setLoginError(''); setEmailHint('') }}
                      onBlur={async () => {
                        if (email && email.includes('@')) {
                          try {
                            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/check-email?email=${encodeURIComponent(email)}`)
                            const data = await res.json()
                            if (!data.exists) setEmailHint('Este correo no está registrado. ¿Quieres crear una cuenta?')
                            else setEmailHint('')
                          } catch (e) {}
                        }
                      }}
                      placeholder="tucorreo@ejemplo.com"
                      required
                      className="h-12 rounded-xl border-border bg-muted/30 focus:bg-white"
                    />
                    {emailHint && <p className="text-xs text-amber-500">{emailHint}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Tu contraseña"
                        required
                        className="h-12 rounded-xl border-border bg-muted/30 focus:bg-white"
                      />
                      <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                  {loginError && (
                    <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{loginError}</p>
                  )}
                  <Button type="submit" size="lg" className="w-full gap-2">
                    Iniciar sesión <ArrowRight className="size-4" />
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  ¿No tienes cuenta?{' '}
                  <button onClick={() => setTab('register')} className="font-semibold text-primary hover:underline">
                    Crear cuenta gratis
                  </button>
                </p>
              </>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-foreground">¿Cómo quieres usar Chambista?</h2>
                  <p className="mt-1 text-muted-foreground">Elige tu tipo de cuenta para comenzar.</p>
                </div>

                <div className="flex flex-col gap-3">
                  {accountTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => router.push(type.href)}
                      className="group flex items-center gap-4 rounded-2xl border-2 border-border bg-white p-4 text-left transition-all hover:border-primary hover:shadow-md hover:shadow-primary/10 active:scale-[0.98]"
                    >
                      <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${type.color} text-2xl shadow-sm`}>
                        {type.emoji}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{type.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{type.desc}</p>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                    </button>
                  ))}
                </div>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  ¿Ya tienes cuenta?{' '}
                  <button onClick={() => setTab('login')} className="font-semibold text-primary hover:underline">
                    Iniciar sesión
                  </button>
                </p>
              </>
            )}
          </div>
        </section>
      </div>

      {/* Bottom trust bar */}
      <div className="border-t border-border bg-muted/30 py-4">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-6 px-6 text-xs text-muted-foreground">
          {[
            { icon: ShieldCheck, text: 'Profesionales verificados' },
            { icon: Zap, text: 'Respuestas rápidas' },
            { icon: Star, text: 'Calificaciones reales' },
            { icon: Users, text: 'Hecho para tu comunidad' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon className="size-3.5 text-primary" />
              {text}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}


