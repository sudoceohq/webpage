import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './content/articles' }),
  schema: z.object({
    title: z.string().min(1).max(160),
    description: z.string().min(1).max(300),
    pubDate: z.coerce.date(),
    status: z.enum(['draft', 'published']).default('draft'),
    origin: z.enum(['manual', 'github-ai']).default('manual'),
    reviewedBy: z.string().trim().min(1).optional(),
    reviewedAt: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    sourceUrls: z.array(z.url().refine(url => /^https:\/\/github\.com\//.test(url), 'Sources must be GitHub HTTPS URLs')).default([]),
  }).superRefine((data, ctx) => {
    if (data.status === 'published' && (!data.reviewedBy || !data.reviewedAt)) {
      ctx.addIssue({ code: 'custom', message: 'Published articles require reviewedBy and reviewedAt after human approval.' });
    }
    if (data.origin === 'github-ai' && !data.sourceUrls.length) {
      ctx.addIssue({ code: 'custom', message: 'GitHub AI drafts must retain their source URLs.' });
    }
  }),
});
export const collections = { articles };
