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

## Deployment

Live site: **https://sudoceo.com**. Cloudflare Pages project: `sudoceo`; fallback URL: https://sudoceo.pages.dev.

On 10 October 2026 (Europe/Warsaw), reviewed commit `bbf2a73` was deployed as production deployment `09600449-ec73-4da1-a4e3-820e62262a37`. The apex domain is active with a proxied CNAME to `sudoceo.pages.dev`. Existing email records were preserved.

Cloudflare's Git installation returned error `8000011`, so this release used Direct Upload of the locally tested `dist/` assets through the Cloudflare API. The project has no Git source integration and does not automatically deploy on push. GitHub remains the source of truth.

For a subsequent approved release, authenticate the official Wrangler CLI, then:

```sh
ASTRO_TELEMETRY_DISABLED=1 npm run build
npm test
npm run test:e2e
npx wrangler pages deploy dist --project-name sudoceo --branch main
```

Review the changes and article approvals before deploying. The site is static; no server adapter or paid runtime is needed. `SITE_URL` defaults to `https://sudoceo.com`. Upload only `dist/`, never the repository or ignored research/preview folders. `_headers` supplies browser security headers; the custom 404 prevents an SPA fallback.

Official guidance: [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/).

## Verification

The reviewed build passed with no TypeScript diagnostics. Six content/generator tests passed, and desktop/mobile browser checks passed during page implementation and refinement. Live checks passed for all five pages, RSS, sitemap, robots, and 404 responses. The welcome draft is absent from public routes and the feed. The live domain was visually inspected in the browser.

GitHub check run [37998921517](https://github.com/sudoceohq/webpage/actions/runs/37998921517) passed. The earlier initial run was blocked by billing, but that is no longer the observed result for this release. Workers AI credentials and repository review enforcement remain to be configured; no live AI generation was run.

## Design and factual sources

The design follows the supplied written “Modern Executive” direction: oversized black type, off-white canvas, asymmetric grids, editorial numbering, and restrained red. No reference image was available to inspect. Professional history, education, course certificates, languages, and OCR contribution descriptions were verified against the supplied LinkedIn profile. Project summaries were corroborated in LibraCircu, ThriftyStack, and the two OCR repositories. Private source repositories are not linked, and configuration does not imply a verified production deployment. The public Management GitOps entry links to `sudoceohq/argocd`.

Public contact: `egor.a.markowskij@sudoceo.com`. Adjust copy in `src/pages/` and identity settings in `src/lib/site.ts`.
