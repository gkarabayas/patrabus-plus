import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeCardId,
  parseCardBalance,
  validCardId,
} from './card-balance.ts';

test('combines rides from all products, including products awaiting activation', () => {
  const balance = parseCardBalance({
    product0: {
      productId: '10 ΔΙΑΔΡΟΜΕΣ',
      remaining: '1 διαδρομή',
      remainingValue: 1,
    },
    product1: null,
    product2: {
      productId: '2 ΔΙΑΔΡΟΜΕΣ',
      remaining: '2 Διαδρομές',
      remainingValue: 2,
      activationTimestamp: 'Η Κάρτα δεν έχει ενεργοποιηθεί',
    },
  });
  assert.equal(balance.rides, 3);
  assert.equal(balance.products.length, 2);
});

test('keeps zero rides and never adds days to the ride balance', () => {
  const balance = parseCardBalance({
    Ticket: { productId: 'Ticket', journeys: 0 },
    product0: {
      productId: 'Monthly pass',
      remaining: '12 ημέρες',
      remainingValue: 12,
    },
  });
  assert.equal(balance.rides, 0);
  assert.equal(balance.products[1].remaining, '12 ημέρες');
  assert.equal(balance.products[1].rides, null);
  assert.equal(
    parseCardBalance({
      product0: { productId: 'Pass', remaining: '7 ημέρες', remainingValue: 7 },
    }).rides,
    null,
  );
});

test('does not report malformed or missing provider data as zero rides', () => {
  assert.throws(() => parseCardBalance('unavailable'));
  assert.throws(() => parseCardBalance({ product0: { productId: 'Unknown' } }));
  assert.equal(parseCardBalance({ product0: null }).products.length, 0);
});

test('normalizes printed card IDs while rejecting malformed paths', () => {
  assert.equal(normalizeCardId(' cb12345 6789012345 '), 'CB123456789012345');
  assert.ok(validCardId(normalizeCardId(' cb12345 6789012345 ')));
  assert.equal(validCardId('CB1234/../../'), false);
  assert.equal(validCardId('CB12345678901234'), false);
});
