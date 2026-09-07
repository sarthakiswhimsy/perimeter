'use client';
import { useState } from 'react';
import SearchBar from '../components/SearchBar';
import ResultRow from '../components/ResultRow';
import SkeletonRows from '../components/SkeletonRows';
import KevList from '../components/KevList';
import { ChevronRightIcon, ArrowLeftIcon } from '../components/icons';

const PAGE_SIZE = 20;
const SUGGESTIONS = ['Log4j', 'Exchange Server', 'MOVEit', 'Fortinet', 'CVE-2024-3400'];

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [severity, setSeverity] = useState('');
  const [exploitedOnly, setExploitedOnly] = useState(false);

  const [results, setResults] = useState(null);
  const [total, setTotal] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastQuery, setLastQuery] = useState('');
  const [activeParams, setActiveParams] = useState(null);

  async function performSearch({ q, sev, excl, idx = 0 }) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ q });
      if (sev) params.set('severity', sev);
      if (excl) params.set('exploitedOnly', 'true');
      if (idx) params.set('startIndex', String(idx));
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search failed.');
      setResults(data.results);
      setTotal(data.totalResults);
      setLastQuery(q);
      setStartIndex(idx);
      setActiveParams({ q, sev, excl });
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit() {
    performSearch({ q: query.trim(), sev: severity, excl: exploitedOnly, idx: 0 });
  }

  function handleSuggestion(term) {
    setQuery(term);
    setSeverity('');
    setExploitedOnly(false);
    performSearch({ q: term, sev: '', excl: false, idx: 0 });
  }

  function handlePage(direction) {
    if (!activeParams) return;
    const nextIndex = direction === 'next' ? startIndex + PAGE_SIZE : Math.max(0, startIndex - PAGE_SIZE);
    performSearch({ q: activeParams.q, sev: activeParams.sev, excl: activeParams.excl, idx: nextIndex });
  }

  const rangeStart = results && results.length > 0 ? startIndex + 1 : 0;
  const rangeEnd = results ? startIndex + results.length : 0;
  const canGoPrev = startIndex > 0;
  const canGoNext = startIndex + PAGE_SIZE < total;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">Perimeter</h1>
          <p className="mt-1 text-sm text-muted">Vulnerability lookup for defenders — search, verify exploitation, find the fix.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-low opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-low" />
          </span>
          Live · NVD + CISA KEV
        </div>
      </header>

      <SearchBar
        query={query}
        setQuery={setQuery}
        severity={severity}
        setSeverity={setSeverity}
        exploitedOnly={exploitedOnly}
        setExploitedOnly={setExploitedOnly}
        onSubmit={handleSubmit}
        loading={loading}
      />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_260px]">
        <section>
          {error && (
            <div className="mb-4 rounded-lg border border-critical/40 bg-critical/10 px-4 py-3 text-sm text-critical">
              {error}
            </div>
          )}

          {results === null && !loading && (
            <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center">
              <p className="text-sm text-faint">Search a CVE ID, vendor, or product to get started.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSuggestion(s)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs text-muted transition hover:border-exploited/50 hover:text-ink"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && <SkeletonRows />}

          {results && results.length === 0 && !loading && !error && (
            <div className="rounded-lg border border-border px-4 py-10 text-center text-sm text-faint">
              No results for &ldquo;{lastQuery}&rdquo;. Try a broader term or a different CVE ID.
            </div>
          )}

          {results && results.length > 0 && !loading && (
            <div className="animate-fade-in rounded-lg border border-border">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5 text-xs text-faint">
                <span>
                  Showing {rangeStart}–{rangeEnd} of {total.toLocaleString()} for &ldquo;{lastQuery}&rdquo;
                  {exploitedOnly && ' · exploited-only filter applies within this page'}
                </span>
              </div>
              {results.map((item) => (
                <ResultRow key={item.id} item={item} />
              ))}
              {total > PAGE_SIZE && (
                <div className="flex items-center justify-between border-t border-border px-4 py-3">
                  <button
                    type="button"
                    onClick={() => handlePage('prev')}
                    disabled={!canGoPrev}
                    className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs text-muted transition hover:border-faint hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowLeftIcon className="h-3.5 w-3.5" />
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePage('next')}
                    disabled={!canGoNext}
                    className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs text-muted transition hover:border-faint hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRightIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        <aside>
          <h2 className="mb-3 text-xs font-medium text-faint">Recently added to CISA KEV</h2>
          <KevList />
        </aside>
      </div>
    </main>
  );
}
