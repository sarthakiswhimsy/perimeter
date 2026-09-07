import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCveById, getKevCatalog, findKevEntry } from '../../../lib/nvd';
import SeverityBadge from '../../../components/SeverityBadge';
import ExploitedBadge from '../../../components/ExploitedBadge';
import CopyButton from '../../../components/CopyButton';
import { ArrowLeftIcon, ExternalLinkIcon } from '../../../components/icons';

export const dynamic = 'force-dynamic';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function tagReferences(refs) {
  const patches = refs.filter((r) => r.tags?.some((t) => ['Patch', 'Vendor Advisory'].includes(t)));
  const others = refs.filter((r) => !patches.includes(r));
  return { patches, others };
}

function Metric({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-faint">{label}</dt>
      <dd className="mt-0.5 text-ink">{value}</dd>
    </div>
  );
}

export default async function CveDetailPage({ params }) {
  const id = params.id?.toUpperCase();
  if (!id || !/^CVE-\d{4}-\d{4,}$/.test(id)) notFound();

  let cve;
  let kevList = [];
  try {
    [cve, kevList] = await Promise.all([
      getCveById(id),
      getKevCatalog().catch(() => []),
    ]);
  } catch (err) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-sm text-critical">Couldn&rsquo;t reach NVD right now. Try again in a moment.</p>
        <Link href="/" className="mt-4 inline-block text-sm text-muted underline">Back to search</Link>
      </main>
    );
  }

  if (!cve) notFound();

  const kevEntry = findKevEntry(cve.id, kevList);
  const { patches, others } = tagReferences(cve.references);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" />
        Back to search
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-2xl font-semibold text-ink">{cve.id}</h1>
        <SeverityBadge severity={cve.cvss?.baseSeverity} score={cve.cvss?.baseScore} />
        {kevEntry && <ExploitedBadge />}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <CopyButton text={cve.id} />
        <a
          href={`https://nvd.nist.gov/vuln/detail/${cve.id}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded border border-border px-2.5 py-1 text-xs text-muted transition hover:border-faint hover:text-ink"
        >
          <ExternalLinkIcon className="h-3.5 w-3.5" />
          Open in NVD
        </a>
      </div>

      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-faint">
        <div><dt className="inline">Published </dt><dd className="inline text-muted">{formatDate(cve.published)}</dd></div>
        <div><dt className="inline">Updated </dt><dd className="inline text-muted">{formatDate(cve.lastModified)}</dd></div>
        <div><dt className="inline">Status </dt><dd className="inline text-muted">{cve.vulnStatus}</dd></div>
      </dl>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-ink">Description</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{cve.description}</p>
      </section>

      {kevEntry && (
        <section className="mt-8 rounded border border-exploited/40 bg-exploited/10 p-4">
          <h2 className="text-sm font-medium text-exploited">Confirmed exploitation — CISA KEV</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink/90">{kevEntry.shortDescription}</p>
          <dl className="mt-3 grid grid-cols-1 gap-2 text-xs text-muted sm:grid-cols-2">
            <div><dt className="inline text-faint">Required action: </dt><dd className="inline">{kevEntry.requiredAction}</dd></div>
            <div><dt className="inline text-faint">Due date: </dt><dd className="inline">{formatDate(kevEntry.dueDate)}</dd></div>
            <div><dt className="inline text-faint">Ransomware use: </dt><dd className="inline">{kevEntry.knownRansomwareCampaignUse}</dd></div>
            <div><dt className="inline text-faint">Added to KEV: </dt><dd className="inline">{formatDate(kevEntry.dateAdded)}</dd></div>
          </dl>
        </section>
      )}

      {cve.cvss && (
        <section className="mt-8">
          <h2 className="text-sm font-medium text-ink">CVSS {cve.cvss.version} breakdown</h2>
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 rounded border border-border p-4 text-xs sm:grid-cols-3">
            <Metric label="Attack vector" value={cve.cvss.attackVector} />
            <Metric label="Attack complexity" value={cve.cvss.attackComplexity} />
            <Metric label="Privileges required" value={cve.cvss.privilegesRequired} />
            <Metric label="User interaction" value={cve.cvss.userInteraction} />
            <Metric label="Confidentiality impact" value={cve.cvss.confidentialityImpact} />
            <Metric label="Integrity impact" value={cve.cvss.integrityImpact} />
            <Metric label="Availability impact" value={cve.cvss.availabilityImpact} />
            <Metric label="Exploitability score" value={cve.cvss.exploitabilityScore} />
            <Metric label="Impact score" value={cve.cvss.impactScore} />
          </div>
          <p className="mt-2 break-all font-mono text-xs text-faint">{cve.cvss.vectorString}</p>
        </section>
      )}

      {cve.cwe?.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-medium text-ink">Weakness type</h2>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {cve.cwe.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </section>
      )}

      {patches.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-medium text-ink">Patches &amp; vendor advisories</h2>
          <ul className="mt-2 space-y-2">
            {patches.map((r, i) => (
              <li key={i}>
                <a href={r.url} target="_blank" rel="noreferrer" className="break-all text-sm text-low underline hover:text-ink">
                  {r.url}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {others.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-medium text-ink">Further reading</h2>
          <ul className="mt-2 space-y-2">
            {others.slice(0, 10).map((r, i) => (
              <li key={i}>
                <a href={r.url} target="_blank" rel="noreferrer" className="break-all text-sm text-muted underline hover:text-ink">
                  {r.url}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
