import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { imageBase64 } = await req.json();

        if (!imageBase64) {
            return NextResponse.json({ error: 'Imagen no proporcionada' }, { status: 400 });
        }

        const systemPrompt = `
Eres un experto en detección de fraudes y extracción de datos financieros de comprobantes de Nequi (Colombia).
Tu misión es doble:
1. **Detección de Fraude**: Analiza la imagen buscando señales de edición, fuentes inconsistentes, alineaciones extrañas, colores alterados o cualquier elemento que sugiera que el comprobante es falso.
2. **Extracción de Datos**: Si el comprobante parece genuino, extrae el monto, la fecha (en formato YYYY-MM-DD) y el número de referencia.

Responde ÚNICAMENTE en formato JSON con la siguiente estructura:
{
  "isAuthentic": boolean,
  "fraudReason": string | null,
  "amount": number | null,
  "date": string | null,
  "reference": string | null
}

Si isAuthentic es false, fraudReason debe explicar brevemente por qué.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Analiza este comprobante de Nequi:" },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${imageBase64}`
                            }
                        }
                    ]
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Error parsing receipt:', error);
        return NextResponse.json({ error: 'Error procesando el comprobante' }, { status: 500 });
    }
}
