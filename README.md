# Egor Markowskij / Sudoceo

A static personal website built with Astro, Tailwind CSS 4, and TypeScript. Home, Work, Writing, About, and Contact share a responsive editorial design, accessible navigation, and persistent dark mode. No CMS, analytics, contact database, or browser AI calls.

## Local development

Use Node 22.12 or newer.

```sh
npm ci
ASTRO_TELEMETRY_DISABLED=1 npm run dev
npm test
ASTRO_TELEMETRY_DISABLED=1 npm run build
npm run preview
```

Copy `.env.example` to `.env` if you want to override the public identity settings. Canonical URL defaults to `https://sudoceo.com`. Dependencies are locked in `package-lock.json`. No secrets belong in a `PUBLIC_` variable.

For browser checks: `npx playwright install chromium`, then `npm run test:e2e`. Tests cover routes, keyboard navigation, mobile overflow, theme persistence, WCAG checks, SEO metadata, RSS, and draft exclusion. CI repeats these checks on pushes and pull requests.

## Content and approval

Write `.md` or `.mdx` files in `content/articles/`. The included MDX introduction is an **unpublished editable example**, not a published article. Minimum frontmatter:

```yaml
title: "Your title"
description: "A short, accurate summary."
pubDate: 2026-10-09
status: draft
origin: manual
tags: [engineering]
```

Drafts have **no public route** and never appear in Writing, RSS, or the sitemap. To publish after Egor's approval, check every claim, code block, link, and (for MDX) executable component, then set `status: published` and add `reviewedBy: "Egor Markowskij"` and `reviewedAt: YYYY-MM-DD`. Both review and publication dates must be due. Future dates need a new build when due; no scheduler is installed. Missing approval metadata fails the build for published content.

The metadata records approval; it cannot authenticate a human. Configure GitHub branch protection/rulesets to require owner/CODEOWNERS review, and do not give automated writers merge permission. CODEOWNERS is included, but review enforcement must be enabled in the repository settings and may depend on your GitHub plan. The owner may publish their own manually reviewed changes.

## AI drafts from GitHub

A manual script and manually triggered GitHub workflow collect commits by one author from an explicitly selected **public** repository, then ask Cloudflare Workers AI for an article draft. Private sources are rejected. GitHub messages are treated as untrusted input. Source URLs are preserved. The generator always writes `status: draft`, never adds review approval, never commits, merges, or deploys, and refuses overwriting existing files.

Set `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` (Workers AI access) in your local environment. Optionally set `GITHUB_TOKEN` for rate limits. Node can load your ignored `.env`:

```sh
node --env-file=.env scripts/github-draft.mjs sudoceohq/argocd sudoceohq 2026-10-01
```

On GitHub, use **Actions → Draft from GitHub activity → Run workflow**. Add repository secrets `CLOUDFLARE_ACCOUNT_ID` and `WORKERS_AI_API_TOKEN` first. Download the `unpublished-drafts` artifact and inspect it locally. No schedule or automatic publication is configured. Running generation sends public commit messages to Cloudflare and may incur inference charges. Generation has only been tested with mocked API responses unless explicitly reported otherwise.

The source window is bounded to 500 commits and 45 KB; select a shorter period if exceeded. Commit messages describe intent, not proven deployment outcomes. Human review remains necessary for factual correctness, attribution, and safe content.

## Cloudflare Pages preparation

The site builds to static `dist/`; no server adapter or paid runtime is required.

1. In Cloudflare **Workers & Pages**, create a **Pages** project and connect `sudoceohq/webpage`.
2. Select the Astro preset. Build command: `npm run build`. Output directory: `dist`. Set `NODE_VERSION=22`, `ASTRO_TELEMETRY_DISABLED=1`, and `SITE_URL=https://sudoceo.com`.
3. Keep automatic production deployments disabled until you approve the website and content. If previews must remain private, configure Cloudflare Access before sharing them.
4. Deploy the reviewed commit, then add `sudoceo.com` as a custom domain and follow Cloudflare's DNS instructions. Verify canonical URLs, RSS, sitemap, 404 handling, and email links on the live domain.

Cloudflare Git integration can build production branches automatically; enabling it is an explicit publishing step. This repository does not include an automatic deployment workflow or change DNS. `_headers` supplies basic browser security headers; `404.astro` prevents a static Pages deployment from falling back to an SPA.

Official setup: [Astro on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/) and [build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/). AI integration: [Workers AI REST API](https://developers.cloudflare.com/workers-ai/get-started/rest-api/).

## Design and factual sources

The design follows the supplied written “Modern Executive” direction: oversized black type, off-white canvas, asymmetric grids, editorial numbering, and restrained red. No reference image was available to inspect. Work currently describes only the public `sudoceohq/argocd` repository, verified against its [README](https://github.com/sudoceohq/argocd). No employment history, achievements, or deployment claims are added.

Public contact: `egor.a.markowskij@sudoceo.com`. Adjust copy in `src/pages/` and identity settings in `src/lib/site.ts`.
