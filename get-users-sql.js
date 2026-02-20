const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

async function getUsers() {
    const query = "SELECT id, email, raw_user_meta_data FROM auth.users";

    try {
        const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });

        const result = await response.json();

        if (response.ok) {
            console.log(JSON.stringify(result, null, 2));
        } else {
            console.error('Error:', result);
        }
    } catch (error) {
        console.error('Network Error:', error.message);
    }
}

getUsers();
