'use client'

import type React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowRight, ShieldCheck, Star, Users, Zap, Home, Wrench, Building2 } from 'lucide-react'
import { ChambistaLogo } from '@/components/chambista-logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const HERO_SLIDES = [
  {
    src: '/providers/alonso-medina.png',
    label: 'Gasfitería',
    caption: 'Instalaciones y reparaciones rápidas con especialistas verificados',
  },
  {
    src: '/providers/camila-vargas.png',
    label: 'Electricidad',
    caption: 'Instalaciones seguras y tableros certificados para tu tranquilidad',
  },
  {
    src: '/providers/jorge-delgado.png',
    label: 'Carpintería',
    caption: 'Muebles a medida, melamina y acabados de primera calidad',
  },
  {
    src: '/providers/elena-rivera.png',
    label: 'Limpieza',
    caption: 'Hogares y oficinas relucientes con profesionales de confianza',
  },
  {
    src: '/providers/bruno-caceres.png',
    label: 'Cerrajería',
    caption: 'Aperturas de emergencia, chapas de seguridad y copias al instante',
  },
  {
    src: '/providers/lucas-condori.png',
    label: 'Pintura',
    caption: 'Acabados perfectos e interiores renovados sin complicaciones',
  },
]

export function AuthScreen() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loginError, setLoginError] = useState('')
  const [emailHint, setEmailHint] = useState('')
  const [slideIndex, setSlideIndex] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 4500)
  }

  // Auto-advance carousel smoothly
  useEffect(() => {
    startTimer()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Detect active session and synchronize across browser tabs
  useEffect(() => {
    const checkSession = () => {
      if (typeof window === 'undefined') return
      const token = localStorage.getItem('chambista_token')
      const rol = localStorage.getItem('chambista_rol')
      if (token && rol) {
        if (rol === 'cliente') router.push('/cliente')
        else router.push('/dashboard')
      }
    }
    checkSession()
    window.addEventListener('storage', checkSession)
    return () => window.removeEventListener('storage', checkSession)
  }, [router])

  const goToSlide = (index: number) => {
    setSlideIndex(index)
    startTimer()
  }

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
      icon: <Home className="size-6 text-white" />,
      href: '/onboarding-cliente',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      id: 'independiente',
      title: 'Soy independiente',
      desc: 'Ofrezco mis servicios como persona natural',
      icon: <Wrench className="size-6 text-white" />,
      href: '/onboarding?tipo=independiente',
      color: 'from-orange-500 to-amber-600',
    },
    {
      id: 'empresa',
      title: 'Tengo una empresa',
      desc: 'Quiero captar más clientes para mi negocio',
      icon: <Building2 className="size-6 text-white" />,
      href: '/onboarding?tipo=empresa',
      color: 'from-purple-500 to-violet-600',
    },
  ]

  const currentSlide = HERO_SLIDES[slideIndex]

  return (
    <main className="flex min-h-dvh flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <ChambistaLogo />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${tab === 'login' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${tab === 'register' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Crear cuenta
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* ── Left Panel: Image Carousel con puntos y transición suave ── */}
        <section className="relative hidden lg:flex lg:w-1/2 overflow-hidden bg-[#0e1b5b]">
          {/* Slide images con crossfade CSS puro sin parpadeo blanco */}
          {HERO_SLIDES.map((slide, i) => (
            <img
              key={slide.src}
              src={slide.src}
              alt={slide.label}
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out"
              style={{
                opacity: i === slideIndex ? 1 : 0,
                pointerEvents: i === slideIndex ? 'auto' : 'none',
              }}
            />
          ))}

          {/* Dark overlay gradient con Azul Marino Oficial (#0E1B5B) */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1b5b]/95 via-[#0e1b5b]/60 to-[#0e1b5b]/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0e1b5b]/50 to-transparent" />

          {/* Top-left: Logo oficial Chambista */}
          <div className="absolute top-8 left-8 z-10 flex items-center rounded-2xl bg-white/95 px-4 py-2 shadow-lg backdrop-blur-md">
            <img
              src="/logo-chambista-oficial.png"
              alt="Chambista"
              className="h-7 w-auto object-contain"
            />
          </div>

          {/* Bottom content */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-8">
            {/* Category pill */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-all duration-300">
              <span className="size-2 rounded-full bg-[#ff8a00] animate-pulse" />
              {currentSlide.label} · Lima y Arequipa, Perú
            </div>

            <h2 className="text-3xl font-bold text-white leading-tight mb-1 min-h-[72px] transition-all duration-300">
              {currentSlide.caption}
            </h2>
            <p className="text-white/80 text-sm leading-relaxed mb-5">
              Conecta con quien sí sabe hacerlo. Sin vueltas, sin perder tiempo.
            </p>

            {/* Social proof avatars con fotos reales de especialistas */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex -space-x-2">
                {['/providers/mateo-quispe.png', '/providers/paola-mamani.png', '/providers/renata-paredes.png'].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="Especialista Chambista"
                    className="size-8 rounded-full border-2 border-white object-cover shadow-sm"
                  />
                ))}
                <div className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-[#ff8a00] text-[11px] font-bold text-white shadow-sm">
                  +14
                </div>
              </div>
              <div>
                <div className="flex text-[#ff8a00] text-xs">{'★'.repeat(5)}</div>
                <p className="text-white/70 text-[11px]">+2,000 personas confían en Chambista</p>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { label: '500+', sub: 'Profesionales verificados' },
                { label: '30min', sub: 'Respuesta promedio' },
                { label: '4.8★', sub: 'Calificación general' },
              ].map(s => (
                <div key={s.sub} className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 backdrop-blur-sm">
                  <p className="text-white font-bold text-base leading-none">{s.label}</p>
                  <p className="text-white/55 text-[10px] mt-0.5 leading-tight">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Slide dots interactivos y conectados */}
            <div className="flex items-center gap-1 py-1">
              {HERO_SLIDES.map((slide, i) => {
                const isActive = i === slideIndex
                return (
                  <button
                    key={slide.src}
                    type="button"
                    onClick={() => goToSlide(i)}
                    aria-label={`Ver ${slide.label} (${i + 1} de ${HERO_SLIDES.length})`}
                    className="group flex items-center justify-center p-2 focus:outline-none"
                  >
                    <span
                      className={`block h-2 rounded-full transition-all duration-300 ${
                        isActive
                          ? 'bg-[#ff8a00] w-7 shadow-xs'
                          : 'bg-white/40 group-hover:bg-white/80 w-2'
                      }`}
                    />
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Right Panel - Forms */}
        <section className="flex w-full flex-1 items-center justify-center p-6 lg:w-1/2 bg-white">
          <div className="w-full max-w-md">
            {/* Mobile Slider Preview con Puntos */}
            <div className="lg:hidden mb-6 overflow-hidden rounded-2xl relative bg-[#0e1b5b] p-4 text-white shadow-md">
              <div className="flex items-center gap-3">
                <img
                  src={currentSlide.src}
                  alt={currentSlide.label}
                  className="size-16 rounded-xl object-cover border-2 border-white/20 shrink-0 shadow-xs"
                />
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white mb-1">
                    <span className="size-1.5 rounded-full bg-[#ff8a00] animate-pulse" />
                    {currentSlide.label}
                  </span>
                  <p className="text-xs font-semibold leading-snug line-clamp-2 text-white/90">
                    {currentSlide.caption}
                  </p>
                </div>
              </div>

              {/* Mobile Slide dots */}
              <div className="mt-3 flex items-center justify-center gap-1 border-t border-white/10 pt-2">
                {HERO_SLIDES.map((slide, i) => (
                  <button
                    key={slide.src}
                    type="button"
                    onClick={() => goToSlide(i)}
                    aria-label={`Ver ${slide.label}`}
                    className="p-1.5 focus:outline-none"
                  >
                    <span
                      className={`block h-1.5 rounded-full transition-all duration-300 ${
                        i === slideIndex ? 'bg-[#ff8a00] w-6' : 'bg-white/40 w-1.5'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {tab === 'login' ? (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-foreground">Bienvenido de nuevo</h2>
                  <p className="mt-1 text-muted-foreground">Ingresa a tu cuenta para continuar.</p>
                </div>

                <form onSubmit={handleLogin} action="#" method="POST" className="space-y-5">
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
                          } catch (e) { }
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

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-muted-foreground font-semibold">o explora sin cuenta</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem('chambista_rol', 'cliente')
                      localStorage.setItem('chambista_nombre', 'Cliente Invitado')
                      router.push('/cliente')
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 py-3 text-sm font-bold text-primary transition hover:bg-primary/10 active:scale-[0.98]"
                  >
                    <span>Explorar como Cliente</span>
                    <ArrowRight className="size-4" />
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  ¿No tienes cuenta?{' '}
                  <button type="button" onClick={() => setTab('register')} className="font-semibold text-primary hover:underline">
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
                      type="button"
                      onClick={() => router.push(type.href)}
                      className="group flex items-center gap-4 rounded-2xl border-2 border-border bg-white p-4 text-left transition-all hover:border-primary hover:shadow-md hover:shadow-primary/10 active:scale-[0.98]"
                    >
                      <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${type.color} shadow-sm`}>
                        {type.icon}
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
                  <button type="button" onClick={() => setTab('login')} className="font-semibold text-primary hover:underline">
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


