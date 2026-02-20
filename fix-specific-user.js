const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Using the anon key might not work if RLS is on, but since the profiles table is empty and I might have a service key...
// Wait, I saw NEXT_PUBLIC_SUPABASE_ANON_KEY and it's public. 
// I'll try to use the fetch method with the ACCESS_TOKEN (service token) I have in .env.local

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

async function fixUserRole() {
    const userId = 'a44c58e6-be78-4c3e-addc-dceeb7ce6bd4';
    const sql = `
        INSERT INTO public.profiles (id, role, full_name, store_name)
        VALUES ('${userId}', 'admin', 'Geiner Ortiz', 'Súper Tienda El Maná')
        ON CONFLICT (id) DO UPDATE SET role = 'admin';
    `;

    console.log(`Asignando rol ADMIN al usuario ${userId}...`);

    try {
        const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/db/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: sql })
        });

        // The Management API endpoint might be different. Let's try the direct supabase-js with service role if I had it.
        // Actually, let's try to use the anon key if RLS allows insertion (might not).
        // I will try to use a more standard way to run SQL if Management API fails.

        if (response.ok) {
            console.log('✅ Perfil creado/actualizado con éxito.');
        } else {
            const err = await response.text();
            console.error('❌ Error:', err);
        }
    } catch (error) {
        console.error('❌ Error de red:', error.message);
    }
}

fixUserRole();
