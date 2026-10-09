import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isPublished } from '../src/lib/publication.mjs';
const now = new Date('2026-10-09T12:00:00Z');
const approved = { status: 'published', reviewedBy: 'Egor Markowskij', reviewedAt: new Date('2026-10-09'), pubDate: new Date('2026-10-09') };
test('only approved, due articles are public', () => {
  assert.equal(isPublished(approved, now), true);
  for (const change of [
    { status: 'draft' }, { status: undefined }, { reviewedBy: undefined }, { reviewedBy: ' ' },
    { reviewedAt: undefined }, { reviewedAt: 'invalid' }, { reviewedAt: new Date('2026-10-10') },
    { pubDate: new Date('2026-10-10') }, { pubDate: 'invalid' },
  ]) assert.equal(isPublished({ ...approved, ...change }, now), false);
});
