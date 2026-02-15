import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { siteConfig } from "@/config/siteConfig";

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(req: Request) {
    if (!apiKey) {
        return NextResponse.json(
            { error: "Gemini API Key not configured. Please add GOOGLE_GEMINI_API_KEY to .env.local" },
            { status: 500 }
        );
    }

    try {
        const { messages } = await req.json();

        // Use gemini-2.0-flash as it is confirmed available for this key
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash"
        });

        const systemPrompt = `
      Eres el asistente virtual de "${siteConfig.firmName}".
      Slogan: "${siteConfig.firmSlogan}"
      Descripción: "${siteConfig.firmDescription}"
      Ubicación: ${siteConfig.contact.city || 'Desconocida'}, ${siteConfig.contact.country}
      Horarios: ${siteConfig.contact.officeHours}
      Contacto: ${siteConfig.contact.email}

      Tu objetivo es ayudar a los clientes con información de la tienda. 
      Responde de forma amable, servicial y profesional.
      Usa un tono acogedor, como el de una tienda de barrio premium en Colombia.
      
      Reglas:
      1. Solo responde preguntas relacionadas con la tienda y su funcionamiento.
      2. No inventes precios específicos si no los tienes en tu contexto (por ahora solo sabes información general).
      3. Si te preguntan por ganancias, explica que el sistema calcula un 20% automático para el dueño.
      4. Si el usuario quiere registrar una venta, dile que puede hacerlo desde el botón "Nueva Venta" en el Dashboard.
      5. Si no sabes algo, pide amablemente que contacten al personal de la tienda.
      6. MUY IMPORTANTE: NO hables de leyes, abogados, bufetes o citas legales. Eres un asistente DE TIENDA DE ABARROTES. Si alguien menciona temas legales, redirígelos amablemente a temas de la tienda.
    `;

        // Combine system prompt and history into a simple prompt for stability
        const context = `
      CONTEXTO DEL SISTEMA:
      ${systemPrompt}
      
      HISTORIAL DE CONVERSACIÓN:
      ${messages.slice(0, -1).map((m: any) => `${m.type === 'user' ? 'Usuario' : 'Asistente'}: ${m.content}`).join('\n')}
      
      MENSAJE ACTUAL DEL USUARIO:
      ${messages[messages.length - 1].content}
      
      RESPUESTA DEL ASISTENTE:
    `;

        const result = await model.generateContent(context);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ text });
    } catch (error: any) {
        console.error("Chat API Error Detailed:", {
            message: error.message,
            stack: error.stack,
            response: error.response ? {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            } : 'No response object'
        });
        return NextResponse.json(
            { error: "Lo siento, tuve un problema al procesar tu mensaje. Por favor intenta de nuevo." },
            { status: 500 }
        );
    }
}
