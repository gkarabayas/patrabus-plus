import {
  normalizeCardId,
  parseCardBalance,
  validCardId,
} from '@/lib/card-balance';

const headers = { 'Cache-Control': 'private, no-store' };
const reply = (data: unknown, status = 200) =>
  Response.json(data, { status, headers });

export async function POST(request: Request) {
  let cardId: string;
  try {
    const body: unknown = await request.json();
    if (
      typeof body !== 'object' ||
      body === null ||
      !('cardId' in body) ||
      typeof body.cardId !== 'string'
    ) {
      return reply({ error: 'Συμπλήρωσε τον κωδικό της κάρτας σου.' }, 400);
    }
    cardId = normalizeCardId(body.cardId);
    if (!validCardId(cardId))
      return reply({ error: 'Ο κωδικός πρέπει να έχει CB και 15 ψηφία.' }, 400);
  } catch {
    return reply({ error: 'Μη έγκυρος κωδικός κάρτας.' }, 400);
  }

  try {
    const response = await fetch(
      `https://patra.buscard.gr/card/RemainingDays/${cardId}`,
      {
        cache: 'no-store',
        signal: AbortSignal.timeout(12000),
        headers: { Accept: 'application/json' },
      },
    );
    if (response.status === 404)
      return reply({ error: 'Η κάρτα δεν βρέθηκε. Έλεγξε τον κωδικό.' }, 404);
    if (!response.ok) throw new Error('Card service unavailable');
    const balance = parseCardBalance(await response.json());
    if (!balance.products.length)
      return reply(
        {
          error: 'Δεν βρέθηκαν προϊόντα για αυτή την κάρτα. Έλεγξε τον κωδικό.',
        },
        404,
      );
    return reply(balance);
  } catch {
    return reply(
      {
        error: 'Το υπόλοιπο δεν είναι διαθέσιμο αυτή τη στιγμή. Δοκίμασε ξανά.',
      },
      502,
    );
  }
}
