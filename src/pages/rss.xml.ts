import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { publishedArticles } from '../lib/articles';
import { site } from '../lib/site';
export async function GET(context: APIContext) {
  return rss({
    title: `${site.name} — Writing`,
    description: site.description,
    site: context.site!,
    items: (await publishedArticles()).map(article => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: article.data.pubDate,
      link: `/writing/${article.id}/`,
    })),
    customData: '<language>en</language>',
  });
}
