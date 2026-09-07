import { NextResponse } from 'next/server';
import { getKevCatalog } from '../../../lib/nvd';

export async function GET() {
  try {
    const list = await getKevCatalog();
    const sorted = [...list]
      .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
      .slice(0, 12);
    return NextResponse.json({ results: sorted });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to load KEV feed.' }, { status: 502 });
  }
}
