const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

async function grantAdminToAll() {
    const sql = `
        INSERT INTO public.profiles (id, role, full_name)
        SELECT id, 'admin', email
        FROM auth.users
        ON CONFLICT (id) DO UPDATE SET role = 'admin';
    `;

    console.log(`Aplicando corrección de roles a ${PROJECT_REF}...`);

    try {
        const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/db/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: sql })
        });

        const result = await response.json();

        if (response.ok) {
            console.log('✅ Roles actualizados con éxito.');
            console.log(result);
        } else {
            console.error('❌ Error al actualizar roles:', result);
        }
    } catch (error) {
        console.error('❌ Error de red:', error.message);
    }
}

grantAdminToAll();
