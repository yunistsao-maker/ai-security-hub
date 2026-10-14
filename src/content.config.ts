import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// Every entry carries at least one HTTPS source and the date it was last checked.
const source = z.object({
  title: z.string().min(1),
  url: z.string().url().startsWith('https://'),
});
const sources = z.array(source).min(1);
const lastChecked = z.coerce.date();
const tier = z.enum(['primary', 'secondary']);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
// Year, year-month or full date: papers and reports are often dated by month only.
const partialDate = z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/);
// OWASP identifiers are written with their year (LLM01:2026) or as Agentic IDs (ASI01).
const owaspIds = z.array(z.string().regex(/^(LLM\d{2}:2026|ASI\d{2})$/));
const data = (name: string) => `src/data/${name}.json`;

const topicRow = z.object({
  topic: z.string(),
  status: z.string(),
  sources,
  lastChecked,
});

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        lastChecked,
        sources,
      }),
    }),
  }),
  frameworks: defineCollection({
    loader: file(data('frameworks')),
    schema: z.object({ name: z.string(), status: z.string(), sourceTier: tier, sources, lastChecked }),
  }),
  instruments: defineCollection({
    loader: file(data('instruments')),
    schema: z.object({
      jurisdiction: z.string(),
      name: z.string(),
      nameZh: z.string().optional(),
      status: z.string(),
      statusZh: z.string().optional(),
      sourceTier: tier,
      sources,
      lastChecked,
    }),
  }),
  incidents: defineCollection({
    loader: file(data('incidents')),
    schema: z.object({
      date: isoDate,
      dateText: z.string(),
      title: z.string().max(300),
      titleZh: z.string().max(300),
      kind: z.enum(['incident', 'vulnerability', 'misuse', 'supply-chain', 'evaluation', 'report', 'standard', 'policy']),
      sourceTier: tier,
      sources,
      lastChecked,
    }),
  }),
  events: defineCollection({
    loader: file(data('events')),
    schema: z.object({
      name: z.string(),
      nameZh: z.string(),
      start: isoDate,
      end: isoDate,
      place: z.string(),
      placeZh: z.string(),
      sources,
      lastChecked,
    }),
  }),
  threats: defineCollection({
    loader: file(data('threats')),
    schema: z.object({ name: z.string(), evidence: z.string(), sources, lastChecked }),
  }),
  tools: defineCollection({
    loader: file(data('tools')),
    schema: z.object({
      name: z.string(),
      repo: z.string().url(),
      maintainer: z.string(),
      tests: z.string(),
      release: z.string(),
      licence: z.string(),
      side: z.enum(['red', 'blue', 'both']),
      sources,
      lastChecked,
    }),
  }),
  researchAreas: defineCollection({
    loader: file(data('researchAreas')),
    schema: z.object({ cluster: z.string(), areas: z.string(), sources, lastChecked }),
  }),
  openProblems: defineCollection({
    loader: file(data('openProblems')),
    schema: z.object({ problem: z.string(), evidence: z.string(), sources, lastChecked }),
  }),
  papers: defineCollection({
    loader: file(data('papers')),
    schema: z.object({
      title: z.string().min(3).max(300),
      authors: z.string(),
      venue: z.string(),
      date: partialDate,
      topic: z.enum(['injection', 'agents', 'supply-chain', 'data', 'output', 'evaluation', 'language']),
      summary: z.string().min(1),
      summaryZh: z.string().min(1),
      finding: z.string(),
      findingZh: z.string(),
      owasp: owaspIds,
      sourceTier: tier,
      sources,
      lastChecked,
    }),
  }),
  community: defineCollection({
    loader: file(data('community')),
    schema: z.object({
      title: z.string().min(3).max(300),
      author: z.string(),
      org: z.string(),
      date: partialDate,
      format: z.enum(['blog', 'article', 'talk', 'guidance', 'advisory', 'newsletter', 'video', 'repo']),
      language: z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/),
      summary: z.string().min(1),
      summaryZh: z.string().min(1),
      owasp: owaspIds,
      sourceTier: tier,
      sources,
      lastChecked,
    }),
  }),
  useCases: defineCollection({
    loader: file(data('useCases')),
    schema: z.object({
      date: partialDate,
      title: z.string().min(3).max(300),
      titleZh: z.string().min(1).max(300),
      organisation: z.string(),
      industry: z.enum(['finance', 'manufacturing', 'retail', 'healthcare', 'government', 'legal', 'software', 'customer-service', 'transport', 'hr', 'cross-industry']),
      architecture: z.enum(['chatbot', 'rag', 'agent', 'coding-agent', 'browser-agent', 'infrastructure', 'other']),
      summary: z.string().min(1),
      summaryZh: z.string().min(1),
      impact: z.string(),
      impactZh: z.string(),
      owasp: owaspIds,
      sourceTier: tier,
      sources,
      lastChecked,
    }),
  }),
  redTeam: defineCollection({ loader: file(data('redTeam')), schema: topicRow }),
  blueTeam: defineCollection({ loader: file(data('blueTeam')), schema: topicRow }),
  responsibleAi: defineCollection({ loader: file(data('responsibleAi')), schema: topicRow }),
  sources: defineCollection({
    loader: file(data('sources')),
    schema: z.object({
      name: z.string(),
      adds: z.string(),
      feedUrl: z.string().url().startsWith('https://'),
      kind: z.enum(['rss', 'atom', 'yaml', 'json']),
      language: z.enum(['en', 'zh-TW']),
      sources,
      lastChecked,
    }),
  }),
  // Written by the news job. Plain text only, HTTPS links, length limits.
  news: defineCollection({
    loader: file(data('news')),
    schema: z.object({
      title: z.string().min(3).max(300),
      url: z.string().url().startsWith('https://'),
      source: z.string().max(120),
      published: isoDate,
      area: z.string().max(40),
      language: z.enum(['en', 'zh-TW']),
    }),
  }),
  glossary: defineCollection({
    loader: file(data('glossary')),
    schema: z.object({
      term: z.string(),
      termZh: z.string(),
      definition: z.string(),
      definitionZh: z.string(),
      seeAlso: z.array(z.string()),
    }),
  }),
};
