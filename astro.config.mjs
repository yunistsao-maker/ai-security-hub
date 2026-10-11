// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://icsd.epcd.security',
  trailingSlash: 'always',
  build: {
    // No inline <style> blocks, so the Content-Security-Policy can stay strict.
    inlineStylesheets: 'never',
  },
  // The Content-Security-Policy is sent as an HTTP header from customHttp.yml.
  // Astro's built-in security.csp is not used: in testing it did not hash some of
  // Starlight's inline scripts, which the browser then blocked.
  integrations: [
    starlight({
      title: {
        en: 'AI Security Hub',
        'zh-TW': 'AI 安全知識中心',
      },
      description:
        'A sourced reference to AI security: threats, frameworks, compliance, red and blue teaming, responsible AI, research and news. Published by EPCD.',
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        'zh-tw': { label: '繁體中文', lang: 'zh-TW' },
      },
      lastUpdated: false,
      credits: false,
      customCss: ['./src/styles/site.css'],
      components: {
        Footer: './src/components/Footer.astro',
      },
      sidebar: [
        { label: 'Start here', translations: { 'zh-TW': '從這裡開始' }, items: [{ autogenerate: { directory: 'start' } }] },
        {
          label: 'AI security',
          translations: { 'zh-TW': 'AI 安全' },
          items: [
            { slug: 'threats' },
            { slug: 'frameworks' },
            { slug: 'red-team' },
            { slug: 'blue-team' },
            { slug: 'responsible-ai' },
            { slug: 'research' },
          ],
        },
        { label: 'Taiwan regulation', translations: { 'zh-TW': '台灣法規' }, items: [{ autogenerate: { directory: 'taiwan' } }] },
        { label: 'News and incidents', translations: { 'zh-TW': '新聞與事件' }, items: [{ autogenerate: { directory: 'news' } }] },
        { label: 'About', translations: { 'zh-TW': '關於本站' }, items: [{ autogenerate: { directory: 'about' } }] },
      ],
    }),
  ],
});
