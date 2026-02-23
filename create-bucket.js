const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no están definidas en .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
    console.log('Creando bucket "receipts"...');

    const { data, error } = await supabase.storage.createBucket('receipts', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
        fileSizeLimit: 5242880 // 5MB
    });

    if (error) {
        if (error.message.includes('already exists')) {
            console.log('✅ El bucket "receipts" ya existe.');
        } else {
            console.error('❌ Error al crear bucket:', error.message);
            process.exit(1);
        }
    } else {
        console.log('✅ Bucket "receipts" creado con éxito.');
    }

    // Set RLS Policies (Note: storage.objects policies are usually set via SQL, 
    // but for buckets, creation is often enough if it's public for reads)
    console.log('Nota: Asegúrate de que las políticas RLS permitan la subida.');
}

main();
