const NVD_BASE = 'https://services.nvd.nist.gov/rest/json/cves/2.0';
const KEV_URL = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';

function nvdHeaders() {
  const headers = {};
  if (process.env.NVD_API_KEY) {
    headers['apiKey'] = process.env.NVD_API_KEY;
  }
  return headers;
}

function scoreToSeverity(score) {
  if (score === undefined || score === null) return 'UNKNOWN';
  if (score >= 9.0) return 'CRITICAL';
  if (score >= 7.0) return 'HIGH';
  if (score >= 4.0) return 'MEDIUM';
  if (score > 0) return 'LOW';
  return 'NONE';
}

function normalizeCve(item) {
  const cve = item.cve;
  const descriptions = cve.descriptions || [];
  const enDesc = descriptions.find((d) => d.lang === 'en');
  const description = enDesc ? enDesc.value : (descriptions[0]?.value || 'No description available.');

  const metrics = cve.metrics || {};
  let cvss = null;
  const metricGroups = ['cvssMetricV31', 'cvssMetricV30', 'cvssMetricV2'];
  for (const group of metricGroups) {
    if (metrics[group] && metrics[group].length > 0) {
      const m = metrics[group][0];
      cvss = {
        version: group === 'cvssMetricV2' ? '2.0' : group === 'cvssMetricV30' ? '3.0' : '3.1',
        baseScore: m.cvssData.baseScore,
        baseSeverity: m.cvssData.baseSeverity || scoreToSeverity(m.cvssData.baseScore),
        vectorString: m.cvssData.vectorString,
        attackVector: m.cvssData.attackVector,
        attackComplexity: m.cvssData.attackComplexity,
        privilegesRequired: m.cvssData.privilegesRequired,
        userInteraction: m.cvssData.userInteraction,
        confidentialityImpact: m.cvssData.confidentialityImpact,
        integrityImpact: m.cvssData.integrityImpact,
        availabilityImpact: m.cvssData.availabilityImpact,
        exploitabilityScore: m.exploitabilityScore,
        impactScore: m.impactScore,
      };
      break;
    }
  }

  const weaknesses = (cve.weaknesses || [])
    .map((w) => w.description?.find((d) => d.lang === 'en')?.value)
    .filter(Boolean);

  const references = (cve.references || []).map((r) => ({
    url: r.url,
    source: r.source,
    tags: r.tags || [],
  }));

  return {
    id: cve.id,
    sourceIdentifier: cve.sourceIdentifier,
    published: cve.published,
    lastModified: cve.lastModified,
    vulnStatus: cve.vulnStatus,
    description,
    cvss,
    cwe: weaknesses,
    references,
  };
}

export async function searchCves({ keyword, severity, startIndex = 0, resultsPerPage = 20 }) {
  const params = new URLSearchParams();
  params.set('keywordSearch', keyword);
  params.set('resultsPerPage', String(resultsPerPage));
  params.set('startIndex', String(startIndex));
  if (severity) params.set('cvssV3Severity', severity.toUpperCase());

  const res = await fetch(`${NVD_BASE}?${params.toString()}`, {
    headers: nvdHeaders(),
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`NVD request failed (${res.status}). It may be rate-limited — try again in a moment.`);
  }

  const data = await res.json();
  return {
    totalResults: data.totalResults || 0,
    vulnerabilities: (data.vulnerabilities || []).map(normalizeCve),
  };
}

export async function getCveById(id) {
  const params = new URLSearchParams({ cveId: id });
  const res = await fetch(`${NVD_BASE}?${params.toString()}`, {
    headers: nvdHeaders(),
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`NVD request failed (${res.status}).`);
  }

  const data = await res.json();
  if (!data.vulnerabilities || data.vulnerabilities.length === 0) return null;
  return normalizeCve(data.vulnerabilities[0]);
}

let kevCache = { data: null, fetchedAt: 0 };
const KEV_CACHE_TTL = 1000 * 60 * 60; // 1 hour, in-memory per serverless instance

export async function getKevCatalog() {
  const now = Date.now();
  if (kevCache.data && now - kevCache.fetchedAt < KEV_CACHE_TTL) {
    return kevCache.data;
  }

  const res = await fetch(KEV_URL, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`CISA KEV request failed (${res.status}).`);
  }
  const data = await res.json();
  const list = data.vulnerabilities || [];
  kevCache = { data: list, fetchedAt: now };
  return list;
}

export function findKevEntry(cveId, kevList) {
  return kevList.find((k) => k.cveID === cveId) || null;
}
