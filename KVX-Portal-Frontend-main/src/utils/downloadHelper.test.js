import test from 'node:test';
import assert from 'node:assert/strict';
import { downloadPDFDocument, downloadPartnerKit } from './downloadHelper.js';

test('TS-128: downloadPDFDocument executes safely and returns expected filename', () => {
  const result = downloadPDFDocument('custom-cloud-case-study.pdf');
  assert.equal(result.success, true);
  assert.equal(result.filename, 'custom-cloud-case-study.pdf');
});

test('TS-196: downloadPartnerKit executes safely and returns Partner Kit filename', () => {
  const result = downloadPartnerKit();
  assert.equal(result.success, true);
  assert.equal(result.filename, 'KravixTech-Partner-Kit.pdf');
});
