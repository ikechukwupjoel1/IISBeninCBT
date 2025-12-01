
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

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
            console.log('Note: Profile data should already exist from seed.sql');
        }
    }
}

createUsers();
