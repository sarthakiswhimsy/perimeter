import { NextResponse } from 'next/server';
import { searchCves, getKevCatalog, findKevEntry } from '../../../lib/nvd';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  const severity = searchParams.get('severity') || '';
  const exploitedOnly = searchParams.get('exploitedOnly') === 'true';
  const startIndex = parseInt(searchParams.get('startIndex') || '0', 10);

  if (!q) {
    return NextResponse.json({ error: 'A search term is required.' }, { status: 400 });
  }

  try {
    const [searchData, kevList] = await Promise.all([
      searchCves({ keyword: q, severity, startIndex }),
      getKevCatalog().catch(() => []),
    ]);

    let results = searchData.vulnerabilities.map((v) => {
      const kevEntry = findKevEntry(v.id, kevList);
      return { ...v, exploited: !!kevEntry, kev: kevEntry };
    });

    if (exploitedOnly) {
      results = results.filter((v) => v.exploited);
    }

    return NextResponse.json({ totalResults: searchData.totalResults, results });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Search failed.' }, { status: 502 });
  }
}
