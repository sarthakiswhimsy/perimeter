# Perimeter

**A vulnerability lookup tool for blue teamers.** Search a CVE ID, product, or keyword and get the description, CVSS breakdown, whether it's being actively exploited in the wild, and links to the patch or vendor advisory — all pulled live from official sources.

**Live demo:** [CLICK HERE](https://perimeter-two.vercel.app/)

## What it does

- **Search** any CVE ID, vendor name, or product keyword
- **Filter** by severity (Critical / High / Medium / Low) or narrow to only actively exploited vulnerabilities
- **Cross-references CISA's Known Exploited Vulnerabilities (KEV) catalog** — flags anything confirmed to be under active attack, with the required remediation action and due date
- **Full CVE detail pages** — description, CVSS vector breakdown, CWE weakness type, and direct links to vendor patches and advisories
- **Live sidebar** of the most recently added actively-exploited CVEs, so you can see what's newly dangerous without searching for it

Data is pulled live on every search from two official, authoritative sources — there's no database to maintain and nothing to keep in sync:

- **[NVD](https://nvd.nist.gov/)** (National Vulnerability Database) — CVE details, descriptions, CVSS scores, references
- **[CISA KEV](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)** (Known Exploited Vulnerabilities catalog) — confirms active exploitation and remediation deadlines

## Tech stack

- [Next.js 14](https://nextjs.org/) (App Router)
- React
- Tailwind CSS
- No database — live API calls to NVD and CISA, cached in memory

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Optional: add an NVD API key

Without a key, NVD limits requests to 5 per 30 seconds — fine for casual use, but easy to hit if you're testing rapidly. A free key raises that to 50 requests per 30 seconds.

1. Request a key at https://nvd.nist.gov/developers/request-an-api-key
2. Copy `.env.example` to `.env.local`
3. Set `NVD_API_KEY=your_key_here`

## Deploying to Vercel

1. Push this repo to GitHub
2. Import it at https://vercel.com/new — Vercel auto-detects Next.js, no config needed
3. (Optional) Add `NVD_API_KEY` under Project Settings → Environment Variables
4. Deploy

No database, no additional services, and no build configuration required.

## Project structure

```
app/
  page.js                 → home page: search bar, results, KEV sidebar
  cve/[id]/page.js         → CVE detail page (description, CVSS, remediation)
  api/search/route.js      → proxies + normalizes NVD keyword search
  api/cve/[id]/route.js    → proxies + normalizes a single CVE lookup
  api/kev-recent/route.js  → recently-added CISA KEV entries
components/                → SearchBar, ResultRow, SeverityBadge, ExploitedBadge, KevList, CopyButton, icons
lib/nvd.js                 → all NVD/KEV fetching, caching, and normalization logic
```

## Known limitations

This version queries NVD and CISA live rather than maintaining its own database. That keeps setup at zero, but means:
- No persistent search history or a full "browse everything" view
- No aggregated security-news layer (Krebs, BleepingComputer, etc.) cross-referenced by CVE
- Subject to NVD's rate limits under heavy, rapid use
- The "exploited only" filter applies within each page of 20 results, so a broad search can occasionally show fewer than 20 rows even when more matches exist further in

## Roadmap

- Add Postgres (Vercel Postgres or Supabase) and cache NVD/KEV results on a cron schedule instead of querying live each time
- Add a news-mentions table and an ingestion script that pulls security RSS feeds, extracts CVE IDs, and links matched articles
- Scheduled refresh via Vercel Cron instead of relying on in-memory caching
