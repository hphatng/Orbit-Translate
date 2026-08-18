/**
 * Scan & Extract Benchmark Runner
 *
 * Tests the production Gemini pipeline against the Mark Walter sentence.
 *
 * Usage:
 *   # Option A: Using Supabase service role (creates test user automatically)
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=xxx \
 *   node scripts/run-benchmark.js
 *
 *   # Option B: Using existing test user credentials
 *   TEST_EMAIL=user@example.com \
 *   TEST_PASSWORD=password \
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_ANON_KEY=xxx \
 *   node scripts/run-benchmark.js
 *
 *   # Option C: Direct API key test (no Supabase needed)
 *   GEMINI_API_KEY=xxx \
 *   node scripts/run-benchmark.js --direct
 */

import { createClient } from '@supabase/supabase-js';
import { extractFromTextAI } from '../src/lib/ai/extractFromTextAI.ts';
import type { ExtractedLearningItem } from '../shared/schemas.ts';

const MARK_WALTER_TEXT = `Mark Walter stunned the sports world in 2012 with a deal that left his wealthy rivals wondering how the chief executive of Guggenheim Partners, little-known outside Wall Street, had funded the purchase of the Los Angeles Dodgers, one of the premier teams in Major League Baseball.`;

const EXPECTED_ITEMS = {
  vocabulary: ['world', 'sports', 'stunned', 'wealthy', 'rivals', 'purchase', 'funded', 'premier', 'chief', 'executive'],
  properNouns: ['Mark Walter', 'Guggenheim Partners', 'Los Angeles Dodgers', 'Major League Baseball', 'Wall Street'],
  phrases: ['sports world', 'chief executive', 'purchase of', 'premier teams'],
  grammar: ['past simple', 'past perfect', 'defining relative clause', 'leave + object + V-ing', 'embedded noun clause'],
};

// Expected items from the spec (these are minimums, not hardcoded targets)
const VOCAB_MINIMUM = 8;  // at least 8 vocabulary items
const PHRASE_MINIMUM = 2;  // at least 2 phrases
const GRAMMAR_MINIMUM = 2;  // at least 2 grammar structures
const PROPER_NOUN_MINIMUM = 3; // at least 3 proper nouns

function log(label, value) {
  console.log(`  ${label}: ${value}`);
}

function scoreItem(actual: string, expected: string[]): 'pass' | 'fail' | 'partial' {
  const lower = actual.toLowerCase();
  const exact = expected.find(e => e.toLowerCase() === lower);
  if (exact) return 'pass';
  const partial = expected.find(e => e.toLowerCase().includes(lower) || lower.includes(e.toLowerCase()));
  return partial ? 'partial' : 'fail';
}

