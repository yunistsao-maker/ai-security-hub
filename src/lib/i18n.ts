export type Lang = 'en' | 'zh';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Format an ISO date (YYYY-MM-DD) without time-zone shifts. */
export function fmtDate(iso: string, lang: Lang): string {
  const [y, m, d] = iso.split('-').map(Number);
  return lang === 'zh' ? `${y} 年 ${m} 月 ${d} 日` : `${d} ${MONTHS.at(m - 1)} ${y}`;
}

/** Format a year, year-month or full ISO date at the precision it was given. */
export function fmtPartial(iso: string, lang: Lang): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (d) return fmtDate(iso, lang);
  if (m) return lang === 'zh' ? `${y} 年 ${m} 月` : `${MONTHS.at(m - 1)} ${y}`;
  return lang === 'zh' ? `${y} 年` : `${y}`;
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
    paper: 'Paper', finding: 'What it shows', keyResult: 'Key result', owasp: 'OWASP 2026',
    write: 'Write-up', summary: 'Summary', useCase: 'Case', where: 'Sector and system', whatHappened: 'What happened',
    impact: 'Impact', titleOriginal: '',
    tests: 'Matrix items', matrixItem: 'Item', appliesTo: 'Applies to', architecture: 'Architecture', testedBy: 'Tested by',
    owaspOther: 'Other lists', atlas: 'MITRE ATLAS', moda: 'MODA risk category', whatToTest: 'What to test',
    passCriteria: 'Pass criteria', toolsMethod: 'Tools and method', notes2026: 'Notes', whyNeeded: 'Why it is needed',
    priority: 'Priority', related: 'Related reading', papersN: 'papers', writeupsN: 'write-ups', casesN: 'cases',
    papersH: 'Papers', writeupsH: 'Community write-ups and talks', casesH: 'Use cases', none: 'None yet',
  },
  zh: {
    source: '來源', sources: '參考來源', lastChecked: '最後查核', date: '日期', event: '事件',
    place: '地點', dates: '日期', item: '項目', status: '現況', jurisdiction: '轄區',
    instrument: '法規或文件', threat: '威脅', evidence: '證據顯示', topic: '主題',
    tool: '工具', maintainer: '維護者', tests: '測試內容', release: '最新版本', licence: '授權',
    cluster: '類別', areas: '研究領域', problem: '問題', feed: '來源', adds: '內容', language: '語言',
    secondary: '次級來源', term: '詞彙', definition: '定義', noNews: '目前尚無新聞。新聞工作執行後會自動加入。',
    englishOnly: '此表條目內容目前為英文，中文版將陸續補上。', kind: '類型',
    paper: '論文', finding: '內容', keyResult: '主要結果', owasp: 'OWASP 2026',
    write: '文章或演講', summary: '摘要', useCase: '案例', where: '產業與系統', whatHappened: '發生了什麼',
    impact: '影響', titleOriginal: '標題保留原文。',
    tests: '對應矩陣項目', matrixItem: '項目', appliesTo: '適用使用者', architecture: '適用架構', testedBy: '測試單位',
    owaspOther: '其他清單', atlas: 'MITRE ATLAS', moda: '數發部風險類別', whatToTest: '測什麼',
    passCriteria: '通過標準', toolsMethod: '工具與測試方式', notes2026: '補充說明', whyNeeded: '為什麼需要',
    priority: '優先序', related: '相關資料', papersN: '篇論文', writeupsN: '則社群文章', casesN: '件案例',
    papersH: '論文', writeupsH: '社群文章與演講', casesH: '使用案例', none: '尚無',
  },
} as const;

export function t(lang: Lang) {
  return LABELS[lang];
}

/** Link to an item of the evaluation matrix in the reader's language. */
export function matrixHref(sec: string, lang: Lang): string {
  return `${lang === 'zh' ? '/zh-tw' : ''}/red-team/evaluation-matrix/#${sec.toLowerCase()}`;
}

export const INDUSTRY_LABELS: Record<string, { en: string; zh: string }> = {
  finance: { en: 'Finance', zh: '金融' },
  manufacturing: { en: 'Manufacturing', zh: '製造' },
  retail: { en: 'Retail and e-commerce', zh: '零售與電商' },
  healthcare: { en: 'Healthcare', zh: '醫療' },
  government: { en: 'Government', zh: '政府與公部門' },
  legal: { en: 'Legal', zh: '法律' },
  software: { en: 'Software development', zh: '軟體開發' },
  'customer-service': { en: 'Customer service', zh: '客服' },
  transport: { en: 'Transport and logistics', zh: '交通與物流' },
  hr: { en: 'Human resources', zh: '人資' },
  'cross-industry': { en: 'Cross-industry', zh: '跨產業' },
};

export const ARCH_LABELS: Record<string, { en: string; zh: string }> = {
  chatbot: { en: 'Chatbot', zh: '聊天機器人' },
  rag: { en: 'RAG', zh: 'RAG' },
  agent: { en: 'Agent', zh: '代理' },
  'coding-agent': { en: 'Coding agent', zh: '程式開發代理' },
  'browser-agent': { en: 'Browser agent', zh: '瀏覽器代理' },
  infrastructure: { en: 'AI infrastructure', zh: 'AI 基礎設施' },
  other: { en: 'Other (fraud, deepfake, policy)', zh: '其他（詐騙、深偽、政策）' },
};

export const FORMAT_LABELS: Record<string, { en: string; zh: string }> = {
  blog: { en: 'Blog', zh: '部落格' },
  article: { en: 'Article', zh: '文章' },
  talk: { en: 'Talk', zh: '演講' },
  guidance: { en: 'Guidance', zh: '指引' },
  advisory: { en: 'Advisory', zh: '公告' },
  newsletter: { en: 'Newsletter', zh: '電子報' },
  video: { en: 'Video', zh: '影片' },
  repo: { en: 'Repository', zh: '程式庫' },
};

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
