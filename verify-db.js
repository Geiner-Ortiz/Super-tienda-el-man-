const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('Verificando columnas en la tabla "sales"...');
    const { data, error } = await supabase
        .from('sales')
        .select('payment_method, payment_reference, receipt_url')
        .limit(1);

    if (error) {
        console.error('❌ Error: Las columnas parecen NO existir o no hay acceso.');
        console.error('Mensaje:', error.message);
    } else {
        console.log('✅ Columnas verificadas con éxito.');
    }
}

main();
