import test from 'node:test';
import assert from 'node:assert/strict';
import { CTA_ROUTES, getCtaTarget, handleCtaNavigation } from './navigationHelper.js';

test('TS-127: getCtaTarget resolves view-all-studies to /case-studies', () => {
  const cta = getCtaTarget('view-all-studies');
  assert.ok(cta);
  assert.equal(cta.target, '/case-studies');
});

test('TS-141: getCtaTarget resolves mobile-learn-more to /solutions/mobile-apps', () => {
  const cta = getCtaTarget('mobile-learn-more');
  assert.ok(cta);
  assert.equal(cta.target, '/solutions/mobile-apps');
});

test('TS-145 & TS-147: getCtaTarget resolves start-migration to cloud migration inquiry', () => {
  const cta1 = getCtaTarget('start-migration');
  const cta2 = getCtaTarget('start-migration-journey');
  assert.ok(cta1);
  assert.ok(cta2);
  assert.equal(cta1.target, '/contact?type=cloud-migration');
  assert.equal(cta2.target, '/contact?type=cloud-migration');
});

test('TS-190 & TS-201: getCtaTarget resolves email actions to valid mailto links', () => {
  assert.equal(getCtaTarget('email-support').target, 'mailto:support@kravixtech.com');
  assert.equal(getCtaTarget('email-press').target, 'mailto:press@kravixtech.com');
  assert.equal(getCtaTarget('email-legal').target, 'mailto:legal@kravixtech.com');
});

test('TS-241, TS-243 & TS-245: resolves Terms and Policy links and map location', () => {
  assert.equal(getCtaTarget('terms-important-notice').target, '/legal/terms#notices');
  assert.equal(getCtaTarget('terms-updates').target, '/legal/terms#updates');
  assert.equal(getCtaTarget('view-on-map').type, 'external');
});

test('handleCtaNavigation returns false for unknown keys', () => {
  assert.equal(handleCtaNavigation('non-existent-action'), false);
});
