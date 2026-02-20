import { Checkout } from "@polar-sh/nextjs";
import { type NextRequest } from "next/server";

// Fuerza el redespliegue - timestamp: 2026-02-20 03:42
export const GET = async (request: NextRequest) => {
    // Diagnóstico avanzado de variables de entorno
    const token = process.env.POLAR_ACCESS_TOKEN;
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

    if (!token) {
        console.error("POLAR_ACCESS_TOKEN is missing in Vercel runtime");
        const detectedKeys = Object.keys(process.env).filter(k => k.startsWith('POLAR'));

        return new Response(JSON.stringify({
            error: "Token no detectado",
            detected_polar_keys: detectedKeys,
            details: "La variable POLAR_ACCESS_TOKEN no está disponible en este despliegue.",
            instruction: "Si ves la variable en 'detected_polar_keys' pero el error sigue, el valor está vacío. Si NO la ves, Vercel no la ha inyectado. Por favor, realiza un 'Redeploy' manual en Vercel."
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Construir URL de éxito dinámica
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const successUrl = process.env.SUCCESS_URL || `${protocol}://${host}/admin/pricing?success=true`;

    console.log("Iniciando checkout Polar con Success URL:", successUrl);

    // Ejecutar el helper de Checkout de Polar
    return Checkout({
        accessToken: token,
        successUrl: successUrl,
    })(request);
};
