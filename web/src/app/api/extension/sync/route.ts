import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'This endpoint has been deprecated. Extension now syncs directly with Supabase.' },
    { status: 410 }
  );
}
