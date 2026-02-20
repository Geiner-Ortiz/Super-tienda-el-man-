const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

async function runSql() {
    const sql = `
        ALTER TABLE public.profiles 
        ADD COLUMN IF NOT EXISTS subscription_id TEXT,
        ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';

        -- Sync existing users
        INSERT INTO public.profiles (id, email, role, full_name, store_name, subscription_status)
        SELECT 
            id, 
            email, 
            COALESCE(raw_user_meta_data->>'role', 'client'),
            COALESCE(raw_user_meta_data->>'full_name', email),
            COALESCE(raw_user_meta_data->>'store_name', 'Mi Tienda'),
            'inactive'
        FROM auth.users
        ON CONFLICT (id) DO UPDATE SET 
            email = EXCLUDED.email,
            subscription_status = 'inactive'
        WHERE profiles.subscription_status IS NULL;
    `;

    console.log(`Ejecutando SQL en ${PROJECT_REF}...`);

    try {
        const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/sql`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: sql })
        });

        const result = await response.json();

        if (response.ok) {
            console.log('✅ SQL ejecutado con éxito.');
            console.log(result);
        } else {
            console.error('❌ Error:', result);
        }
    } catch (error) {
        console.error('❌ Error de red:', error.message);
    }
}

runSql();
