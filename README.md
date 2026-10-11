# AI Security Hub (icsd.epcd.security)

A bilingual (English and Traditional Chinese) reference site on AI security, published by EPCD.
Static Astro + Starlight site hosted on AWS Amplify Hosting.

Launch scope: general AI security, a Taiwan regulation section, and a news section (16 pages in each language).

## Run locally

Requires Node 22.12 or later.

```bash
npm ci
npm run dev        # http://localhost:4321
npm run build      # builds to dist/ and validates every content entry
npm run csp        # checks customHttp.yml allows exactly the inline scripts in dist/
npm run news       # fetches feeds and merges headlines into src/data/news.json
```

## Where things live

| Path | What it holds |
|---|---|
| `src/content/docs/` | English pages (MDX). Traditional Chinese pages mirror them under `src/content/docs/zh-tw/` |
| `src/data/*.json` | Structured entries: frameworks, instruments, incidents, events, feeds, news, glossary and more |
| `src/content.config.ts` | Schemas. Every page and entry needs `sources` (HTTPS) and `lastChecked`, or the build fails |
| `src/components/` | Tables that render the data collections in either language |
| `scripts/` | News job, CSP hash checker, freshness check |
| `amplify.yml` | Amplify build settings (Node 22, `npm ci`, `npm run build`, artifacts from `dist`) |
| `customHttp.yml` | Security headers, including the Content-Security-Policy |

## Deploy to Amplify (personal account test)

1. Push this repository to GitHub.
2. In the Amplify console, choose **Create new app → GitHub**, select the repository and the `main` branch.
3. Amplify detects `amplify.yml`. Keep the default build image; the build uses Node 22.
4. Deploy. The site is served at `https://main.<app-id>.amplifyapp.com` (free; no custom domain needed for testing).
5. Set an AWS Budgets alert, for example US$10 a month.

Firewall (AWS WAF) is off while testing; decide before public launch.

## Updating news

During testing the news job runs only when started by hand: GitHub → **Actions** → **News update** → **Run workflow**.
It commits `src/data/news.json`, which triggers an Amplify build. To run it daily, uncomment the `schedule` in
`.github/workflows/news.yml`. If `main` is protected, allow `github-actions[bot]` to push, or change the job to open a pull request.

## Content-Security-Policy

The policy is an HTTP header in `customHttp.yml`. Inline scripts are allowed only by SHA-256 hash; Pagefind needs
`'wasm-unsafe-eval'`. Inline styles are allowed because Starlight sets CSS variables in `style` attributes.
After upgrading Astro or Starlight, run `npm run build && npm run csp -- --write` and commit the updated header.
CI and the Amplify build both fail if the hash list is out of date.

Tested on 11 October 2026: 34 pages in Chromium with the production headers, zero CSP violations, search working in both languages.

## Editorial rules

See `/start/sourcing/` on the site. In short: a primary source and a check date on everything; secondary sources
marked; attacks described conceptually, never as working payloads; pages in our own words (see `/about/licences/`).

## Licences

Code: Apache-2.0 (`LICENSE`). Text: CC BY 4.0 (`LICENSE-CONTENT.md`). Both subject to the organisation's open-source review.
