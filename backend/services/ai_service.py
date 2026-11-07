import os
import json
from groq import Groq
from typing import Optional

def get_category_fallback_steps(cat: str):
    cat_lower = (cat or "").lower()
    if "electr" in cat_lower or "luz" in cat_lower:
        return [
            {
                "paso": 1,
                "titulo": "Corte preventivo",
                "descripcion": "Bajar la llave termomagnética del sector afectado para evitar riesgos de sobrecarga o cortocircuito."
            },
            {
                "paso": 2,
                "titulo": "Aislamiento e inspección visual",
                "descripcion": "Desconectar equipos electrónicos sensibles sin tocar conductores expuestos ni manipular enchufes húmedos."
            },
            {
                "paso": 3,
                "titulo": "Solución técnica certificada",
                "descripcion": "Un electricista calificado medirá voltaje, corregirá falsos contactos y reemplazará cableado dañado."
            }
        ]
    elif "gasfit" in cat_lower or "plom" in cat_lower or "agua" in cat_lower:
        return [
            {
                "paso": 1,
                "titulo": "Cierre de suministro",
                "descripcion": "Cerrar de inmediato la llave de paso principal de agua para detener la fuga y evitar filtraciones."
            },
            {
                "paso": 2,
                "titulo": "Detección del origen",
                "descripcion": "Secar la zona circundante con un paño para ubicar si el goteo proviene de un empaque, rosca o rotura de tubo."
            },
            {
                "paso": 3,
                "titulo": "Sustitución y sellado hermético",
                "descripcion": "El gasfitero colocará teflón de alta densidad, empaques nuevos o soldadura termofusión con garantía."
            }
        ]
    elif "cerraj" in cat_lower or "llav" in cat_lower or "chapa" in cat_lower:
        return [
            {
                "paso": 1,
                "titulo": "No forzar el cilindro",
                "descripcion": "Evitar girar llaves dobladas o usar pinzas improvisadas que puedan quebrar la llave dentro de la cerradura."
            },
            {
                "paso": 2,
                "titulo": "Comprobación de holgura",
                "descripcion": "Empujar suavemente la puerta hacia el marco para confirmar si el cerrojo o pestillo está presionado por desnivel."
            },
            {
                "paso": 3,
                "titulo": "Apertura técnica especializada",
                "descripcion": "El cerrajero realizará ganzuado no invasivo, calibración de bisagras o cambio de bombín de seguridad."
            }
        ]
    elif "refrig" in cat_lower or "lavad" in cat_lower or "clima" in cat_lower:
        return [
            {
                "paso": 1,
                "titulo": "Desconexión segura",
                "descripcion": "Desconectar el electrodoméstico de la toma de corriente si detectas chispas, olor a quemado o calentamiento anómalo."
            },
            {
                "paso": 2,
                "titulo": "Revisión de filtros y desagüe",
                "descripcion": "Verificar que las mangueras de agua no estén dobladas y que el filtro de pelusas o drenaje no esté atascado."
            },
            {
                "paso": 3,
                "titulo": "Diagnóstico de tarjeta y motor",
                "descripcion": "El técnico especializado probará sensores, capacitores o carga de gas para una reparación duradera."
            }
        ]
    elif "limp" in cat_lower or "desinfec" in cat_lower:
        return [
            {
                "paso": 1,
                "titulo": "Despeje de ambientes",
                "descripcion": "Retirar pertenencias personales y objetos delicados de las superficies a tratar para optimizar el servicio."
            },
            {
                "paso": 2,
                "titulo": "Ventilación y delimitación",
                "descripcion": "Abrir ventanas e indicar al personal las áreas con mayor acumulación de grasa, sarro o polvo."
            },
            {
                "paso": 3,
                "titulo": "Aplicación profesional",
                "descripcion": "El equipo aplicará productos de grado industrial biodegradables con maquinaria de vapor o inyección-succión."
            }
        ]
    else:
        return [
            {
                "paso": 1,
                "titulo": "Protección y seguridad inicial",
                "descripcion": "Despejar el área de trabajo y evitar el uso del equipo o instalación dañada hasta su revisión."
            },
            {
                "paso": 2,
                "titulo": "Evaluación del estado actual",
                "descripcion": "Tomar nota de síntomas específicos (ruidos, fisuras, manchas) para explicárselos al especialista."
            },
            {
                "paso": 3,
                "titulo": "Intervención técnica garantizada",
                "descripcion": "El técnico acordará el presupuesto transparente, materiales certificados y ejecutará la labor con garantía."
            }
        ]

