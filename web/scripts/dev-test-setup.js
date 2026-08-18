/**
 * Dev test setup script.
 * Creates a test user in Supabase for the Scan & Extract benchmark.
 * 
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=xxx \
 *   node scripts/dev-test-setup.js
 *
 * This uses the service_role key (bypasses RLS) to create a test user
 * and insert their profile + API keys.
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const testEmail = process.env.TEST_EMAIL || 'orbit-test@orbittranslate.ai';
const testPassword = process.env.TEST_PASSWORD || 'TestPassword123!';

if (!url || !serviceKey) {
  console.error('❌  Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Admin client (bypasses RLS)
const supabaseAdmin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function setup() {
  console.log(`🔧 Setting up test user: ${testEmail}`);
  
  // 1. Create or get the test user
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true, // Auto-confirm so we can use immediately
    user_metadata: { full_name: 'Orbit Test User' },
  });

  if (authError) {
    if (authError.message.includes('already been registered')) {
      console.log('ℹ️  Test user already exists — fetching user ID');
      const { data: existing } = await supabaseAdmin.auth.admin.listUsers();
      const user = existing?.users.find(u => u.email === testEmail);
      if (!user) {
        console.error('❌  Cannot find existing test user');
        process.exit(1);
      }
      console.log(`✅  Test user ready: ${user.id}`);
      console.log(`    Email: ${testEmail}`);
      console.log(`    Password: ${testPassword}`);
      return;
    }
    console.error('❌  Auth error:', authError.message);
    process.exit(1);
  }

  const userId = authUser.user.id;
  console.log(`✅  Created test user: ${userId}`);

  // 2. Create profile
  const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
    id: userId,
    email: testEmail,
    full_name: 'Orbit Test User',
    target_cefr: 'B2',
    daily_goal: 20,
    api_keys: [
      // Placeholder — replace with real Gemini keys for testing
      // { id: 'test-key-1', key: 'REAL_GEMINI_KEY_HERE', status: 'ACTIVE' }
    ],
  }, { onConflict: 'id' });

  if (profileError) {
    console.error('⚠️  Profile upsert error:', profileError.message);
  } else {
    console.log('✅  Profile created/updated');
  }

  // 3. Create default decks
  const { error: deckError } = await supabaseAdmin.from('decks').insert([
    { user_id: userId, title: '🔥 Chrome Extension Today', description: 'Words synced from Chrome Extension today', category: 'General', color: 'amber', icon_name: 'flame' },
    { user_id: userId, title: 'Tài Liệu Scan AI', description: 'Words from Scan & Extract', category: 'Scan AI', color: 'indigo', icon_name: 'file-search' },
  ]);
  if (deckError) {
    console.error('⚠️  Deck insert error:', deckError.message);
  } else {
    console.log('✅  Default decks created');
  }

  console.log('\n📋 Test credentials:');
  console.log(`   Email: ${testEmail}`);
  console.log(`   Password: ${testPassword}`);
  console.log('\n⚠️  Add real Gemini API keys to the profile in Settings after logging in.');
}

setup().catch(e => {
  console.error('❌  Script error:', e);
  process.exit(1);
});
