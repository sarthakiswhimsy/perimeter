import Link from 'next/link';
import SeverityBadge from './SeverityBadge';
import ExploitedBadge from './ExploitedBadge';
import { ChevronRightIcon } from './icons';

export default function ResultRow({ item }) {
  return (
    <Link
      href={`/cve/${item.id}`}
      className="grid grid-cols-1 gap-2 border-b border-border px-4 py-3.5 transition hover:bg-surface2 sm:grid-cols-[160px_1fr_auto] sm:items-center sm:gap-4"
    >
      <span className="font-mono text-sm text-ink">{item.id}</span>
      <span className="line-clamp-2 text-sm text-muted">{item.description}</span>
      <div className="flex items-center gap-2">
        {item.exploited && <ExploitedBadge />}
        <SeverityBadge severity={item.cvss?.baseSeverity} score={item.cvss?.baseScore} />
        <ChevronRightIcon className="h-4 w-4 shrink-0 text-faint" />
      </div>
    </Link>
  );
}
