import os
import json
from groq import Groq
from typing import Optional

def analyze_issue(text_description: str, base64_image: Optional[str] = None):
    """
    Analyzes a user's issue (text + optional image) and returns structured JSON
    compatible with Llama 4 Scout.
    """
    try:
        client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
        
        content_array = text_description
            
        system_prompt = """Eres el asistente inteligente de Chambista, encargado de ayudar a los clientes a encontrar al profesional ideal para su problema.
        Analiza el problema que describe el usuario y responde dirigiéndote a él directamente (en segunda persona, de forma amigable y concisa).
        
        Debes responder ÚNICA Y EXCLUSIVAMENTE con un objeto JSON válido con esta estructura exacta, sin texto antes ni después. NO PUEDES dar explicaciones, NO PUEDES usar tags de <thinking>, responde SOLAMENTE con el JSON:
        {
          "mensaje_usuario": "Texto dirigido al cliente, natural y conciso (máximo 5 oraciones) confirmando qué necesita y recomendando al especialista. Ejemplo: 'Parece que tienes una fuga en el sifón del baño. Te recomiendo un gasfitero para reparar la conexión rápidamente.'",
          "categoria": "gasfiteria/electricidad/limpieza/carpinteria/pintura/refrigeracion/cerrajeria/fumigacion/mudanzas/albanileria"
        }"""

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": content_array
                }
            ],
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        return json.loads(content)
        
    except Exception as e:
        print(f"Error AI: {e}")
        # Fallback response for MVP
        return {
          "mensaje_usuario": "Basado en tu descripción, necesitas un profesional general que pueda evaluar el problema de cerca.",
          "categoria": "tecnico"
        }
