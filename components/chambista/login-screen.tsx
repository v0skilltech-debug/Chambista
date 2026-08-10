"use client"

import { useState } from "react"
import { Hammer, Mail, Lock, ShieldCheck, Star, Clock } from "lucide-react"

type Props = {
  onLogin: (user: { name: string, rol: string }) => void
}

export function LoginScreen({ onLogin }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [accountType, setAccountType] = useState<"cliente" | "independiente" | "empresa">("cliente")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [ruc, setRuc] = useState("")
  const [razonSocial, setRazonSocial] = useState("")
  const [representante, setRepresentante] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password || (mode === "register" && !name)) {
      setError("Completa todos los campos para continuar.")
      return
    }
    setError("")
    
    try {
      if (mode === "register") {
        const payload = {
          nombre: name,
          email,
          password,
          telefono: "000000000",
          rol: accountType,
          ruc: accountType === "empresa" ? ruc : undefined,
          razon_social: accountType === "empresa" ? razonSocial : undefined,
          representante: accountType === "empresa" ? representante : undefined
        }
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.detail || "Error en el registro")
        }
        // Auto login after register
        setMode("login")
        setError("Registro exitoso. Iniciando sesión...")
      }

      // Login
      const resLogin = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }) 
      })
      
      if (!resLogin.ok) {
        const data = await resLogin.json()
        throw new Error(data.detail || "Credenciales incorrectas")
      }
      
      const data = await resLogin.json()
      localStorage.setItem("chambista_token", data.access_token)
      
      const displayName = data.nombre || email.split("@")[0]
      onLogin({
        name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
        rol: data.rol
      })
    } catch (err: any) {
      setError(err.message || "Ocurrió un error. Verifica que el backend esté ejecutándose.")
    }
  }

  return (
    <main className="flex min-h-dvh flex-col bg-background">
      <section className="relative flex flex-col gap-6 overflow-hidden bg-primary px-6 pb-10 pt-12 text-primary-foreground">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary-foreground/15">
            <Hammer className="size-5" aria-hidden="true" />
          </span>
          <span className="font-sans text-xl font-extrabold tracking-tight">Chambista</span>
        </div>
        <div className="max-w-sm">
          <h1 className="text-balance font-sans text-3xl font-extrabold leading-tight">
            Profesionales de confianza para tu hogar
          </h1>
          <p className="mt-2 text-pretty text-sm text-primary-foreground/80">
            Plomeros, electricistas, técnicos y más, a un solo toque de distancia.
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-primary-foreground/90">
          <li className="flex items-center gap-1.5">
            <ShieldCheck className="size-4" aria-hidden="true" /> Verificados
          </li>
          <li className="flex items-center gap-1.5">
            <Star className="size-4" aria-hidden="true" /> Bien calificados
          </li>
          <li className="flex items-center gap-1.5">
            <Clock className="size-4" aria-hidden="true" /> Respuesta rápida
          </li>
        </ul>
      </section>

      <section className="flex flex-1 flex-col px-6 pb-8 pt-8">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex rounded-xl bg-muted p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                mode === "login" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                mode === "register" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Crear cuenta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            {mode === "register" && (
              <>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-foreground">Tipo de Cuenta</span>
                  <div className="flex rounded-xl bg-muted p-1">
                    <button type="button" onClick={() => setAccountType("cliente")} className={`flex-1 rounded-lg py-1.5 text-xs font-semibold ${accountType === "cliente" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>Cliente</button>
                    <button type="button" onClick={() => setAccountType("independiente")} className={`flex-1 rounded-lg py-1.5 text-xs font-semibold ${accountType === "independiente" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>Independiente</button>
                    <button type="button" onClick={() => setAccountType("empresa")} className={`flex-1 rounded-lg py-1.5 text-xs font-semibold ${accountType === "empresa" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>Empresa</button>
                  </div>
                </label>

                {accountType === "empresa" ? (
                  <>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-sm font-semibold text-foreground">RUC</span>
                      <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-3">
                        <input value={ruc} onChange={(e) => setRuc(e.target.value)} placeholder="Número de RUC (11 dígitos)" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
                      </div>
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-sm font-semibold text-foreground">Razón Social</span>
                      <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-3">
                        <input value={razonSocial} onChange={(e) => setRazonSocial(e.target.value)} placeholder="Razón Social" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
                      </div>
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-sm font-semibold text-foreground">Representante Legal</span>
                      <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-3">
                        <input value={representante} onChange={(e) => setRepresentante(e.target.value)} placeholder="Nombre del representante" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
                      </div>
                    </label>
                  </>
                ) : (
                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-semibold text-foreground">Nombre</span>
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-3">
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Tu nombre"
                        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      />
                    </div>
                  </label>
                )}
              </>
            )}
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-foreground">Correo electrónico</span>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-3">
                <Mail className="size-4 text-muted-foreground" aria-hidden="true" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-foreground">Contraseña</span>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-3">
                <Lock className="size-4 text-muted-foreground" aria-hidden="true" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            </label>

            {error && (
              <p className="text-sm font-medium text-destructive" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="mt-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition active:scale-[0.99]"
            >
              {mode === "login" ? "Entrar" : "Crear mi cuenta"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Al continuar aceptas los Términos y la Política de Privacidad de Chambista.
          </p>
        </div>
      </section>
    </main>
  )
}
