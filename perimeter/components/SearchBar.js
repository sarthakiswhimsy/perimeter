'use client';
import { SearchIcon } from './icons';

const SEVERITIES = [
  { value: '', label: 'All severities' },
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

export default function SearchBar({
  query,
  setQuery,
  severity,
  setSeverity,
  exploitedOnly,
  setExploitedOnly,
  onSubmit,
  loading,
}) {
  function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a CVE ID, product, or keyword — e.g. Log4j, CVE-2021-44228, Exchange Server"
          className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-3.5 text-sm text-ink outline-none transition placeholder:text-faint focus:border-exploited/60 focus:ring-1 focus:ring-exploited/30"
        />
      </div>
      <select
        value={severity}
        onChange={(e) => setSeverity(e.target.value)}
        className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-exploited/60"
      >
        {SEVERITIES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      <label className="flex items-center gap-2 whitespace-nowrap px-1 text-sm text-muted">
        <input
          type="checkbox"
          checked={exploitedOnly}
          onChange={(e) => setExploitedOnly(e.target.checked)}
          className="h-4 w-4 rounded-sm border-border bg-surface accent-exploited"
        />
        Exploited only
      </label>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-base transition hover:bg-white disabled:opacity-50"
      >
        {loading ? 'Searching…' : 'Search'}
      </button>
    </form>
  );
}
