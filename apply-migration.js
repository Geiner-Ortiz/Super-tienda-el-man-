const fs = require('fs');
const path = require('path');

// Cargar variables de entorno desde .env.local
require('dotenv').config({ path: '.env.local' });

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!PROJECT_REF || !ACCESS_TOKEN) {
    console.error('❌ Error: Faltan variables de entorno SUPABASE_PROJECT_REF o SUPABASE_ACCESS_TOKEN en .env.local');
    process.exit(1);
}

async function applyMigration() {
    const migrationFile = process.argv[2] || 'supabase/migrations/20260218_multiple_debts.sql';
    const sqlPath = path.resolve(__dirname, migrationFile);

    if (!fs.existsSync(sqlPath)) {
        console.error(`❌ Error: El archivo ${sqlPath} no existe.`);
        process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log(`Aplicando migración ${migrationFile} a ${PROJECT_REF}...`);

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
