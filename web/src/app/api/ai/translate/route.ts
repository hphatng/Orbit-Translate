import { NextRequest, NextResponse } from 'next/server';
import { translateWithGoogle } from '@/lib/translator';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = typeof body.text === 'string' ? body.text : '';
    const targetLang = typeof body.targetLang === 'string' ? body.targetLang : 'vi';
    const sourceLang = typeof body.sourceLang === 'string' ? body.sourceLang : 'auto';

    if (!text.trim()) {
      return NextResponse.json({ success: false, error: 'No text provided' }, { status: 400 });
    }

    const translation = await translateWithGoogle(text, targetLang, sourceLang);
    return NextResponse.json({ success: true, translation });
  } catch (error: any) {
    console.error('[API /api/ai/translate] Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Translation failed' }, { status: 500 });
  }
}
