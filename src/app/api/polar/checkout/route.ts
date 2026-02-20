import { Checkout } from "@polar-sh/nextjs";
import { type NextRequest } from "next/server";

// Diagnóstico V9 - Acceso Directo y Test de Inyección
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Forzar Node.js para descartar problemas de Edge Runtime
export const revalidate = 0;

export const GET = async (request: NextRequest) => {
    // 1. Acceso Directo (intentar leer sin enumerar)
    const tokenDirect = process.env.POLAR_ACCESS_TOKEN;
    const publicTokenDirect = process.env.NEXT_PUBLIC_POLAR_ACCESS_TOKEN;
    const testVarDirect = (process.env as any).TEST_V; // Variable de prueba que pediremos al usuario

    // 2. Enumeración (solo para el reporte)
    const allKeys = Object.keys(process.env);
    const polarKeys = allKeys.filter(k => k.toUpperCase().includes('POLAR'));

    const finalToken = tokenDirect || publicTokenDirect || (polarKeys.length > 0 ? process.env[polarKeys[0]] : null);

    if (!finalToken) {
        return new Response(JSON.stringify({
            error: "Token no detectado en V9 - Acceso Directo",
            diagnostics: {
                direct_access_ok: !!tokenDirect,
                public_direct_access_ok: !!publicTokenDirect,
                test_var_visible: !!testVarDirect,
                test_var_value: testVarDirect || "No configurada",
                all_keys_count: allKeys.length,
                polar_keys_found: polarKeys,
                vercel_detected: process.env.VERCEL === '1'
            },
            instruction: "PASO FINAL: 1. Crea en Vercel una variable llamada 'TEST_V' con el valor 'LISTO'. 2. Haz un 'Redeploy' manual. 3. Dime si ves 'LISTO' en este mensaje de error."
        }, null, 2), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const host = request.headers.get("host") || "tu-super-tienda.vercel.app";
    const protocol = host.includes("localhost") ? "http" : "https";
    const successUrl = process.env.SUCCESS_URL || `${protocol}://${host}/admin/pricing?success=true`;

    return Checkout({
        accessToken: finalToken as string,
        successUrl: successUrl,
    })(request);
};
