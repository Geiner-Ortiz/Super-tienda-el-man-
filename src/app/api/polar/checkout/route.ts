import { Checkout } from "@polar-sh/nextjs";
import { type NextRequest } from "next/server";

// Diagnóstico V6 - Soporte para prefijo NEXT_PUBLIC
export const GET = async (request: NextRequest) => {
    // Intentar obtener el token de ambas formas (estándar y con prefijo público como respaldo)
    const token = process.env.POLAR_ACCESS_TOKEN || process.env.NEXT_PUBLIC_POLAR_ACCESS_TOKEN;

    if (!token) {
        const allEnvKeys = Object.keys(process.env);
        return new Response(JSON.stringify({
            error: "Token no detectado",
            detected_keys_polar: allEnvKeys.filter(k => k.toLowerCase().includes('polar')),
            action: "Por favor, RENOMBRA las variables en Vercel añadiendo 'NEXT_PUBLIC_' al principio (ej: NEXT_PUBLIC_POLAR_ACCESS_TOKEN) y haz un Redeploy."
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const successUrl = process.env.SUCCESS_URL || `${protocol}://${host}/admin/pricing?success=true`;

    return Checkout({
        accessToken: token,
        successUrl: successUrl,
    })(request);
};
