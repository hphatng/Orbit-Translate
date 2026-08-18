/**
 * Supabase Direct Benchmark Script
 *
 * Uses Supabase service role to:
 * 1. Find or create the logged-in user's profile
 * 2. Read their API keys
 * 3. Run the Mark Walter benchmark
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=xxx \
 *   BENCHMARK_USER_EMAIL=user@example.com \
 *   node scripts/supabase-benchmark.js
 *
 * If no email is provided, it will try to read the user's profile
 * from localStorage orbit_user_email (requires browser).
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { extractFromTextAI } from '../src/lib/ai/extractFromTextAI.ts';
import type { ExtractedLearningItem } from '../../shared/schemas.ts';

const MARK_WALTER_TEXT = `Mark Walter stunned the sports world in 2012 with a deal that left his wealthy rivals wondering how the chief executive of Guggenheim Partners, little-known outside Wall Street, had funded the purchase of the Los Angeles Dodgers, one of the premier teams in Major League Baseball.`;

const MIN_VOCAB = 8;
const MIN_PHRASE = 2;
const MIN_GRAMMAR = 2;
const MIN_PROPER_NOUN = 3;

function log(label, value) {
  console.log(`  ${label}: ${value}`);
}

async function main() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const userEmail = process.env.BENCHMARK_USER_EMAIL;

  if (!url || !serviceKey) {
    console.error('❌  Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    console.error('    These should be in web/.env.local');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Find user by email
  if (!userEmail) {
    console.error('❌  Missing BENCHMARK_USER_EMAIL');
    console.error('    Set this to the email of the user you want to test with');
    process.exit(1);
  }

  console.log(`\n🔍 Looking up user: ${userEmail}`);

  // List all users (admin API)
  const { data: authUsers, error: listError } = await (supabase.auth.admin as any).listUsers();
  if (listError) {
    console.error('❌  Cannot list users:', listError.message);
    process.exit(1);
  }

  const user = authUsers?.users?.find((u: any) => u.email === userEmail);
  if (!user) {
    console.error(`❌  User not found: ${userEmail}`);
    process.exit(1);
  }

  const uid = user.id;
  console.log(`✅  Found user: ${uid}`);

  // Read profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('api_keys, target_cefr')
    .eq('id', uid)
    .single();

  if (profileError) {
    console.error('❌  Cannot read profile:', profileError.message);
    process.exit(1);
  }

  const apiKeys: any[] = Array.isArray(profile?.api_keys) ? profile.api_keys : [];
  console.log(`\n📋 Profile:`);
  log('API Keys', apiKeys.length);
  log('Target CEFR', profile?.target_cefr ?? 'B2 (default)');

  if (apiKeys.length === 0) {
    console.error('\n❌  No API keys found in profile.');
    console.error('    Please add a Gemini API key in the app at /settings/api-keys');
    process.exit(1);
  }

  // Print masked keys
  for (const k of apiKeys) {
    const masked = k.key ? `***${k.key.slice(-4)}` : '(no key)';
    console.log(`    - ${k.name ?? 'unnamed'}: ${masked} [${k.status ?? 'ACTIVE'}]`);
  }

  // Run benchmark
  console.log('\n🚀 Running Mark Walter Benchmark\n');
  console.log('=' .repeat(60));
  console.log(`Text: "${MARK_WALTER_TEXT.slice(0, 80)}..."`);
  console.log(`Length: ${MARK_WALTER_TEXT.length} chars`);
  console.log('=' .repeat(60));

  const start = Date.now();
  const outcome = await extractFromTextAI(
    {
      text: MARK_WALTER_TEXT,
      targetCEFR: (profile?.target_cefr as any) ?? 'B2',
      sourceTitle: 'Mark Walter Benchmark',
    },
    apiKeys,
  );
  const elapsed = Date.now() - start;

  if (!outcome.success) {
    console.error('\n❌  EXTRACTION FAILED');
    console.error('    Error:', outcome.error);
    process.exit(1);
  }

  const items = outcome.result.items;
  const meta = outcome.meta;

  console.log('\n📊 RAW RESULTS');
  console.log('-'.repeat(40));
  log('Latency', `${elapsed}ms`);
  log('Model', meta?.model ?? 'unknown');
  log('Attempts', meta?.attempts ?? 1);
  log('Total items', items.length);

  const byType: Record<string, number> = {};
  for (const item of items) {
    byType[item.entryType] = (byType[item.entryType] ?? 0) + 1;
  }
  for (const [type, count] of Object.entries(byType)) {
    log(`  ${type}`, count);
  }

  // Field completeness
  const n = items.length || 1;
  console.log('\n📋 FIELD COMPLETENESS');
  for (const [field, count] of [
    ['Translation', items.filter(i => i.translation?.length > 0).length],
    ['CEFR', items.filter(i => !!i.cefrLevel).length],
    ['POS', items.filter(i => !!i.partOfSpeech).length],
    ['IPA (WORD only)', items.filter(i => i.entryType === 'WORD' && i.phonetic).length],
    ['Context', items.filter(i => !!i.context?.original).length],
  ]) {
    const pct = Math.round((count / n) * 100);
    const ok = pct >= 95 || (field.includes('IPA') && pct >= 60);
    console.log(`  ${ok ? '✅' : '⚠️ '} ${field}: ${pct}% (${count}/${n})`);
  }

  // Quality gates
  const vocabItems = items.filter(i => i.entryType === 'WORD');
  const phraseItems = items.filter(i => i.entryType === 'PHRASE' || i.entryType === 'COLLOCATION');
  const grammarItems = items.filter(i => i.entryType === 'GRAMMAR');
  const nounItems = items.filter(i => i.entryType === 'PROPER_NOUN');

  console.log('\n🎯 QUALITY GATES');
  let passed = 0, failed = 0;
  const check = (label: string, pass: boolean) => {
    console.log(`  ${pass ? '✅' : '❌'} ${label}`);
    pass ? passed++ : failed++;
  };

  check(`Vocabulary recall >= ${MIN_VOCAB} (got ${vocabItems.length})`, vocabItems.length >= MIN_VOCAB);
  check(`Phrase recall >= ${MIN_PHRASE} (got ${phraseItems.length})`, phraseItems.length >= MIN_PHRASE);
  check(`Grammar recall >= ${MIN_GRAMMAR} (got ${grammarItems.length})`, grammarItems.length >= MIN_GRAMMAR);
  check(`Proper noun recall >= ${MIN_PROPER_NOUN} (got ${nounItems.length})`, nounItems.length >= MIN_PROPER_NOUN);

  const translationPct = Math.round(items.filter(i => i.translation?.length > 0).length / n * 100);
  check(`Translation completeness >= 95% (got ${translationPct}%)`, translationPct >= 95);

  const cefrPct = Math.round(items.filter(i => !!i.cefrLevel).length / n * 100);
  check(`CEFR completeness >= 95% (got ${cefrPct}%)`, cefrPct >= 95);

  const contextCount = items.filter(i => !!i.context?.original).length;
  check(`Context completeness = 100% (got ${contextCount}/${n})`, contextCount === n);

  const unknownCEFR = items.filter(i => (i as any).cefrLevel === 'Unknown').length;
  check(`No "Unknown" CEFR (got ${unknownCEFR})`, unknownCEFR === 0);

  // Duplicate rate
  const dedupReport = (outcome as any).report;
  if (dedupReport) {
    const dupRate = Math.round(dedupReport.dedupedCount / (dedupReport.dedupedCount + n) * 100);
    check(`Duplicate rate < 2% (got ${dupRate}%)`, dupRate < 2);
  }

  // Print all items
  console.log('\n📝 EXTRACTED ITEMS');
  console.log('-'.repeat(80));
  for (const item of items) {
    const cefr = item.cefrLevel ?? '-';
    const pos = item.partOfSpeech ?? '-';
    const ipa = item.phonetic ?? '';
    console.log(`  [${item.entryType}] ${item.term}  (${cefr} | ${pos})`);
    if (ipa) console.log(`    IPA: ${ipa}`);
    console.log(`    VN: ${item.translation}`);
    if (item.grammarBreakdown) {
      console.log(`    Grammar: ${item.grammarBreakdown.structure ?? JSON.stringify(item.grammarBreakdown)}`);
    }
  }

  // Overall verdict
  console.log(`\n${'='.repeat(40)}`);
  console.log(`${passed} passed / ${failed} failed`);

  if (failed > 0) {
    console.log('\n❌ BENCHMARK FAILED');
    process.exit(1);
  } else {
    console.log('\n✅ BENCHMARK PASSED — All gates met');
  }
}

main().catch(e => {
  console.error('\n❌ Fatal error:', e.message ?? e);
  process.exit(1);
});
