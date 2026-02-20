import { Checkout } from "@polar-sh/nextjs";
import { type NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
    // Verificar token para evitar crash 500
    if (!process.env.POLAR_ACCESS_TOKEN) {
        console.error("POLAR_ACCESS_TOKEN is not defined in environment variables");
        return new Response(JSON.stringify({
            error: "Token no configurado en Vercel",
            hint: "Asegúrate de añadir POLAR_ACCESS_TOKEN en las variables de entorno de Vercel."
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
