import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase URL or Service Role Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Small sample dataset for CEFR words (expand this using Oxford 5000 JSON later)
const CEFR_DATA = [
  { word: "company", pos: "noun", cefr_level: "A2" },
  { word: "decision", pos: "noun", cefr_level: "B1" },
  { word: "outsource", pos: "verb", cefr_level: "C1" },
  { word: "production", pos: "noun", cefr_level: "B1" },
  { word: "fierce", pos: "adjective", cefr_level: "B2" },
  { word: "opposition", pos: "noun", cefr_level: "B2" },
  { word: "local", pos: "adjective", cefr_level: "A2" },
  { word: "labor", pos: "noun", cefr_level: "B1" },
  { word: "union", pos: "noun", cefr_level: "B1" },
  { word: "fear", pos: "verb", cefr_level: "B1" },
  { word: "significant", pos: "adjective", cefr_level: "B2" },
  { word: "job", pos: "noun", cefr_level: "A1" },
  { word: "loss", pos: "noun", cefr_level: "B1" },
];

async function seed() {
  console.log("Seeding CEFR wordlist...");
  
  // Upsert to avoid duplicates if run multiple times
  const { data, error } = await supabase
    .from('cefr_wordlist')
    .upsert(
      CEFR_DATA.map(item => ({
        word: item.word,
        pos: item.pos,
        cefr_level: item.cefr_level
      })),
      { onConflict: 'word' } // Note: requires unique constraint on 'word' if using upsert. We'll just insert for now.
    );
    
  if (error) {
    console.error("Error seeding:", error);
  } else {
    console.log("Successfully seeded CEFR words.");
  }
}

seed().catch(console.error);
