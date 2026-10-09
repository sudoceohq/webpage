import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const site = process.env.SITE_URL || 'https://sudoceo.com';
export default defineConfig({
  site,
  output: 'static',
  devToolbar: { enabled: false },
  integrations: [mdx(), ...(site ? [sitemap()] : [])],
  vite: { plugins: [tailwindcss()] },
});
