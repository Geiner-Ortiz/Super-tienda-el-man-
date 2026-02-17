const fs = require('fs');
const path = require('path');

const PROJECT_REF = 'fvvbigqdbyewzlomrhgj';
const ACCESS_TOKEN = 'sbp_4dcfcc0c6ae5be1c3070824538921b2329148954';

async function applyMigration() {
    const sqlPath = path.resolve(__dirname, 'supabase/migrations/20260217_admin_access.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log(`Aplicando migración a ${PROJECT_REF}...`);

    try {
        const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: sql })
        });

        const result = await response.json();

        if (response.ok) {
            console.log('✅ Migración aplicada con éxito.');
            console.log(result);
        } else {
            console.error('❌ Error al aplicar migración:', result);
        }
    } catch (error) {
        console.error('❌ Error de red:', error.message);
    }
}

applyMigration();
