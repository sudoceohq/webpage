import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateDraft, renderDraft, validateOptions } from '../scripts/github-draft.mjs';
const env = { CLOUDFLARE_ACCOUNT_ID: 'a'.repeat(32), CLOUDFLARE_API_TOKEN: 'fake', GITHUB_TOKEN: 'fake-github' };
const now = new Date('2026-10-09T12:00:00Z');
const draft = { title: 'Changes to GitOps', description: 'A draft based on commits.', body: 'A configuration change. [Source](https://github.com/sudoceohq/argocd/commit/abc)' };
const commits = [{ html_url: 'https://github.com/sudoceohq/argocd/commit/abc', commit: { message: 'Update config', author: { date: '2026-10-08' } } }];
const options = { repo: 'sudoceohq/argocd', author: 'sudoceohq', since: '2026-10-01', env, now };
test('fetches public author activity, calls AI, and forces an unapproved draft', async () => {
  const calls = [];
  const request = async (url, init) => {
    calls.push({ url, init });
    const data = url.includes('/ai/run/') ? { success: true, result: { response: JSON.stringify({ ...draft, status: 'published', reviewedBy: 'Robot' }) } } : url.includes('/commits?') ? commits : { private: false };
    return Response.json(data);
  };
  const result = await generateDraft({ ...options, request });
  assert.match(calls[1].url, /author=sudoceohq/);
  assert.match(result.text, /status: draft/);
  assert.doesNotMatch(result.text, /reviewedBy|reviewedAt|status: published/);
  assert.match(result.text, /origin: github-ai/);
  assert.match(result.text, /sourceUrls:/);
  assert.equal(calls[2].init.headers.Authorization, 'Bearer fake');
  assert.ok(!calls[2].init.body.includes('fake-github'));
});
test('refuses private sources before any AI call', async () => {
  let calls = 0;
  await assert.rejects(generateDraft({ ...options, request: async () => { calls++; return Response.json({ private: true }); } }), /public repositories/);
  assert.equal(calls, 1);
});
test('handles missing credentials, upstream failures, and empty activity', async () => {
  await assert.rejects(generateDraft({ ...options, env: {} }), /Set CLOUDFLARE/);
  await assert.rejects(generateDraft({ ...options, request: async () => new Response('', { status: 403 }) }), /403/);
  await assert.rejects(generateDraft({ ...options, request: async url => Response.json(url.includes('/commits?') ? [] : { private: false }) }), /No commits/);
});
test('rejects invalid inputs and unsafe generated text', () => {
  for (const args of [['../argocd', 'sudoceohq', '2026-10-01'], ['sudoceohq/argocd', '../author', '2026-10-01'], ['sudoceohq/argocd', 'sudoceohq', '2026-02-30']]) assert.throws(() => validateOptions(...args));
  for (const body of ['<script>alert(1)</script>', '[click](javascript:alert(1))', '']) assert.throws(() => renderDraft({ ...draft, body }, [commits[0].html_url], now));
  const text = renderDraft({ ...draft, title: 'title\nstatus: published' }, [commits[0].html_url], now);
  assert.match(text, /title: "title\\nstatus: published"/);
});
