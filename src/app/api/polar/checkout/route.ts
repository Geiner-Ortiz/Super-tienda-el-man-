import { Checkout } from "@polar-sh/nextjs";
import { type NextRequest } from "next/server";

// FORZAR COMPORTAMIENTO DINÁMICO (Esto obliga a Vercel a leer las variables en cada clic)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const GET = async (request: NextRequest) => {
    // Escaneo total de llaves (Diagnóstico V8)
    const allKeys = Object.keys(process.env);

    // Intentar encontrar el token en CUALQUIER variante posible
    const token =
        process.env.POLAR_ACCESS_TOKEN ||
        process.env.NEXT_PUBLIC_POLAR_ACCESS_TOKEN ||
        process.env.polar_access_token ||
        allKeys.find(k => k.toUpperCase().includes('POLAR') && k.toUpperCase().includes('TOKEN')) && process.env[allKeys.find(k => k.toUpperCase().includes('POLAR') && k.toUpperCase().includes('TOKEN'))!];

    if (!token) {
        return new Response(JSON.stringify({
            error: "Token no hallado en tiempo de ejecución dinámica",
            diagnostics: {
                total_env_keys: allKeys.length,
                all_polar_related_keys: allKeys.filter(k => k.toUpperCase().includes('POLAR')),
                supabase_visible: allKeys.some(k => k.includes('SUPABASE')),
                timestamp: new Date().toISOString()
            },
            hint: "Si sigue vacío, intenta borrar las variables en Vercel y créalas de nuevo con NOMBRES SIMPLES (ej: POLAR_TOKEN) y avísame."
        }, null, 2), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const host = request.headers.get("host") || "tu-super-tienda.vercel.app";
    const protocol = host.includes("localhost") ? "http" : "https";
    const successUrl = process.env.SUCCESS_URL || `${protocol}://${host}/admin/pricing?success=true`;

    return Checkout({
        accessToken: token as string,
        successUrl: successUrl,
    })(request);
};
