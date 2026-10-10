import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validatePhone,
  validateResumeUrl,
  validateFullName,
  validateEmail
} from './validationUtils.js';

test('TS-259 & TS-260: validatePhone rejects letters and alphanumeric inputs', () => {
  const lettersTest = validatePhone('98765abcde');
  assert.equal(lettersTest.isValid, false);
  assert.ok(lettersTest.error.includes('letters or alphanumeric'));

  const alphaNumTest = validatePhone('987654321a');
  assert.equal(alphaNumTest.isValid, false);
});

test('TS-261: validatePhone rejects invalid special characters', () => {
  const specialCharTest = validatePhone('98765@#$$!');
  assert.equal(specialCharTest.isValid, false);
  assert.ok(specialCharTest.error.includes('invalid special characters'));
});

test('validatePhone accepts valid international and standard phone formats', () => {
  assert.equal(validatePhone('+1 234 567 8900').isValid, true);
  assert.equal(validatePhone('9876543210').isValid, true);
  assert.equal(validatePhone('+91-9876543210').isValid, true);
  assert.equal(validatePhone('(123) 456-7890').isValid, true);
});

test('TS-268: validateResumeUrl rejects URLs containing spaces', () => {
  const spaceTest = validateResumeUrl('https://example.com/my resume.pdf');
  assert.equal(spaceTest.isValid, false);
  assert.ok(spaceTest.error.includes('spaces'));

  const validTest = validateResumeUrl('https://example.com/my-resume.pdf');
  assert.equal(validTest.isValid, true);
});

test('TS-318: validateFullName rejects purely numeric input', () => {
  const numTest = validateFullName('12345678');
  assert.equal(numTest.isValid, false);
  assert.ok(numTest.error.includes('numeric-only'));

  const validName = validateFullName('John Doe');
  assert.equal(validName.isValid, true);
});

test('TS-322: validateEmail rejects emails without Top-Level Domain', () => {
  const noTldTest = validateEmail('user@domain');
  assert.equal(noTldTest.isValid, false);
  assert.ok(noTldTest.error.includes('valid domain'));

  const validEmail = validateEmail('user@domain.com');
  assert.equal(validEmail.isValid, true);
});
