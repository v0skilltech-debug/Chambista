"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User, Briefcase, Calendar, FileText, CheckCircle, UploadCloud } from "lucide-react";

const PERU_LOCATIONS: Record<string, string[]> = {
  Lima: ["Miraflores", "San Isidro", "Surco", "La Molina", "San Borja", "Barranco", "Magdalena", "San Miguel"],
  Arequipa: ["Yanahuara", "Cayma", "Cerro Colorado", "Selva Alegre"],
  Trujillo: ["Huanchaco", "Moche", "Victor Larco"],
  Cusco: ["Wanchaq", "San Sebastian", "San Jeronimo"],
  Piura: ["Castilla", "Catacaos", "Sullana"]
};
export default function RegistroProveedor() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nombre: "", dni: "", celular: "", correo: "", ciudad: "", distrito: "",
    oficio: "", servicios: "", experiencia: "", zonas: "",
    dias: "", horario: "", emergencias: false,
    descripcion: "",
    cobro: "", precio: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/api/providers/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.correo,
          password: "password123", // temporal para MVP
          telefono: formData.celular,
          dni: formData.dni,
          ciudad: formData.ciudad,
          distrito_principal: formData.distrito,
          oficio_principal: formData.oficio,
          servicios: formData.servicios,
          experiencia_anios: formData.experiencia,
          zonas_atencion: formData.zonas,
          dias_trabajo: formData.dias,
          horario_atencion: formData.horario,
          atiende_emergencias: formData.emergencias,
          descripcion: formData.descripcion,
          tipo_cobro: formData.cobro,
          precio_referencial: formData.precio
        }),
      });

      if (response.ok) {
        alert("¡Registro completado con éxito! Bienvenido a Chambista.");
        // Redirect or update local storage
        localStorage.setItem("chambista_rol", "proveedor");
        window.location.href = "/dashboard";
      } else {
        const errorData = await response.json();
        alert("Error en el registro: " + (errorData.detail || "Intenta nuevamente"));
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  const InputField = ({ label, name, type = "text", placeholder = "" }: any) => (
    <div className="flex flex-col space-y-1.5 mb-4">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <input
        type={type}
        name={name}
        value={(formData as any)[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
        required
      />
    </div>
  );

  return (
    <div className="force-light min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 animate-in fade-in zoom-in duration-500">
        
        {/* Header & Progress */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-center text-orange-500 mb-2">Registro de Proveedor</h1>
          <p className="text-gray-500 text-center text-sm mb-6">Únete a Chambista en menos de 5 minutos</p>
          
          <div className="flex justify-between items-center relative">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-muted z-0">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-in-out" 
                style={{ width: `${((step - 1) / 4) * 100}%` }}
              ></div>
            </div>
            {[
              { icon: <User size={18} />, label: "Identidad" },
              { icon: <Briefcase size={18} />, label: "Servicio" },
              { icon: <Calendar size={18} />, label: "Disponibilidad" },
              { icon: <FileText size={18} />, label: "Perfil" },
              { icon: <CheckCircle size={18} />, label: "Verificación" }
            ].map((s, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                  step > i + 1 ? 'bg-primary text-primary-foreground' : 
                  step === i + 1 ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : 
                  'bg-muted text-muted-foreground'
                }`}>
                  {s.icon}
                </div>
                <span className="text-xs mt-2 hidden sm:block font-medium text-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Form */}
        <form onSubmit={step === 5 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
          <div className="min-h-[300px]">
            {step === 1 && (
              <div className="space-y-2 animate-in slide-in-from-right-4 duration-300">
                <h2 className="text-lg font-semibold mb-4 text-primary flex items-center gap-2"><User size={20}/> Datos Personales</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Nombre completo" name="nombre" placeholder="Ej. Juan Pérez" />
                  <InputField label="DNI o Documento" name="dni" placeholder="Ej. 12345678" />
                  <InputField label="Número de Celular" name="celular" type="tel" placeholder="Ej. 999 888 777" />
                  <InputField label="Correo Electrónico" name="correo" type="email" placeholder="ejemplo@correo.com" />
                  <div className="flex flex-col space-y-1.5 mb-4">
                    <label className="text-sm font-medium text-foreground">Ciudad</label>
                    <select name="ciudad" value={formData.ciudad} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <option value="">Selecciona una ciudad</option>
                      {Object.keys(PERU_LOCATIONS).map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col space-y-1.5 mb-4">
                    <label className="text-sm font-medium text-foreground">Distrito principal</label>
                    <select name="distrito" value={formData.distrito} onChange={handleChange} disabled={!formData.ciudad} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50">
                      <option value="">Selecciona un distrito</option>
                      {formData.ciudad && PERU_LOCATIONS[formData.ciudad]?.map(dist => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-2 animate-in slide-in-from-right-4 duration-300">
                <h2 className="text-lg font-semibold mb-4 text-primary flex items-center gap-2"><Briefcase size={20}/> Información del Servicio</h2>
                <div className="space-y-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium">¿Cuál es tu oficio principal?</label>
                    <select name="oficio" value={formData.oficio} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <option value="">Selecciona un oficio</option>
                      <option value="Electricista">Electricista</option>
                      <option value="Gasfitero">Gasfitero</option>
                      <option value="Carpintero">Carpintero</option>
                      <option value="Pintor">Pintor</option>
                      <option value="Limpieza">Limpieza</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <InputField label="¿Qué servicios realizas? (Separados por coma)" name="servicios" placeholder="Ej. Instalación de luces, Cableado..." />
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium">¿Cuántos años de experiencia tienes?</label>
                    <select name="experiencia" value={formData.experiencia} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <option value="">Selecciona</option>
                      <option value="Menos de 1 año">Menos de 1 año</option>
                      <option value="1-3 años">1-3 años</option>
                      <option value="4-7 años">4-7 años</option>
                      <option value="Más de 7 años">Más de 7 años</option>
                    </select>
                  </div>
                  <InputField label="¿En qué distritos o zonas brindas atención?" name="zonas" placeholder="Ej. Miraflores, San Isidro, Surco" />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-2 animate-in slide-in-from-right-4 duration-300">
                <h2 className="text-lg font-semibold mb-4 text-primary flex items-center gap-2"><Calendar size={20}/> Disponibilidad</h2>
                <div className="space-y-4">
                  <InputField label="¿Qué días trabajas? (Ej. Lunes a Viernes)" name="dias" placeholder="LUN, MAR, MIE..." />
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium">¿En qué horario sueles atender?</label>
                    <select name="horario" value={formData.horario} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <option value="">Selecciona un horario</option>
                      <option value="Mañana">Mañana</option>
                      <option value="Tarde">Tarde</option>
                      <option value="Noche">Noche</option>
                      <option value="Todo el dia">Todo el día</option>
                    </select>
                  </div>
                  <label className="flex items-center space-x-2 p-4 border border-input rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                    <input type="checkbox" name="emergencias" checked={formData.emergencias} onChange={handleChange} className="w-5 h-5 accent-primary" />
                    <span className="text-sm font-medium">¿Atiendes emergencias (24/7 o fuera de horario)?</span>
                  </label>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-2 animate-in slide-in-from-right-4 duration-300">
                <h2 className="text-lg font-semibold mb-4 text-primary flex items-center gap-2"><FileText size={20}/> Perfil Profesional</h2>
                <div className="space-y-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium">Escribe una breve descripción sobre ti y tu experiencia</label>
                    <textarea 
                      name="descripcion" 
                      value={formData.descripcion} 
                      onChange={handleChange}
                      placeholder="Soy un electricista con más de 5 años de experiencia..."
                      className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                    <UploadCloud className="mb-2" size={24} />
                    <span className="text-sm">Sube una foto de perfil</span>
                  </div>
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                    <UploadCloud className="mb-2" size={24} />
                    <span className="text-sm">Sube al menos 3 fotos de trabajos realizados</span>
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-2 animate-in slide-in-from-right-4 duration-300">
                <h2 className="text-lg font-semibold mb-4 text-primary flex items-center gap-2"><CheckCircle size={20}/> Precios y Verificación</h2>
                <div className="space-y-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium">¿Cómo cobras normalmente?</label>
                    <select name="cobro" value={formData.cobro} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <option value="">Selecciona</option>
                      <option value="Por hora">Por hora</option>
                      <option value="Por visita">Por visita</option>
                      <option value="Por trabajo">Por trabajo realizado</option>
                      <option value="Previa cotizacion">Previa cotización</option>
                    </select>
                  </div>
                  <InputField label="Precio referencial (Ej. Desde 50 Soles)" name="precio" placeholder="S/ 50.00" />
                  
                  <div className="mt-6 border-t pt-4 border-border">
                    <h3 className="text-sm font-medium mb-3">Verificación de Identidad</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 text-center bg-gray-50 cursor-pointer">
                        <UploadCloud size={20} className="mb-2" />
                        <span className="text-xs">Foto DNI Frente</span>
                      </div>
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 text-center bg-gray-50 cursor-pointer">
                        <UploadCloud size={20} className="mb-2" />
                        <span className="text-xs">Foto DNI Reverso</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-between pt-4 border-t border-border">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep} className="w-24">Atrás</Button>
            ) : (
              <div></div>
            )}
            
            <Button type="submit" className="w-32 bg-primary hover:bg-primary/90 text-primary-foreground">
              {step === 5 ? 'Finalizar' : 'Siguiente'}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}
