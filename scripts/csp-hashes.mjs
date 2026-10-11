// Collects the SHA-256 hashes of every inline <script> in dist/ and checks that the
// Content-Security-Policy header in customHttp.yml allows exactly those.
// Usage: npm run csp            (check; exits 1 when out of date)
//        npm run csp -- --write (rewrite the hash list in customHttp.yml)
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const CONFIG = 'customHttp.yml';
const MARK_START = "'self' 'wasm-unsafe-eval'";

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? htmlFiles(p) : p.endsWith('.html') ? [p] : [];
  });
}

const hashes = new Set();
const scriptRe = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
for (const file of htmlFiles(DIST)) {
  const html = readFileSync(file, 'utf8');
  for (const m of html.matchAll(scriptRe)) {
    if (/type="application\/(ld\+)?json"/.test(m[0])) continue;
    hashes.add(`'sha256-${createHash('sha256').update(m[1], 'utf8').digest('base64')}'`);
  }
}
const wanted = [...hashes].sort();

const yml = readFileSync(CONFIG, 'utf8');
const re = /script-src 'self' 'wasm-unsafe-eval'([^;]*);/;
const m = yml.match(re);
if (!m) {
  console.error(`No "script-src ${MARK_START} ...;" found in ${CONFIG}`);
  process.exit(1);
}
const current = m[1].trim().split(/\s+/).filter(Boolean).sort();
const same = current.length === wanted.length && current.every((h, i) => h === wanted[i]);

if (process.argv.includes('--write')) {
  writeFileSync(CONFIG, yml.replace(re, `script-src ${MARK_START} ${wanted.join(' ')};`));
  console.log(`Wrote ${wanted.length} script hashes to ${CONFIG}.`);
} else if (!same) {
  const missing = wanted.filter((h) => !current.includes(h));
  const extra = current.filter((h) => !wanted.includes(h));
  console.error(`CSP header out of date: ${missing.length} missing, ${extra.length} unused. Run: npm run csp -- --write`);
  process.exit(1);
} else {
  console.log(`CSP header allows exactly the ${wanted.length} inline scripts in ${DIST}/.`);
}
