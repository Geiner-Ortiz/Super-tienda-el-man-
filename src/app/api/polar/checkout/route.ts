import { Checkout } from "@polar-sh/nextjs";
import { type NextRequest } from "next/server";

// Fuerza el redespliegue para cargar las nuevas variables de entorno
export const GET = async (request: NextRequest) => {
    // Verificar token para evitar crash 500
    if (!process.env.POLAR_ACCESS_TOKEN) {
        console.error("POLAR_ACCESS_TOKEN is missing in Vercel environment");
        return new Response(JSON.stringify({
            error: "Token no detectado",
            details: "La variable POLAR_ACCESS_TOKEN está vacía o no existe en este despliegue.",
            action: "Verifica en Vercel: Settings -> Environment Variables. Asegúrate de que esté en 'Production' y haz un 'Redeploy' manual si es necesario."
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Construir URL de éxito dinámica basada en el host actual
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const successUrl = process.env.SUCCESS_URL || `${protocol}://${host}/admin/pricing?success=true`;

    console.log("Iniciando checkout Polar con Success URL:", successUrl);

    // Ejecutar el helper de Checkout de Polar
    return Checkout({
        accessToken: process.env.POLAR_ACCESS_TOKEN,
        successUrl: successUrl,
    })(request);
};
