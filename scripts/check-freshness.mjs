// Warns about entries whose lastChecked date is more than 90 days old.
// Exits 0 so a stale entry never blocks a deploy; the warnings show in the CI log.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const LIMIT_DAYS = 90;
const now = Date.now();
const stale = [];

for (const f of readdirSync('src/data').filter((f) => f.endsWith('.json'))) {
  for (const e of JSON.parse(readFileSync(join('src/data', f), 'utf8'))) {
    if (e.lastChecked && (now - Date.parse(e.lastChecked)) / 86400000 > LIMIT_DAYS) stale.push(`${f}: ${e.id}`);
  }
}
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((x) => (x.isDirectory() ? walk(join(d, x.name)) : [join(d, x.name)]));
for (const p of walk('src/content/docs').filter((p) => /\.mdx?$/.test(p))) {
  const m = readFileSync(p, 'utf8').match(/^lastChecked:\s*(\S+)/m);
  if (m && (now - Date.parse(m[1])) / 86400000 > LIMIT_DAYS) stale.push(p);
}
if (stale.length) {
  for (const s of stale) console.log(`::warning::Stale (over ${LIMIT_DAYS} days): ${s}`);
} else {
  console.log(`All entries checked within ${LIMIT_DAYS} days.`);
}
