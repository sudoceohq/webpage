import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const build = () => execFileSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], { env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' }, stdio: 'pipe' });
test('Markdown and MDX publish after review; unapproved articles fail the build', () => {
  const files = ['content/articles/__test-approved.md', 'content/articles/__test-mdx.mdx'];
  const frontmatter = '---\ntitle: Synthetic publication fixture\ndescription: Test content only.\npubDate: 2020-01-01\nstatus: published\nreviewedBy: Test reviewer\nreviewedAt: 2020-01-01\n---\n\n## Test heading\n\nFixture body.\n';
  try {
    files.forEach(file => writeFileSync(file, frontmatter, { flag: 'wx' }));
    build();
    for (const slug of ['__test-approved', '__test-mdx']) assert.ok(existsSync(`dist/writing/${slug}/index.html`));
    assert.match(readFileSync('dist/rss.xml', 'utf8'), /Synthetic publication fixture/);
    assert.ok(!existsSync('dist/writing/welcome/index.html'));
    writeFileSync(files[0], frontmatter.replace('reviewedBy: Test reviewer\nreviewedAt: 2020-01-01\n', ''));
    assert.throws(build, error => /human approval/.test(String(error.stdout) + String(error.stderr)));
  } finally {
    files.forEach(file => rmSync(file, { force: true }));
    build();
  }
});
