import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
    }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...\n');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT FOUND');

if (!supabaseUrl || !supabaseKey || supabaseKey === 'your-anon-key-here') {
    console.error('\n❌ Missing or placeholder Supabase credentials in .env.local');
    console.log('\n📝 Please update .env.local with your actual Supabase anon key.');
    console.log('   Get it from: Supabase Dashboard → Settings → API → anon public key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        // Test 1: Check if tables exist
        console.log('\n📋 Test 1: Checking if tables exist...');
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('count')
            .limit(1);

        if (usersError) {
            console.error('❌ Users table error:', usersError.message);
            console.log('\n⚠️  Schema may not be created yet.');
            console.log('   Please run schema.sql in Supabase SQL Editor:');
            console.log('   1. Open Supabase Dashboard → SQL Editor');
            console.log('   2. Copy contents of supabase/schema.sql');
            console.log('   3. Paste and click "Run"');
            return false;
        }
        console.log('✅ Users table exists');

        // Test 2: Check for demo data
        console.log('\n📋 Test 2: Checking for demo data...');
        const { data: students, error: studentsError } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'STUDENT')
            .limit(5);

        if (studentsError) {
            console.error('❌ Error querying students:', studentsError.message);
            return false;
        }

        if (students && students.length > 0) {
            console.log(`✅ Found ${students.length} demo students`);
            students.forEach(s => {
                console.log(`   - ${s.name} (${s.reg_number})`);
            });
        } else {
            console.log('⚠️  No demo data found.');
            console.log('   Please run seed.sql in Supabase SQL Editor:');
            console.log('   1. Open Supabase Dashboard → SQL Editor → New Query');
            console.log('   2. Copy contents of supabase/seed.sql');
            console.log('   3. Paste and click "Run"');
        }

        // Test 3: Check exams table
        console.log('\n📋 Test 3: Checking exams table...');
        const { data: exams, error: examsError } = await supabase
            .from('exams')
            .select('*')
            .limit(5);

        if (examsError) {
            console.error('❌ Exams table error:', examsError.message);
            return false;
        }
        console.log(`✅ Exams table exists (${exams?.length || 0} exams found)`);
        if (exams && exams.length > 0) {
            exams.forEach(e => {
                console.log(`   - ${e.title} (${e.subject})`);
            });
        }

        console.log('\n✅ All tests passed! Supabase is properly configured.');
        console.log('\n📊 Summary:');
        console.log(`   - Tables: Created ✅`);
        console.log(`   - Demo Data: ${students && students.length > 0 ? 'Loaded ✅' : 'Missing ⚠️'}`);
        console.log(`   - Connection: Working ✅`);
        return true;
    } catch (error) {
        console.error('\n❌ Connection test failed:', error.message);
        return false;
    }
}

testConnection().then(success => {
    process.exit(success ? 0 : 1);
});
