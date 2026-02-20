import { Checkout } from "@polar-sh/nextjs";
import { type NextRequest } from "next/server";

// Fuerza el redespliegue - V4 - Diagnóstico General
export const GET = async (request: NextRequest) => {
    const token = process.env.POLAR_ACCESS_TOKEN;

    if (!token) {
        // Diagnóstico profundo
        const allKeys = Object.keys(process.env);
        const polarKeys = allKeys.filter(k => k.startsWith('POLAR'));
        const supabaseKeys = allKeys.filter(k => k.startsWith('NEXT_PUBLIC_SUPABASE'));

        return new Response(JSON.stringify({
            error: "Token no detectado",
            diagnostics: {
                polar_keys_found: polarKeys,
                supabase_keys_visible: supabaseKeys.length > 0,
                total_env_keys: allKeys.length,
                node_env: process.env.NODE_ENV
            },
            instruction: "Si polar_keys_found está vacío pero supabase_keys_visible es true, Vercel está ignorando específicamente las llaves de Polar. Intenta borrarlas y crearlas de nuevo en Vercel."
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
