/**
 * Create Demo Teacher/Admin Accounts
 * Run this script to set up demo accounts with Supabase Auth
 * 
 * Usage: node scripts/create-demo-accounts.mjs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://kbetovvbispxqafanmdv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need service role key for admin operations

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment variables');
  console.log('\n📝 To get your Service Role Key:');
  console.log('1. Go to Supabase Dashboard → Settings → API');
  console.log('2. Copy the "service_role" secret key (NOT the anon key)');
  console.log('3. Add to .env file: SUPABASE_SERVICE_ROLE_KEY=your_key_here');
  console.log('4. Run this script again\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createDemoAccounts() {
  console.log('🚀 Creating demo teacher and admin accounts...\n');

  // Demo accounts to create
  const accounts = [
    {
      email: 'admin@demo.com',
      password: 'admin',
      role: 'ADMIN',
      name: 'Demo Administrator',
      subject: null,
      phone: null
    },
    {
      email: 'teacher@demo.com',
      password: 'school',
      role: 'TEACHER',
      name: 'Demo Teacher',
      subject: 'Mathematics',
      phone: '+229-99999999'
    }
  ];

  for (const account of accounts) {
    try {
      console.log(`📧 Creating ${account.role}: ${account.email}...`);

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          name: account.name,
          role: account.role
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`   ⚠️  Account already exists, skipping...`);
          continue;
        }
        throw authError;
      }

      console.log(`   ✅ Auth account created (ID: ${authData.user.id})`);

      // Create or update user profile
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: authData.user.id,
          email: account.email,
          name: account.name,
          role: account.role,
          subject: account.subject,
          phone: account.phone,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(account.name)}&background=${account.role === 'ADMIN' ? '1e3655' : '36609e'}&color=fff`
        }, {
          onConflict: 'id'
        });

      if (profileError) throw profileError;

      console.log(`   ✅ Profile created in users table`);
      console.log(`   🔑 Login: ${account.email} / ${account.password}\n`);

    } catch (error) {
      console.error(`   ❌ Error creating ${account.email}:`, error.message);
    }
  }

  console.log('✨ Demo accounts setup complete!\n');
  console.log('📋 Login Credentials:');
  console.log('   Admin:   admin@demo.com / admin');
  console.log('   Teacher: teacher@demo.com / school');
  console.log('   Student: IIS-2024-001 / 12345\n');
}

createDemoAccounts()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
