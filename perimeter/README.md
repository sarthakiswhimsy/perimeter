# Perimeter

A vulnerability lookup tool for blue teamers. Search a CVE ID, product, or keyword and get the description, CVSS breakdown, whether it's being actively exploited (CISA KEV), and links to the patch or vendor advisory.

Data is pulled live from two official sources — no database or scraping setup required to get started:
- **NVD (National Vulnerability Database)** — CVE details, descriptions, CVSS scores, references
- **CISA KEV (Known Exploited Vulnerabilities catalog)** — flags CVEs that are confirmed to be actively exploited, plus required remediation actions and due dates

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Optional: add an NVD API key

Without a key, NVD limits you to 5 requests per 30 seconds, which is fine for personal use but can get rate-limited under repeated testing. A free key raises that to 50 requests/30s.

1. Get a key at https://nvd.nist.gov/developers/request-an-api-key
2. Copy `.env.example` to `.env.local`
3. Paste your key in as `NVD_API_KEY=...`

## Deploy to Vercel

**Option A — Vercel dashboard (no CLI needed)**
1. Push this folder to a GitHub repo (or upload it — see below)
2. Go to https://vercel.com/new and import the repo
3. Vercel auto-detects Next.js — no build settings to change
4. If you have an NVD API key, add it under Project Settings → Environment Variables as `NVD_API_KEY`
5. Deploy

**Option B — Vercel CLI**
```bash
npm install -g vercel
vercel
```
Follow the prompts. Run `vercel --prod` once you're happy with the preview.

**If you don't have a GitHub repo yet:**
```bash
git init
git add .
git commit -m "Initial commit"
```
Then create an empty repo on GitHub and follow its "push an existing repo" instructions, or just run `vercel` from this folder directly — it can deploy without GitHub at all.

## Project structure

```
app/
  page.js                 → home page: search bar, results list, KEV sidebar
  cve/[id]/page.js         → CVE detail page (description, CVSS, remediation)
  api/search/route.js      → proxies + normalizes NVD keyword search
  api/cve/[id]/route.js    → proxies + normalizes a single CVE lookup
  api/kev-recent/route.js  → recently-added CISA KEV entries
components/                → SearchBar, ResultRow, SeverityBadge, ExploitedBadge, KevList
lib/nvd.js                 → all NVD/KEV fetching, caching, and normalization logic
```

## Known limitations / roadmap

This version queries NVD and CISA KEV live on every search rather than maintaining its own database — that keeps setup to zero, but means:
- No history of past searches or a "browse everything" view
- No aggregated security-news layer (Krebs, BleepingComputer, etc.) cross-referenced by CVE
- Subject to NVD's rate limits under heavy use

Natural next steps if you want to extend it:
1. Add Postgres (Vercel Postgres or Supabase both work well) and cache NVD/KEV results into your own `vulnerabilities` and `remediations` tables on a cron schedule, instead of querying live each time
2. Add a `news_mentions` table and an ingestion script that pulls security news RSS feeds, extracts CVE IDs via regex (`CVE-\d{4}-\d{4,}`), and links matched articles
3. Add a scheduled job (Vercel Cron or GitHub Actions) to refresh the KEV catalog and NVD cache hourly/daily instead of relying on in-memory caching
