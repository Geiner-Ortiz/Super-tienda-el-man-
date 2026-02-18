require('dotenv').config({ path: '.env.local' });

const token = process.env.SUPABASE_ACCESS_TOKEN;

async function test() {
    console.log('Testing token on https://api.supabase.com/v1/projects ...');
    try {
        const res = await fetch('https://api.supabase.com/v1/projects', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (res.ok) {
            const projects = await res.json();
            const projectIds = projects.map(p => p.id);
            console.log('✅ Token válido. Proyectos encontrados:', projectIds);

            const currentRef = process.env.SUPABASE_PROJECT_REF;
            if (projectIds.includes(currentRef)) {
                console.log(`✅ El proyecto actual (${currentRef}) está en la lista.`);
            } else {
                console.error(`⚠️ El proyecto actual (${currentRef}) NO está en la lista de este token.`);
            }
        } else {
            console.error('❌ Error de API:', res.status, await res.text());
        }
    } catch (e) {
        console.error('❌ Error de red:', e.message);
    }
}

test();
