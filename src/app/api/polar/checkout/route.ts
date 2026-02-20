import { Checkout } from "@polar-sh/nextjs";
import { type NextRequest } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const GET = async (request: NextRequest) => {
    const token = process.env.POLAR_ACCESS_TOKEN;

    if (!token) {
        console.error("POLAR_ACCESS_TOKEN is missing in production environment");
        return new Response(JSON.stringify({
            error: "Configuración incompleta",
            message: "El servidor no ha podido autenticar la solicitud de pago. Por favor, contacte con soporte."
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Construir URL de éxito dinámica basada en el host actual
    const host = request.headers.get("host") || "tu-super-tienda.vercel.app";
    const protocol = host.includes("localhost") ? "http" : "https";
    const successUrl = process.env.SUCCESS_URL || `${protocol}://${host}/admin/pricing?success=true`;

    console.log("Iniciando checkout de Polar...");

    // Ejecutar el helper de Checkout de Polar
    return Checkout({
        accessToken: token,
        successUrl: successUrl,
    })(request);
};
