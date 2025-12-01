
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // Using Anon key for client-side signup

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const users = [
    { email: 'teacher@demo.com', password: 'school', role: 'TEACHER' },
    { email: 'admin@iisbenin.edu', password: 'admin', role: 'ADMIN' }
];

async function createUsers() {
    console.log('Creating demo users...');

    for (const user of users) {
        console.log(`Creating user: ${user.email}`);

        const { data, error } = await supabase.auth.signUp({
            email: user.email,
            password: user.password,
        });

        if (error) {
            console.error(`Error creating ${user.email}:`, error.message);
        } else if (data.user) {
            console.log(`Successfully created auth user for ${user.email} (${data.user.id})`);
        } else {
            console.log(`User ${user.email} might already exist or require confirmation.`);
        }
    }
}

createUsers();
