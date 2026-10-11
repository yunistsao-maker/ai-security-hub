// Fetches the RSS and Atom feeds listed in src/data/sources.json, keeps AI security items,
// and merges them into src/data/news.json. Feed text is untrusted: only a plain-text title,
// an HTTPS link, a date and the source name are kept, and the schema in content.config.ts
// validates the result at build time.
import { readFileSync, writeFileSync } from 'node:fs';
import { XMLParser } from 'fast-xml-parser';

const SOURCES = 'src/data/sources.json';
const OUT = 'src/data/news.json';
const MAX_ITEMS = 400;
const MAX_AGE_DAYS = 180;
const NEW_ITEM_MAX_AGE_DAYS = 30;
const TIMEOUT_MS = 15000;
const MAX_BYTES = 5 * 1024 * 1024;

// Feeds that cover only AI security; everything else must match a keyword.
const AI_FOCUSED = new Set([
  'owasp-genai-security-project',
  'coalition-for-secure-ai',
  'model-context-protocol-blog',
  'simon-willison-prompt-injection-tag',
]);
// AI company and incident feeds: keep only items that are about security.
const SECURITY_REQUIRED = new Set(['openai-news', 'ai-incident-database']);
const SECURITY_WORDS = /secur|vulnerab|CVE-|exploit|attack|malware|breach|threat|jailbreak|injection|hack|phish|fraud|scam|disrupt|misuse|abuse|leak|exposed|資安|漏洞|攻擊|駭|外洩|詐騙/i;
const PER_SOURCE_LIMIT = 10;

const KEYWORDS_EN = /\b(AI|GenAI|LLMs?|ML|MCP)\b|large language model|generative|agentic|AI agent|prompt injection|jailbreak|model context protocol|machine learning|deepfake|copilot|chatgpt|claude|gemini|bedrock|hugging ?face|model poisoning|guardrail|frontier model/i;
const KEYWORDS_ZH = /\bAI\b|人工智慧|生成式|大型語言模型|\bLLM\b|AI 代理|代理式|深偽|提示注入/i;

const AREAS = [
  ['taiwan', /台灣|臺灣|taiwan|金管會|數位部|國科會|資安法|個資/i],
  ['red-team', /red[- ]team|紅隊|penetration|jailbreak|越獄/i],
  ['blue-team', /guardrail|defen[cs]e|detection|防護|偵測|patch|修補/i],
  ['frameworks', /OWASP|NIST|ISO\/IEC|ATLAS|framework|standard|框架|標準/i],
  ['responsible-ai', /responsible AI|safety framework|governance|治理|負責任/i],
  ['research', /arxiv|paper|research|研究/i],
  ['threats', /vulnerab|CVE-|exploit|attack|malware|breach|漏洞|攻擊|外洩/i],
];

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  processEntities: true,
  htmlEntities: true,
  textNodeName: '#text',
});

const asArray = (v) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
const text = (v) => (typeof v === 'object' && v !== null ? v['#text'] ?? '' : v ?? '');

function cleanTitle(raw) {
  return String(raw)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);
}

function httpsUrl(raw) {
  try {
    const u = new URL(String(raw).trim());
    return u.protocol === 'https:' ? u.toString() : null;
  } catch {
    return null;
  }
}

function isoDate(raw) {
  const d = new Date(String(raw ?? ''));
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

function atomLink(entry) {
  const links = asArray(entry.link);
  const alt = links.find((l) => !l['@_rel'] || l['@_rel'] === 'alternate') ?? links[0];
  return alt?.['@_href'] ?? text(alt);
}

function parseFeed(xml) {
  const doc = parser.parse(xml);
  if (doc.rss?.channel) {
    return asArray(doc.rss.channel.item).map((i) => ({
      title: text(i.title),
      url: text(i.link) || text(i.guid),
      date: i.pubDate ?? i['dc:date'],
    }));
  }
  if (doc['rdf:RDF']) {
    return asArray(doc['rdf:RDF'].item).map((i) => ({ title: text(i.title), url: text(i.link), date: i['dc:date'] }));
  }
  if (doc.feed) {
    return asArray(doc.feed.entry).map((e) => ({ title: text(e.title), url: atomLink(e), date: e.published ?? e.updated }));
  }
  return [];
}

async function fetchText(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { 'user-agent': 'icsd-epcd-security-news/1.0 (+https://icsd.epcd.security)' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  if (buf.byteLength > MAX_BYTES) throw new Error('feed too large');
  return new TextDecoder('utf-8').decode(buf);
}

function areaFor(title) {
  return AREAS.find(([, re]) => re.test(title))?.[0] ?? 'news';
}

const today = new Date();
const daysAgo = (iso) => (today - new Date(iso)) / 86400000;

const sources = JSON.parse(readFileSync(SOURCES, 'utf8')).filter((s) => s.kind === 'rss' || s.kind === 'atom');
const existing = JSON.parse(readFileSync(OUT, 'utf8'));
const byUrl = new Map(existing.map((n) => [n.url, n]));
let added = 0;
const failures = [];

for (const s of sources) {
  try {
    const items = parseFeed(await fetchText(s.feedUrl));
    let kept = 0;
    for (const raw of items) {
      const title = cleanTitle(raw.title);
      const url = httpsUrl(raw.url);
      const published = isoDate(raw.date);
      if (title.length < 3 || !url || !published) continue;
      if (daysAgo(published) > NEW_ITEM_MAX_AGE_DAYS || daysAgo(published) < -1) continue;
      const keywords = s.language === 'zh-TW' ? KEYWORDS_ZH : KEYWORDS_EN;
      if (!AI_FOCUSED.has(s.id) && !keywords.test(title)) continue;
      if (SECURITY_REQUIRED.has(s.id) && !SECURITY_WORDS.test(title)) continue;
      // English feeds sometimes carry titles in other scripts; keep the stream readable.
      if (s.language === 'en' && (title.match(/[A-Za-z]/g)?.length ?? 0) < title.length * 0.5) continue;
      if (kept >= PER_SOURCE_LIMIT) break;
      if (byUrl.has(url)) continue;
      byUrl.set(url, { id: url, title, url, source: s.name.slice(0, 120), published, area: areaFor(title), language: s.language });
      added++;
      kept++;
    }
    console.log(`${s.name}: ${items.length} items, ${kept} new`);
  } catch (err) {
    failures.push(s.name);
    console.warn(`${s.name}: failed (${err.message})`);
  }
}

const merged = [...byUrl.values()]
  .filter((n) => daysAgo(n.published) <= MAX_AGE_DAYS)
  .sort((a, b) => b.published.localeCompare(a.published) || a.title.localeCompare(b.title))
  .slice(0, MAX_ITEMS);
writeFileSync(OUT, JSON.stringify(merged, null, 2) + '\n');
console.log(`\n${added} new items; ${merged.length} in ${OUT}; ${failures.length} feeds failed.`);
if (failures.length === sources.length) process.exit(1);
