import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const { imageBase64 } = body;

        if (!imageBase64) {
            return NextResponse.json({ error: 'Imagen no proporcionada' }, { status: 400 });
        }

        if (!process.env.OPENAI_API_KEY) {
            console.error('OPENAI_API_KEY no configurada');
            return NextResponse.json({ error: 'Configuración de servidor incompleta (API Key)' }, { status: 500 });
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `Expert anti-fraud Nequi. Analyze image, extract data, detect fake receipts (check fonts, alignment, UI inconsistencies). 
                    Respond ONLY valid JSON: {"isAuthentic":bool, "fraudReason":str|null, "amount":num, "date":"YYYY-MM-DD", "reference":"str"}`
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Parse Nequi receipt. Be ultra-strict with fraud." },
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
        }).catch(err => {
            console.error('OpenAI Error:', err);
            throw new Error(`Error de IA: ${err.message || 'Falla en el servicio'}`);
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error('Respuesta de IA vacía');

        const parsed = JSON.parse(content);
        return NextResponse.json(parsed);

    } catch (error: any) {
        console.error('Error en API Nequi:', error);
        return NextResponse.json(
            { error: error.message || 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
