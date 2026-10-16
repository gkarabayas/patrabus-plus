export type CardProduct = {
  key: string;
  name: string;
  remaining: string;
  rides: number | null;
};

export type CardBalance = {
  products: CardProduct[];
  rides: number | null;
  fetchedAt: number;
};

export const normalizeCardId = (value: string) =>
  value.replace(/\s/g, '').toUpperCase();
export const validCardId = (value: string) => /^CB\d{15}$/.test(value);

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// Keep the provider's units: a time pass must never be counted as rides.
export function parseCardBalance(raw: unknown): CardBalance {
  if (!record(raw)) throw new Error('Invalid card response');
  const products: CardProduct[] = [];
  for (const key of ['Ticket', 'product0', 'product1', 'product2']) {
    const product = raw[key];
    if (!record(product)) continue;
    if (typeof product.productId !== 'string')
      throw new Error('Invalid card product');
    const value = key === 'Ticket' ? product.journeys : product.remaining;
    if (typeof value !== 'string' && typeof value !== 'number')
      throw new Error('Invalid balance');
    const remaining = String(value);
    const rideProduct =
      key === 'Ticket' || /διαδρομ|journey|ride/i.test(remaining);
    const count = key === 'Ticket' ? product.journeys : product.remainingValue;
    const numeric =
      typeof count === 'number' ||
      (typeof count === 'string' && /^\d+$/.test(count))
        ? Number(count)
        : Number.NaN;
    const rides =
      rideProduct && Number.isSafeInteger(numeric) && numeric >= 0
        ? numeric
        : null;
    products.push({
      key,
      name: product.productId,
      remaining,
      rides,
    });
  }
  const counted = products.filter((product) => product.rides !== null);
  return {
    products,
    rides: counted.length
      ? counted.reduce((sum, product) => sum + product.rides!, 0)
      : null,
    fetchedAt: Date.now(),
  };
}
