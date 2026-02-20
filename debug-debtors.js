const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTable() {
    console.log('--- Inspecting debtors table ---');

    // Check if table exists and get columns
    const { data: columns, error: colError } = await supabase
        .rpc('get_table_columns', { table_name: 'debtors' });

    if (colError) {
        // Fallback: try a simple select to see if it fails
        console.log('RPC get_table_columns failed, trying simple SELECT...');
        const { data, error } = await supabase.from('debtors').select('*').limit(1);
        if (error) {
            console.error('Error selecting from debtors:', error.message);
        } else {
            console.log('Table exists and is accessible.');
            if (data.length > 0) {
                console.log('First row columns:', Object.keys(data[0]));
            }
        }
    } else {
        console.log('Columns:', columns);
    }

    // Check RLS
    console.log('\n--- Checking RLS policies ---');
    const { data: policies, error: polError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'debtors');

    if (polError) {
        console.log('Could not fetch policies with anon key (expected).');
    } else {
        console.log('Policies:', policies);
    }
}

inspectTable();
