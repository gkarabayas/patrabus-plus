'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  ClipboardPaste,
  CreditCard,
  Pencil,
  RefreshCw,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  normalizeCardId,
  validCardId,
  type CardBalance,
} from '@/lib/card-balance';

const storageKey = 'patra-card-id';
const rideLabel = (rides: number) => (rides === 1 ? 'διαδρομή' : 'διαδρομές');

export function SavedCard() {
  const [open, setOpen] = useState(false);
  const [cardId, setCardId] = useState('');
  const [input, setInput] = useState('');
  const [editing, setEditing] = useState(false);
  const [balance, setBalance] = useState<CardBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [storageError, setStorageError] = useState('');
  const [pasteMessage, setPasteMessage] = useState('');
  const request = useRef<AbortController | null>(null);
  const screen = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLDivElement>(null);
  const cardInput = useRef<HTMLInputElement>(null);

  function revealField() {
    const scroller = body.current;
    const row = field.current;
    if (!scroller || !row || document.activeElement !== cardInput.current)
      return;
    const visible = scroller.getBoundingClientRect();
    const bounds = row.getBoundingClientRect();
    if (bounds.bottom > visible.bottom - 20) {
      scroller.scrollTop += bounds.bottom - visible.bottom + 20;
    } else if (bounds.top < visible.top + 20) {
      scroller.scrollTop -= visible.top + 20 - bounds.top;
    }
  }

  useEffect(() => {
    if (!open) return;
    const viewport = window.visualViewport;
    let frame = 0;
    const syncViewport = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // Safari pans the visual viewport as well as shrinking it for the keyboard.
        screen.current?.style.setProperty(
          '--card-viewport-top',
          `${viewport?.offsetTop ?? 0}px`,
        );
        screen.current?.style.setProperty(
          '--card-viewport-height',
          `${viewport?.height ?? window.innerHeight}px`,
        );
        revealField();
      });
    };
    syncViewport();
    viewport?.addEventListener('resize', syncViewport);
    viewport?.addEventListener('scroll', syncViewport);
    window.addEventListener('resize', syncViewport);
    return () => {
      cancelAnimationFrame(frame);
      viewport?.removeEventListener('resize', syncViewport);
      viewport?.removeEventListener('scroll', syncViewport);
      window.removeEventListener('resize', syncViewport);
    };
  }, [open]);

  async function pasteCardId() {
    // Invoke clipboard access directly from the tap for Safari's user activation.
    try {
      const text = await navigator.clipboard.readText();
      const id = normalizeCardId(text);
      if (!validCardId(id)) {
        setPasteMessage(
          'Αντέγραψε τον κωδικό CB με τα 15 ψηφία και πάτησε ξανά επικόλληση.',
        );
        return;
      }
      setInput(id);
      setError('');
      setPasteMessage('Ο κωδικός επικολλήθηκε.');
    } catch {
      setPasteMessage(
        'Πάτησε παρατεταμένα στο πεδίο και επίλεξε «Επικόλληση».',
      );
    } finally {
      cardInput.current?.focus({ preventScroll: true });
      requestAnimationFrame(revealField);
    }
  }

  async function load(id: string, save = false) {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: id }),
        signal: controller.signal,
        cache: 'no-store',
      });
      const data = (await response.json()) as CardBalance & { error?: string };
      if (!response.ok)
        throw new Error(data.error || 'Το υπόλοιπο δεν είναι διαθέσιμο.');
      if (controller.signal.aborted) return;
      setBalance(data);
      if (save) {
        setCardId(id);
        setInput(id);
        setEditing(false);
        try {
          localStorage.setItem(storageKey, id);
          setStorageError('');
        } catch {
          setStorageError(
            'Η κάρτα εμφανίζεται, αλλά δεν αποθηκεύτηκε σε αυτή τη συσκευή.',
          );
        }
      }
    } catch (reason) {
      if (!controller.signal.aborted)
        setError(
          reason instanceof Error
            ? reason.message
            : 'Δεν φορτώθηκε το υπόλοιπο.',
        );
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const saved = normalizeCardId(localStorage.getItem(storageKey) || '');
        if (validCardId(saved)) {
          setCardId(saved);
          setInput(saved);
        }
      } catch {
        /* The card can still be checked when storage is unavailable. */
      }
    });
    return () => {
      active = false;
      request.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!cardId || editing) return;
    const refresh = () => {
      if (!document.hidden) void load(cardId);
    };
    refresh();
    const timer = setInterval(refresh, 60000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [cardId, editing]);

  function remove() {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      setStorageError('Δεν αφαιρέθηκε η αποθηκευμένη κάρτα. Δοκίμασε ξανά.');
      return;
    }
    request.current?.abort();
    setCardId('');
    setInput('');
    setBalance(null);
    setEditing(false);
    setLoading(false);
    setError('');
    setStorageError('');
  }

  const stale = !!balance && !!error;
  return (
    <>
      <button
        className={'card-open' + (cardId ? ' has-card' : '')}
        onClick={() => setOpen(true)}
        aria-label={
          cardId && balance?.rides !== null && balance?.rides !== undefined
            ? `Η κάρτα μου: ${balance.rides} ${rideLabel(balance.rides)}${stale ? ', τελευταίο γνωστό υπόλοιπο' : ''}`
            : 'Η κάρτα μου'
        }
        title={
          stale
            ? 'Τελευταίο γνωστό υπόλοιπο · πάτησε για ανανέωση'
            : 'Η κάρτα μου'
        }
      >
        <CreditCard size={18} />
        <span aria-live="polite">
          {cardId && balance?.rides !== null && balance?.rides !== undefined ? (
            <>
              <strong>{balance.rides}</strong> {rideLabel(balance.rides)}
            </>
          ) : cardId && loading ? (
            'Έλεγχος…'
          ) : (
            'Η κάρτα μου'
          )}
        </span>
        {stale && <span className="card-stale-dot" aria-hidden="true" />}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          ref={screen}
          fullscreen
          className="stops-screen card-screen"
          overlayClassName="card-screen-backdrop supports-backdrop-filter:backdrop-blur-none"
          showCloseButton={false}
          initialFocus={false}
        >
          <div className="stops-screen-header">
            <DialogClose className="picker-back" aria-label="Κλείσιμο κάρτας">
              <X size={22} />
            </DialogClose>
            <DialogTitle>Η κάρτα μου</DialogTitle>
            <CreditCard size={22} className="card-header-icon" />
          </div>
          <div ref={body} className="card-screen-body">
            <DialogDescription className="card-description">
              Το υπόλοιπό σου, πριν την επόμενη διαδρομή.
            </DialogDescription>
            {!cardId || editing ? (
              <form
                className="card-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  const id = normalizeCardId(input);
                  if (!validCardId(id)) {
                    setError('Ο κωδικός πρέπει να έχει CB και 15 ψηφία.');
                    return;
                  }
                  void load(id, true);
                }}
              >
                <div className="card-empty-icon">
                  <CreditCard size={32} />
                </div>
                <h2>{editing ? 'Αλλαγή κάρτας' : 'Πρόσθεσε την κάρτα σου'}</h2>
                <p>
                  Αποθήκευσε τον κωδικό μία φορά και δες τις διαδρομές που
                  απομένουν.
                </p>
                <label htmlFor="bus-card-id">Κωδικός κάρτας</label>
                <div ref={field} className="card-input-row">
                  <input
                    ref={cardInput}
                    id="bus-card-id"
                    value={input}
                    onChange={(event) => {
                      setInput(event.target.value);
                      setPasteMessage('');
                    }}
                    onFocus={() => requestAnimationFrame(revealField)}
                    placeholder="CB + 15 ψηφία"
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    enterKeyHint="done"
                    maxLength={24}
                    aria-describedby="card-input-hint card-paste-message"
                  />
                  <button
                    className="card-paste"
                    type="button"
                    onClick={() => void pasteCardId()}
                    aria-label="Επικόλληση κωδικού κάρτας"
                    title="Επικόλληση"
                  >
                    <ClipboardPaste size={20} />
                  </button>
                </div>
                <small id="card-input-hint">
                  Ο κωδικός CB που αναγράφεται στην κάρτα σου.
                </small>
                <output
                  id="card-paste-message"
                  htmlFor="bus-card-id"
                  className="card-paste-message"
                >
                  {pasteMessage}
                </output>
                <button
                  className="card-primary"
                  disabled={loading}
                  type="submit"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={17} className="spinning" />
                      Έλεγχος υπολοίπου…
                    </>
                  ) : (
                    'Αποθήκευση κάρτας'
                  )}
                </button>
                {editing && (
                  <button
                    className="card-cancel"
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setInput(cardId);
                      setError('');
                    }}
                  >
                    Ακύρωση
                  </button>
                )}
              </form>
            ) : (
              <>
                <section
                  className={'balance-card' + (stale ? ' balance-stale' : '')}
                  aria-label="Υπόλοιπο κάρτας"
                  aria-busy={loading}
                >
                  <div className="balance-card-top">
                    <span>
                      <CreditCard size={20} />
                      BUS CARD
                    </span>
                    <span>ΠΑΤΡΑ</span>
                  </div>
                  <p className="balance-label">
                    {stale ? 'Τελευταίο γνωστό υπόλοιπο' : 'Υπόλοιπο διαδρομών'}
                  </p>
                  <div className="balance-value">
                    {balance?.rides !== null && balance?.rides !== undefined ? (
                      <>
                        <strong>{balance.rides}</strong>
                        <span>{rideLabel(balance.rides)}</span>
                      </>
                    ) : (
                      <strong>{loading ? '…' : '—'}</strong>
                    )}
                  </div>
                  {balance?.rides === null && (
                    <p className="balance-breakdown">
                      Δες το υπόλοιπο ανά προϊόν παρακάτω.
                    </p>
                  )}
                  <div className="balance-card-bottom">
                    <span>CB •••• •••• {cardId.slice(-4)}</span>
                    <span>Αποθηκευμένη κάρτα</span>
                  </div>
                </section>
                <div className="card-update-row">
                  <span>
                    {balance ? (
                      <>
                        Ενημέρωση{' '}
                        {new Intl.DateTimeFormat('el-GR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        }).format(balance.fetchedAt)}
                      </>
                    ) : loading ? (
                      'Ανάκτηση υπολοίπου…'
                    ) : (
                      'Χωρίς ενημέρωση'
                    )}
                  </span>
                  <button
                    onClick={() => void load(cardId)}
                    disabled={loading}
                    aria-label="Ανανέωση υπολοίπου"
                  >
                    <RefreshCw
                      size={15}
                      className={loading ? 'spinning' : ''}
                    />
                    Ανανέωση
                  </button>
                </div>
                {!!balance?.products.length && (
                  <section
                    className="card-products"
                    aria-label="Προϊόντα κάρτας"
                  >
                    <h2>Στην κάρτα σου</h2>
                    {balance.products.map((product) => (
                      <div className="card-product" key={product.key}>
                        <div>
                          <h3>{product.name}</h3>
                        </div>
                        <strong>{product.remaining}</strong>
                      </div>
                    ))}
                  </section>
                )}
                <div className="card-manage">
                  <button
                    onClick={() => {
                      request.current?.abort();
                      setLoading(false);
                      setInput(cardId);
                      setEditing(true);
                      setError('');
                    }}
                  >
                    <Pencil size={16} />
                    Αλλαγή κάρτας
                  </button>
                  <button onClick={remove}>
                    <Trash2 size={16} />
                    Αφαίρεση
                  </button>
                </div>
              </>
            )}
            <div aria-live="polite">
              {error && (
                <p className="card-error" role="alert">
                  {error}
                  {stale && ' Εμφανίζεται το προηγούμενο υπόλοιπο.'}
                </p>
              )}
              {storageError && (
                <p className="card-error" role="alert">
                  {storageError}
                </p>
              )}
            </div>
            <p className="card-privacy">
              <ShieldCheck size={17} />
              <span>
                Ο κωδικός αποθηκεύεται μόνο σε αυτόν τον browser, όπως οι
                αγαπημένες στάσεις σου.
              </span>
            </p>
            <a
              className="card-source"
              href="https://patra.buscard.gr"
              target="_blank"
              rel="noreferrer"
            >
              Στοιχεία από patra.buscard.gr <ArrowUpRight size={13} />
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