def analyze_issue(text_description: str, base64_image: Optional[str] = None):
    """
    Analiza la descripción del problema del usuario y extrae información estructurada
    junto con 3 pasos recomendados para la solución técnica.
    """
    try:
        client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
        
        system_prompt = """Eres el asistente inteligente de Chambista, encargado de ayudar a los clientes a solucionar problemas de servicios del hogar y comercio en Perú.
        
        Analiza el problema descrito por el usuario y responde dirigiéndote a él de forma directa (en segunda persona, empática y muy concisa, máximo 3 oraciones).
        
        Además, proporciona OBLIGATORIAMENTE 3 pasos lógicos y prácticos para que el usuario sepa cómo abordar y solucionar su problema:
        - Paso 1: Acción de emergencia o prevención inmediata (seguridad).
        - Paso 2: Diagnóstico o inspección visual rápida.
        - Paso 3: Solución técnica definitiva que ejecutará el especialista de Chambista.
        
        Si la consulta NO está relacionada con servicios del hogar o comercio en Perú, rechaza cortésmente en "mensaje_usuario", deja "categoria": null, "pasos_solucion": [] y "urgencia": "baja".
        
        Debes responder ÚNICA Y EXCLUSIVAMENTE con un objeto JSON válido con esta estructura exacta:
        {
          "mensaje_usuario": "Mensaje conciso confirmando qué entendiste y orientando la solución.",
          "categoria": "gasfiteria/electricidad/limpieza/carpinteria/pintura/refrigeracion/cerrajeria/fumigacion/mudanzas/albanileria o null",
          "tags": ["lista", "de", "palabras", "clave"],
          "distrito": "Distrito de Perú si se menciona (ej. Cayma, Yanahuara, Miraflores, Surco), o null si no se menciona.",
          "urgencia": "alta/media/baja",
          "pasos_solucion": [
            {
              "paso": 1,
              "titulo": "Título breve del paso 1 (Medida inmediata)",
              "descripcion": "Instrucción clara de qué hacer de inmediato para evitar mayores daños o riesgos."
            },
            {
              "paso": 2,
              "titulo": "Título breve del paso 2 (Evaluación técnica)",
              "descripcion": "Qué verificar o identificar para comprender el origen exacto de la falla."
            },
            {
              "paso": 3,
              "titulo": "Título breve del paso 3 (Reparación definitiva)",
              "descripcion": "El trabajo profesional que realizará el especialista con repuestos y garantía."
            }
          ]
        }
        """

        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": text_description
                }
            ],
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        data = json.loads(content)
        
        # Validar que existan los 3 pasos
        if not data.get("pasos_solucion") or len(data.get("pasos_solucion")) < 3:
            data["pasos_solucion"] = get_category_fallback_steps(data.get("categoria") or "general")
            
        return data
        
    except Exception as e:
        print(f"Error AI: {e}")
        # Determinar categoría básica por palabras clave
        lower = text_description.lower()
        cat = "gasfiteria"
        if any(w in lower for w in ["luz", "electr", "enchufe", "corto"]):
            cat = "electricidad"
        elif any(w in lower for w in ["llave", "chapa", "puerta", "cerraj"]):
            cat = "cerrajeria"
        elif any(w in lower for w in ["refrig", "lavad", "cocina", "motor"]):
            cat = "refrigeracion"
        elif any(w in lower for w in ["limp", "desinfec", "fumig"]):
            cat = "limpieza"

        return {
          "mensaje_usuario": "Basado en tu descripción, he diagnosticado tu problema y preparado una guía de atención inmediata.",
          "categoria": cat,
          "tags": [cat],
          "distrito": None,
          "urgencia": "media",
          "pasos_solucion": get_category_fallback_steps(cat)
        }