async function runDirectBenchmark(apiKey: string) {
  console.log('\n🚀 DIRECT BENCHMARK (no Supabase)\n');
  console.log('=' .repeat(60));
  console.log('Model: gemini-2.5-pro');
  console.log('Text length:', MARK_WALTER_TEXT.length, 'chars');
  console.log('=' .repeat(60));

  const start = Date.now();
  const outcome = await extractFromTextAI(
    {
      text: MARK_WALTER_TEXT,
      targetCEFR: 'B2',
      sourceTitle: 'Mark Walter Benchmark',
    },
    [{ id: 'direct', key: apiKey, status: 'ACTIVE' }],
  );
  const elapsed = Date.now() - start;

  if (!outcome.success) {
    console.log('\n❌ EXTRACTION FAILED');
    console.log('Error:', outcome.error);
    return;
  }

  const items = outcome.result.items;
  const meta = outcome.meta;

  console.log('\n📊 RESULTS');
  console.log('-'.repeat(40));
  log('Latency', `${elapsed}ms`);
  log('Model used', meta?.model ?? 'unknown');
  log('Attempts', meta?.attempts ?? 1);
  log('Total items', items.length);

  // Count by type
  const byType: Record<string, number> = {};
  for (const item of items) {
    byType[item.entryType] = (byType[item.entryType] ?? 0) + 1;
  }
  for (const [type, count] of Object.entries(byType)) {
    log(`  ${type}`, count);
  }

  console.log('\n📋 FIELD COMPLETENESS');
  const completeness = {
    translation: 0,
    cefr: 0,
    pos: 0,
    ipa: 0,
    context: 0,
  };
  for (const item of items) {
    if (item.translation && item.translation.length > 0) completeness.translation++;
    if (item.cefrLevel) completeness.cefr++;
    if (item.partOfSpeech) completeness.pos++;
    if (item.phonetic) completeness.ipa++;
    if (item.context?.original) completeness.context++;
  }
  const n = items.length || 1;
  for (const [field, count] of Object.entries(completeness)) {
    const pct = Math.round((count / n) * 100);
    const ok = pct >= 90 || (field === 'ipa' && pct >= 60);
    console.log(`  ${ok ? '✅' : '⚠️ '}${field}: ${pct}% (${count}/${n})`);
  }

  console.log('\n🎯 QUALITY GATES');
  let passed = 0;
  let failed = 0;

  const vocabItems = items.filter(i => i.entryType === 'WORD');
  const phraseItems = items.filter(i => i.entryType === 'PHRASE' || i.entryType === 'COLLOCATION');
  const grammarItems = items.filter(i => i.entryType === 'GRAMMAR');
  const nounItems = items.filter(i => i.entryType === 'PROPER_NOUN');

  const check = (label: string, pass: boolean) => {
    console.log(`  ${pass ? '✅' : '❌'} ${label}`);
    pass ? passed++ : failed++;
  };

  check(`Vocabulary recall >= ${VOCAB_MINIMUM} (got ${vocabItems.length})`, vocabItems.length >= VOCAB_MINIMUM);
  check(`Phrase recall >= ${PHRASE_MINIMUM} (got ${phraseItems.length})`, phraseItems.length >= PHRASE_MINIMUM);
  check(`Grammar recall >= ${GRAMMAR_MINIMUM} (got ${grammarItems.length})`, grammarItems.length >= GRAMMAR_MINIMUM);
  check(`Proper noun recall >= ${PROPER_NOUN_MINIMUM} (got ${nounItems.length})`, nounItems.length >= PROPER_NOUN_MINIMUM);

  // Field completeness gates
  check(`Translation completeness >= 95%`, Math.round((completeness.translation / n) * 100) >= 95);
  check(`CEFR completeness >= 95%`, Math.round((completeness.cefr / n) * 100) >= 95);
  check(`Context completeness = 100%`, completeness.context === n);

  // Check for "Unknown" CEFR (the bug we're guarding against)
  const unknownCEFR = items.filter(i => (i as any).cefrLevel === 'Unknown');
  check(`No "Unknown" CEFR values (got ${unknownCEFR.length})`, unknownCEFR.length === 0);

  console.log(`\n${passed} passed / ${failed} failed`);

  if (failed > 0) {
    console.log('\n❌ BENCHMARK FAILED — see failures above');
    process.exit(1);
  } else {
    console.log('\n✅ BENCHMARK PASSED');
  }

  // Print all extracted items for review
  console.log('\n📝 EXTRACTED ITEMS');
  console.log('-'.repeat(80));
  for (const item of items) {
    console.log(`  [${item.entryType}] ${item.term}`);
    if (item.cefrLevel) console.log(`    CEFR: ${item.cefrLevel} | POS: ${item.partOfSpeech ?? '-'}`);
    if (item.phonetic) console.log(`    IPA: ${item.phonetic}`);
    console.log(`    VN: ${item.translation}`);
    if (item.grammarBreakdown) console.log(`    Grammar: ${item.grammarBreakdown.structure ?? JSON.stringify(item.grammarBreakdown)}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isDirect = args.includes('--direct') || process.env.GEMINI_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASSWORD;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (isDirect) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY environment variable required for direct mode');
      process.exit(1);
    }
    await runDirectBenchmark(apiKey);
    return;
  }

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing Supabase credentials');
    console.error('   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  // Use service role key to create a test user
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const testEmail = email || `orbit-benchmark-${Date.now()}@test.orbit`;
  const testPassword = password || `Benchmark${Date.now()}!`;

  console.log(`🔧 Creating test user: ${testEmail}`);
  const { data: user, error: authErr } = await admin.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
  });

  if (authErr) {
    console.error('❌ Auth error:', authErr.message);
    process.exit(1);
  }

  const uid = user.user.id;
  console.log(`✅ Created test user: ${uid}`);

  // Create profile with API key
  await admin.from('profiles').upsert({
    id: uid,
    email: testEmail,
    full_name: 'Benchmark Test User',
    target_cefr: 'B2',
    api_keys: process.env.BENCHMARK_API_KEYS
      ? JSON.parse(process.env.BENCHMARK_API_KEYS)
      : [],
  }, { onConflict: 'id' });

  // Sign in as the test user
  const { data: session } = await admin.auth.admin.generateLink({
    type: 'signup',
    email: testEmail,
    password: testPassword,
  }).catch(() => null) as any;

  // Alternative: use anon sign in
  const { data: signInData } = await admin.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (!signInData?.session?.access_token) {
    console.error('❌ Cannot authenticate test user');
    process.exit(1);
  }

  const token = signInData.session.access_token;
  console.log('✅ Authenticated as test user');

  // Run the benchmark via HTTP
  const response = await fetch(`${supabaseUrl}/functions/v1/documents-parse`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: MARK_WALTER_TEXT,
      targetCEFR: 'B2',
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error(`❌ API error ${response.status}: ${err}`);
    process.exit(1);
  }

  const { jobId } = await response.json();
  console.log(`📄 Job created: ${jobId}`);

  // Poll for completion
  let attempts = 0;
  let result;
  while (attempts < 30) {
    await new Promise(r => setTimeout(r, 2000));
    const statusRes = await fetch(`${supabaseUrl}/rest/v1/document_jobs?id=${jobId}&select=status,result_summary,error_message`, {
      headers: { 'Authorization': `Bearer ${token}`, 'apikey': anonKey! }
    });
    const jobs = await statusRes.json();
    result = jobs[0];
    if (result?.status === 'COMPLETED' || result?.status === 'FAILED') break;
    attempts++;
    process.stdout.write('.');
  }
  console.log('');

  if (result?.status === 'FAILED') {
    console.error('❌ Job failed:', result.error_message);
    process.exit(1);
  }

  const items: ExtractedLearningItem[] = result?.result_summary?.extracted_items ?? [];
  console.log(`✅ Extracted ${items.length} items`);

  // Print results
  for (const item of items) {
    console.log(`  [${item.entryType}] ${item.term} — ${item.translation}`);
  }

  // Cleanup
  await admin.auth.admin.deleteUser(uid);
  console.log('🧹 Cleaned up test user');
}

main().catch(e => {
  console.error('❌ Fatal:', e);
  process.exit(1);
});
