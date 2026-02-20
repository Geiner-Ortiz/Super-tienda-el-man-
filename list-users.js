const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Note: Using service role key here to access auth.users
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ACCESS_TOKEN; // Wait, I see SUPABASE_ACCESS_TOKEN in .env.local

const supabase = createClient(supabaseUrl, supabaseKey);

async function listUsers() {
    // try to list users if possible, or just check the current session
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log(JSON.stringify(users.map(u => ({ id: u.id, email: u.email })), null, 2));
    }
}

listUsers();
