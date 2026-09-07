'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function KevList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/kev-recent')
      .then((r) => r.json())
      .then((data) => setItems(data.results || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-xs text-faint">Loading…</p>;
  }

  if (items.length === 0) {
    return <p className="text-xs text-faint">Unable to load the KEV feed right now.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((k) => (
        <li key={k.cveID}>
          <Link href={`/cve/${k.cveID}`} className="group block">
            <span className="font-mono text-xs text-exploited">{k.cveID}</span>
            <p className="mt-0.5 text-xs leading-snug text-muted group-hover:text-ink">{k.vulnerabilityName}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
