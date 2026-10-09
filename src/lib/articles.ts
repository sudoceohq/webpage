import { getCollection } from 'astro:content';
import { isPublished } from './publication.mjs';
export async function publishedArticles() {
  return (await getCollection('articles', ({ data }) => isPublished(data)))
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}
export const formatDate = (date: Date) => date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
