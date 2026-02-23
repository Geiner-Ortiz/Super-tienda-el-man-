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
Eres un experto en detección de fraudes de Nequi (Colombia).
Tu misión es detectar si el comprobante es genuino o generado por apps fraudulentas.

ANALIZA DETALLADAMENTE:
1. **Fuentes**: Busca fuentes inconsistentes, pixeladas o que no coinciden con la tipografía oficial de Nequi.
2. **Artefactos de Edición**: Bordes difusos, textos mal alineados, colores de fondo no uniformes cerca del texto.
3. **Generadores**: Comprobantes con alineación "perfecta" milimétrica o que parecen sacados de una plantilla digital sin textura de pantalla real.
4. **Coherencia**: La fecha, hora y referencia deben seguir el formato oficial.

EXTRAE: Monto, Fecha (YYYY-MM-DD), Referencia.

Responde ÚNICAMENTE en JSON:
{
  "isAuthentic": boolean,
  "fraudReason": string | null,
  "amount": number,
  "date": "YYYY-MM-DD",
  "reference": "string"
}
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
