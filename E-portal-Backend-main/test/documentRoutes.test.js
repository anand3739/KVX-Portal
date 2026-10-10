const test = require('node:test');
const assert = require('node:assert/strict');

test('document routes load without uuid import errors', () => {
  delete require.cache[require.resolve('../src/routes/documentRoutes')];
  assert.doesNotThrow(() => require('../src/routes/documentRoutes'));
});
