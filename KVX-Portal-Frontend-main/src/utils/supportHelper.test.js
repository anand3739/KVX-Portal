import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getHelpCategoryPath,
  getArticlePath,
  triggerLiveChat,
  submitSupportTicket
} from './supportHelper.js';

test('TS-222: getHelpCategoryPath resolves category paths', () => {
  assert.equal(getHelpCategoryPath('getting-started'), '/help/category/getting-started');
  assert.equal(getHelpCategoryPath('troubleshooting'), '/help/category/troubleshooting');
  assert.equal(getHelpCategoryPath('unknown'), '/help');
});

test('TS-223: getArticlePath resolves popular article paths', () => {
  assert.equal(getArticlePath('art-1'), '/help/article/art-1');
  assert.equal(getArticlePath('art-2'), '/help/article/art-2');
  assert.equal(getArticlePath('unknown'), '/help');
});

test('TS-227 & TS-229: triggerLiveChat returns true without runtime error', () => {
  const result = triggerLiveChat();
  assert.equal(result, true);
});

test('TS-228: submitSupportTicket validates inputs and returns ticket payload', () => {
  const invalidTicket = submitSupportTicket({ subject: '', description: '' });
  assert.equal(invalidTicket.success, false);
  assert.ok(invalidTicket.error.includes('subject is required'));

  const validTicket = submitSupportTicket({
    subject: 'Cannot clock out on mobile',
    category: 'Attendance',
    description: 'Encountering an error when clicking clock out.'
  });

  assert.equal(validTicket.success, true);
  assert.ok(validTicket.ticketId.startsWith('TICK-'));
  assert.equal(validTicket.data.subject, 'Cannot clock out on mobile');
  assert.equal(validTicket.data.status, 'Open');
});
