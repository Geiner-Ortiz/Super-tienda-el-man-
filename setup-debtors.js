const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createDebtorsTable() {
    console.log('Iniciando creación de tabla debtors...');

    const sql = `
    CREATE TABLE IF NOT EXISTS debtors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );

    ALTER TABLE debtors ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can view their own debtors" ON debtors;
    CREATE POLICY "Users can view their own debtors" ON debtors FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can insert their own debtors" ON debtors;
    CREATE POLICY "Users can insert their own debtors" ON debtors FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update their own debtors" ON debtors;
    CREATE POLICY "Users can update their own debtors" ON debtors FOR UPDATE USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete their own debtors" ON debtors;
    CREATE POLICY "Users can delete their own debtors" ON debtors FOR DELETE USING (auth.uid() = user_id);
    `;

    // Asumimos que el usuario tiene acceso para ejecutar SQL si usa el dashboard de Supabase.
    // Aquí intentaremos insertar un registro de prueba para ver si falla por tabla inexistente.
    console.log('Intenta ejecutar esto en el SQL Editor de Supabase:');
    console.log(sql);

    // Check if table exists
    const { error } = await supabase.from('debtors').select('id').limit(1);
    if (error && error.message.includes('Could not find the table')) {
        console.error('ERROR: La tabla "debtors" no existe en Supabase.');
    } else {
        console.log('La tabla "debtors" ya existe o el error es otro:', error?.message);
    }
}

createDebtorsTable();
