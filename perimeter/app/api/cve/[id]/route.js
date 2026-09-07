import { NextResponse } from 'next/server';
import { getCveById, getKevCatalog, findKevEntry } from '../../../../lib/nvd';

export async function GET(request, { params }) {
  const { id } = params;
  if (!id || !/^CVE-\d{4}-\d{4,}$/i.test(id)) {
    return NextResponse.json({ error: 'Invalid CVE ID format.' }, { status: 400 });
  }

  try {
    const [cve, kevList] = await Promise.all([
      getCveById(id.toUpperCase()),
      getKevCatalog().catch(() => []),
    ]);

    if (!cve) {
      return NextResponse.json({ error: 'CVE not found.' }, { status: 404 });
    }

    const kevEntry = findKevEntry(cve.id, kevList);
    return NextResponse.json({ ...cve, exploited: !!kevEntry, kev: kevEntry });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Lookup failed.' }, { status: 502 });
  }
}
