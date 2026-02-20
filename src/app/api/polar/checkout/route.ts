import { Checkout } from "@polar-sh/nextjs";
import { type NextRequest } from "next/server";

// Diagnóstico V5 - Búsqueda Exhaustiva
export const GET = async (request: NextRequest) => {
    // Intentar encontrar cualquier variable que se parezca a lo que buscamos
    const allEnvKeys = Object.keys(process.env);
    const lowercasePolarKey = allEnvKeys.find(k => k.toLowerCase().includes('polar') && k.toLowerCase().includes('token'));

    // El token real que intentaremos usar
    const token = process.env.POLAR_ACCESS_TOKEN || (lowercasePolarKey ? process.env[lowercasePolarKey] : null);

    if (!token) {
        return new Response(JSON.stringify({
            error: "Token no encontrado en el sistema",
            diagnostics: {
                total_keys: allEnvKeys.length,
                keys_containing_polar: allEnvKeys.filter(k => k.toLowerCase().includes('polar')),
                keys_containing_token: allEnvKeys.filter(k => k.toLowerCase().includes('token')),
                example_key_visible: allEnvKeys.find(k => k.startsWith('NEXT_PUBLIC_')) ? "Sí" : "No",
                node_env: process.env.NODE_ENV
            },
            instruction: "Si 'keys_containing_polar' está vacío, Vercel no está inyectando la variable. Por favor, verifica que no existan ESPACIOS al principio o final del nombre de la variable en Vercel."
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
