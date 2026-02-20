const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Error: Faltan variables de entorno en .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function syncProfiles() {
    console.log('🔄 Iniciando sincronización de perfiles...');

    // 1. Obtener todos los usuarios de Auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
        console.error('❌ Error al listar usuarios de Auth:', authError.message);
        return;
    }

    console.log(`👥 Se encontraron ${users.length} usuarios en Auth.`);

    // 2. Sincronizar cada uno en la tabla de profiles
    for (const user of users) {
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                email: user.email,
                full_name: user.raw_user_meta_data?.full_name || user.email.split('@')[0],
                role: user.raw_user_meta_data?.role || 'client',
                store_name: user.raw_user_meta_data?.store_name || 'Mi Tienda'
            }, { onConflict: 'id' });

        if (profileError) {
            console.error(`❌ Error sincronizando a ${user.email}:`, profileError.message);
        } else {
            console.log(`✅ Sincronizado: ${user.email}`);
        }
    }

    console.log('🏁 Sincronización completada.');
}

syncProfiles();
