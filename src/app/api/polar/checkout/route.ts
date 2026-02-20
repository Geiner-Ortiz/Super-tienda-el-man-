import { Checkout } from "@polar-sh/nextjs";
import { type NextRequest } from "next/server";

// Diagnóstico V7 - Reporte Exhaustivo de Entorno
export const GET = async (request: NextRequest) => {
    const allEnvKeys = Object.keys(process.env);

    // Buscar el token
    const token = process.env.POLAR_ACCESS_TOKEN || process.env.NEXT_PUBLIC_POLAR_ACCESS_TOKEN;

    if (!token) {
        // Filtrar llaves que contengan 'polar' sin importar mayúsculas/minúsculas
        const polarRelatedKeys = allEnvKeys.filter(k => k.toUpperCase().includes('POLAR'));

        // Información de depuración
        const debugInfo = {
            error: "Polar Token missing in runtime",
            env_stats: {
                total_keys: allEnvKeys.length,
                polar_keys_found: polarRelatedKeys,
                has_supabase_keys: allEnvKeys.some(k => k.includes('SUPABASE')),
            },
            current_host: request.headers.get("host"),
            advice: "Si 'polar_keys_found' está vacío [], Vercel no está inyectando las variables. REVISA: 1. El nombre exacto en Vercel. 2. Que estén en el entorno 'Production'. 3. Realiza un 'Redeploy' con 'Build Cache' DESACTIVADO."
        };

        return new Response(JSON.stringify(debugInfo, null, 2), {
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
