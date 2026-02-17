import OpenAI from "openai";
import { NextResponse } from "next/server";
import { siteConfig } from "@/config/siteConfig";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: "OpenAI API Key not configured. Please add OPENAI_API_KEY to .env.local" },
            { status: 500 }
        );
    }

    const openai = new OpenAI({ apiKey });

    try {
        const { messages } = await req.json();
        const lastMessage = messages[messages.length - 1].content.toLowerCase();
        const supabase = await createClient();

        // 1. Contexto para Ventas
        let extraContext = "";

        if (lastMessage.includes('venta') || lastMessage.includes('ganancia') || lastMessage.includes('cuanto') || lastMessage.includes('gané')) {
            const { data: sales } = await supabase.from('sales').select('amount, profit, sale_date').order('created_at', { ascending: false }).limit(20);

            if (sales && sales.length > 0) {
                extraContext += `\nDATOS DE VENTAS RECIENTES (Últimas 20):\n${sales.map(s => `- Fecha: ${s.sale_date}, Monto: $${s.amount}, Ganancia(20%): $${s.profit}`).join('\n')}\n`;
            }
        }

        // 2. Contexto para Deudores
        if (lastMessage.includes('debe') || lastMessage.includes('deuda') || lastMessage.includes('cobrar') || lastMessage.includes('morosos')) {
            const { data: debtors } = await supabase.from('debtors').select('name, amount, phone');

            if (debtors && debtors.length > 0) {
                extraContext += `\nDATOS DE CLIENTES QUE DEBEN (MOROSOS):\n${debtors.map(d => `- ${d.name} debe $${d.amount} (Tel: ${d.phone})`).join('\n')}\n`;
            }
        }

        // 3. Contexto para Gastos (Contabilidad)
        if (lastMessage.includes('gasto') || lastMessage.includes('egreso') || lastMessage.includes('pagué') || lastMessage.includes('pago') || lastMessage.includes('factura')) {
            const { data: expenses } = await supabase.from('expenses').select('category, type, amount, expense_date').order('expense_date', { ascending: false }).limit(10);

            if (expenses && expenses.length > 0) {
                extraContext += `\nDATOS DE GASTOS RECIENTES:\n${expenses.map(e => `- Fecha: ${e.expense_date}, Tipo: ${e.type} (${e.category}), Monto: $${e.amount}`).join('\n')}\n`;
            }
        }

        const systemPrompt = `
      Eres el asistente virtual de "${siteConfig.firmName}".
      Tu objetivo es ayudar al dueño de la tienda a gestionar su negocio.
      
      Reglas de respuesta:
      1. Si te preguntan por ventas o deudores, usa los DATOS RECIENTES proporcionados en el contexto.
      2. Sé preciso con los números. Si preguntan por la ganancia total de un día, suma los valores correspondientes.
      3. Mantén un tono amable, profesional y colombiano (puedes usar palabras como 'vecino', 'bendiciones', 'claro que sí').
      4. Si no hay datos para una consulta específica, dile que no encuentras registros.
      5. Responde de forma concisa pero útil.
      
      CONTEXTO EMPRESARIAL:
      - Ganancia automática: 20% sobre cada venta bruta.
      - Ubicación: ${siteConfig.contact.city || 'Colombia'}
      
      DATOS EN TIEMPO REAL:
      ${extraContext || 'No hay datos de ventas o deudas para este contexto específico.'}
    `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                ...messages.map((m: any) => ({
                    role: m.type === 'user' ? 'user' : 'assistant',
                    content: m.content
                }))
            ],
            temperature: 0.7,
        });

        const responseText = response.choices[0].message.content;
        return NextResponse.json({ text: responseText });

    } catch (error: any) {
        console.error("OpenAI API Error:", error);

        // Error más descriptivo para el usuario
        const errorMessage = error.status === 401
            ? "API Key de OpenAI inválida o no configurada en Vercel."
            : error.status === 429
                ? "Se ha agotado el saldo o el límite de la API de OpenAI."
                : "Error conectando con la inteligencia artificial. Intenta de nuevo.";

        return NextResponse.json(
            { error: errorMessage },
            { status: error.status || 500 }
        );
    }
}
