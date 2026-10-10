import test from 'node:test';
import assert from 'node:assert/strict';
import {
  searchDocs,
  getDocRoutePath,
  getTutorialUrl,
  DOCS_CATALOG
} from './documentationHelper.js';

test('TS-205 & TS-206: searchDocs filters documentation by search terms', () => {
  const resultApi = searchDocs('api');
  assert.ok(resultApi.length > 0);
  assert.ok(resultApi.some(doc => doc.id === 'api-reference'));

  const resultQuick = searchDocs('quick start');
  assert.equal(resultQuick.length, 1);
  assert.equal(resultQuick[0].id, 'quick-start');

  const emptyResult = searchDocs('nonexistent keyword');
  assert.equal(emptyResult.length, 0);

  const blankQuery = searchDocs('');
  assert.equal(blankQuery.length, DOCS_CATALOG.length);
});

test('TS-207, TS-208, TS-209, TS-210, TS-211: resolves correct documentation routes', () => {
  assert.equal(getDocRoutePath('quick-start'), '/docs/quick-start');
  assert.equal(getDocRoutePath('api-reference'), '/docs/api-reference');
  assert.equal(getDocRoutePath('explore-overview'), '/docs/overview');
  assert.equal(getDocRoutePath('unknown-id'), '/docs/overview');
});

test('TS-212: getTutorialUrl returns valid video tutorial link', () => {
  const url = getTutorialUrl('quick-start');
  assert.ok(url.startsWith('https://'));
  assert.ok(url.includes('youtube'));
});
