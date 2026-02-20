import { Checkout } from "@polar-sh/nextjs";
import { type NextRequest } from "next/server";

// Diagnóstico V10 - Escaneo Total de Llaves
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

export const GET = async (request: NextRequest) => {
    const allKeys = Object.keys(process.env).sort();
    const BUILD_VER = "V10-Exhaustive-Scan";

    // Intentar obtener el token de todas las formas posibles
    const token =
        process.env.POLAR_ACCESS_TOKEN ||
        process.env.NEXT_PUBLIC_POLAR_ACCESS_TOKEN ||
        process.env.TEST_V ||
        process.env.NEXT_PUBLIC_TEST_V;

    if (!token) {
        return new Response(JSON.stringify({
            error: "Token no detectado en V10",
            build_version: BUILD_VER,
            diagnostics: {
                total_keys: allKeys.length,
                // Listamos todas las llaves para ver qué hay realmente (solo los nombres)
                all_keys_list: allKeys,
                timestamp: new Date().toISOString()
            },
            instruction: "Busca 'POLAR_ACCESS_TOKEN' o 'TEST_V' en la lista 'all_keys_list'. Si no están, Vercel NO las está inyectando."
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
