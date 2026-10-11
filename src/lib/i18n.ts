export type Lang = 'en' | 'zh';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Format an ISO date (YYYY-MM-DD) without time-zone shifts. */
export function fmtDate(iso: string, lang: Lang): string {
  const [y, m, d] = iso.split('-').map(Number);
  return lang === 'zh' ? `${y} 年 ${m} 月 ${d} 日` : `${d} ${MONTHS.at(m - 1)} ${y}`;
}

export function fmtRange(start: string, end: string, lang: Lang): string {
  if (start === end) return fmtDate(start, lang);
  const [y1, m1] = start.split('-').map(Number);
  const [y2, m2, d2] = end.split('-').map(Number);
  const d1 = Number(start.slice(8));
  if (lang === 'zh') {
    if (y1 === y2 && m1 === m2) return `${y1} 年 ${m1} 月 ${d1} 至 ${d2} 日`;
    if (y1 === y2) return `${y1} 年 ${m1} 月 ${d1} 日至 ${m2} 月 ${d2} 日`;
    return `${fmtDate(start, lang)}至${fmtDate(end, lang)}`;
  }
  if (y1 === y2 && m1 === m2) return `${d1}–${d2} ${MONTHS.at(m1 - 1)} ${y1}`;
  if (y1 === y2) return `${d1} ${MONTHS.at(m1 - 1)} – ${d2} ${MONTHS.at(m2 - 1)} ${y1}`;
  return `${fmtDate(start, lang)} – ${fmtDate(end, lang)}`;
}

export function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const LABELS = {
  en: {
    source: 'Source', sources: 'Sources', lastChecked: 'Last checked', date: 'Date', event: 'Event',
    place: 'Place', dates: 'Dates', item: 'Item', status: 'Where it stands', jurisdiction: 'Jurisdiction',
    instrument: 'Instrument', threat: 'Threat', evidence: 'What the evidence says', topic: 'Topic',
    tool: 'Tool', maintainer: 'Maintainer', tests: 'What it tests', release: 'Latest release', licence: 'Licence',
    cluster: 'Cluster', areas: 'Areas', problem: 'Problem', feed: 'Feed', adds: 'What it adds', language: 'Language',
    secondary: 'secondary source', term: 'Term', definition: 'Definition', noNews: 'No news items yet. The news job adds them when it runs.',
    englishOnly: '', kind: 'Type',
  },
  zh: {
    source: '來源', sources: '參考來源', lastChecked: '最後查核', date: '日期', event: '事件',
    place: '地點', dates: '日期', item: '項目', status: '現況', jurisdiction: '轄區',
    instrument: '法規或文件', threat: '威脅', evidence: '證據顯示', topic: '主題',
    tool: '工具', maintainer: '維護者', tests: '測試內容', release: '最新版本', licence: '授權',
    cluster: '類別', areas: '研究領域', problem: '問題', feed: '來源', adds: '內容', language: '語言',
    secondary: '次級來源', term: '詞彙', definition: '定義', noNews: '目前尚無新聞。新聞工作執行後會自動加入。',
    englishOnly: '此表條目內容目前為英文，中文版將陸續補上。', kind: '類型',
  },
} as const;

export function t(lang: Lang) {
  return LABELS[lang];
}

export const KIND_LABELS: Record<string, { en: string; zh: string }> = {
  incident: { en: 'Incident', zh: '事件' },
  vulnerability: { en: 'Vulnerability', zh: '漏洞' },
  misuse: { en: 'Misuse', zh: '濫用' },
  'supply-chain': { en: 'Supply chain', zh: '供應鏈' },
  evaluation: { en: 'Evaluation', zh: '評測' },
  report: { en: 'Report', zh: '報告' },
  standard: { en: 'Standard', zh: '標準' },
  policy: { en: 'Policy', zh: '政策' },
};
