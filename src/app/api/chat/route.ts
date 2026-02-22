import OpenAI from "openai";
import { NextResponse } from "next/server";
import { siteConfig } from "@/config/siteConfig";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: "OpenAI API Key not configured. Please add OPENAI_API_KEY to .env.local" },
            { status: 500 }
        );
    }

    const openai = new OpenAI({ apiKey });

    try {
        const { messages } = await req.json();
        const lastMessage = messages[messages.length - 1].content.toLowerCase();
        const supabase = await createClient();

        // 0. Verificar sesión del usuario — filtra datos por perfil
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'No estás autenticado.' }, { status: 401 });
        }
        const userId = user.id;

        // 0.1 Obtener rol del usuario
        const { data: profileData } = await supabase
            .from('profiles')
            .select('role, full_name, store_name')
            .eq('id', userId)
            .single();
        const userRole = profileData?.role || 'client';
        const isSuperAdmin = userRole === 'super_admin';

        // 1. Contexto para Ventas
        let extraContext = "";

        // --- BLOQUE SUPER ADMIN: datos globales de la plataforma ---
        if (isSuperAdmin) {
            // Usuarios registrados (excluyendo super_admin)
            const { data: allProfiles } = await supabase
                .from('profiles')
                .select('id, full_name, store_name, email, role, created_at')
                .neq('role', 'super_admin')
                .order('created_at', { ascending: false });

            if (allProfiles && allProfiles.length > 0) {
                extraContext += `\nDATOS DE PLATAFORMA (ADMIN):\n- Total usuarios registrados: ${allProfiles.length}\n`;
                extraContext += `Lista de usuarios:\n${allProfiles.map(p => `  * ${p.full_name || 'Sin nombre'} (${p.store_name || 'Sin tienda'}) - ${p.email} - Rol: ${p.role} - Registro: ${p.created_at}`).join('\n')}\n`;
            }

            // Ventas globales
            const { data: allSales } = await supabase
                .from('sales')
                .select('amount, profit, sale_date, user_id')
                .order('created_at', { ascending: false })
                .limit(50);

            if (allSales && allSales.length > 0) {
                const totalAmount = allSales.reduce((acc, s) => acc + Number(s.amount), 0);
                const totalProfit = allSales.reduce((acc, s) => acc + Number(s.profit), 0);
                extraContext += `\nVENTAS GLOBALES (últimas 50):\n- Total vendido: $${totalAmount.toLocaleString()}\n- Ganancia total: $${totalProfit.toLocaleString()}\n`;
            }

            // Deudores globales
            const { data: allDebtors } = await supabase
                .from('debtors')
                .select('name, phone, user_id, debts(amount, is_paid, debt_date)');

            if (allDebtors && allDebtors.length > 0) {
                const debtorSummary = allDebtors.map(d => {
                    const pending = (d.debts || []).filter((debt: any) => !debt.is_paid);
                    const pendingAmount = pending.reduce((acc: number, debt: any) => acc + Number(debt.amount), 0);
                    return { name: d.name, pendingAmount, count: pending.length };
                }).filter(d => d.pendingAmount > 0);

                if (debtorSummary.length > 0) {
                    const totalDebt = debtorSummary.reduce((acc, d) => acc + d.pendingAmount, 0);
                    extraContext += `\nDEUDORES GLOBALES:\n- Total morosos activos: ${debtorSummary.length}\n- Deuda total en calle: $${totalDebt.toLocaleString()}\n`;
                }
            }
        }

        // --- BLOQUE USUARIO NORMAL: datos filtrados por user_id ---

        if (lastMessage.includes('venta') || lastMessage.includes('gan') || lastMessage.includes('cuant') || lastMessage.includes('vend')) {
            const { data: sales } = await supabase.from('sales').select('amount, profit, sale_date').eq('user_id', userId).order('created_at', { ascending: false }).limit(20);

            if (sales && sales.length > 0) {
                extraContext += `\nDATOS DE VENTAS RECIENTES (Últimas 20):\n${sales.map(s => `- Fecha: ${s.sale_date}, Monto: $${s.amount}, Ganancia(20%): $${s.profit}`).join('\n')}\n`;
            }
        }

        // 2. Contexto para Deudores
        if (lastMessage.includes('debe') || lastMessage.includes('deuda') || lastMessage.includes('cobrar') || lastMessage.includes('moros') || lastMessage.includes('quien') || lastMessage.includes('cliente') || lastMessage.includes('cuand') || lastMessage.includes('fecha')) {
            const { data: debtorsData } = await supabase.from('debtors').select('name, phone, debts(amount, is_paid, debt_date)').eq('user_id', userId);

            if (debtorsData && debtorsData.length > 0) {
                const results = debtorsData.map(d => {
                    const pendingDebts = (d.debts || [])
                        .filter((debt: any) => !debt.is_paid);

                    const pendingAmount = pendingDebts
                        .reduce((acc: number, debt: any) => acc + Number(debt.amount), 0);

                    const totalHistory = (d.debts || []).length;
                    const paidCount = (d.debts || []).filter((debt: any) => debt.is_paid).length;

                    return {
                        name: d.name,
                        phone: d.phone,
                        pendingAmount,
                        pendingDebts: pendingDebts.map((debt: any) => ({
                            amount: debt.amount,
                            date: debt.debt_date
                        })),
                        totalHistory,
                        paidCount,
                        isSaldado: totalHistory > 0 && pendingAmount === 0
                    };
                }).filter(d => d.pendingAmount > 0 || lastMessage.includes('todos') || lastMessage.includes('lista'));

                if (results.length > 0) {
                    extraContext += `\nDATOS DE CLIENTES DEUDORES (EN TIEMPO REAL):\n${results.map(r =>
                        `- ${r.name}: DEBE $${r.pendingAmount} (Tel: ${r.phone}).\n  Detalle de deudas pendientes:\n  ${r.pendingDebts.map(pd => `* $${pd.amount} el día ${pd.date}`).join('\n  ')}`
                    ).join('\n')}\n`;
                }
            }
        }

        // 3. Contexto para Gastos (Contabilidad)
        if (lastMessage.includes('gast') || lastMessage.includes('egres') || lastMessage.includes('pagu') || lastMessage.includes('pago') || lastMessage.includes('factur')) {
            const { data: expenses } = await supabase.from('expenses').select('category, type, amount, expense_date').eq('user_id', userId).order('expense_date', { ascending: false }).limit(10);

            if (expenses && expenses.length > 0) {
                extraContext += `\nDATOS DE GASTOS RECIENTES:\n${expenses.map(e => `- Fecha: ${e.expense_date}, Tipo: ${e.type} (${e.category}), Monto: $${e.amount}`).join('\n')}\n`;
            }
        }

        const systemPrompt = `
      Eres el asistente virtual de "${siteConfig.firmName}".
      ${isSuperAdmin
                ? `El usuario actual es el SUPER ADMINISTRADOR de la plataforma (${profileData?.full_name || 'Admin'}). Tiene acceso a TODOS los datos de TODOS los usuarios. Cuando pregunte por usuarios, ventas globales, o estadísticas de la plataforma, usa los DATOS DE PLATAFORMA (ADMIN) proporcionados.`
                : `Tu objetivo es ayudar al dueño de la tienda "${profileData?.store_name || 'su tienda'}" a gestionar su negocio.`
            }
      
      FECHA ACTUAL: ${new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      
      Reglas de respuesta:
      1. Si te preguntan por ventas o deudores, usa los DATOS RECIENTES proporcionados en el contexto.
      2. Sé preciso con los números y FECHAS. Si preguntan cuándo se originó una deuda, revisa el "Detalle de deudas pendientes" en el contexto de deudores.
      3. Mantén un tono amable, profesional y colombiano (puedes usar palabras como 'vecino', 'bendiciones', 'claro que sí').
      4. Si no hay datos para una consulta específica, dile que no encuentras registros.
      5. Responde de forma concisa pero útil.
      ${isSuperAdmin ? '6. Cuando el admin pregunte por usuarios, responde con el número total y puedes listar los más recientes.' : ''}
      
      CONTEXTO EMPRESARIAL:
      - Ganancia automática: 20% sobre cada venta bruta.
      - Ubicación: ${siteConfig.contact.city || 'Colombia'}
      
      DATOS EN TIEMPO REAL:
      ${extraContext || 'No hay datos de ventas o deudas para este contexto específico.'}
    `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                ...messages.map((m: any) => ({
                    role: m.type === 'user' ? 'user' : 'assistant',
                    content: m.content
                }))
            ],
            temperature: 0.7,
        });

        const responseText = response.choices[0].message.content;
        return NextResponse.json({ text: responseText });

    } catch (error: any) {
        console.error("OpenAI API Error:", error);

        // Error más descriptivo para el usuario
        const errorMessage = error.status === 401
            ? "API Key de OpenAI inválida o no configurada en Vercel."
            : error.status === 429
                ? "Se ha agotado el saldo o el límite de la API de OpenAI."
                : "Error conectando con la inteligencia artificial. Intenta de nuevo.";

        return NextResponse.json(
            { error: errorMessage },
            { status: error.status || 500 }
        );
    }
}
