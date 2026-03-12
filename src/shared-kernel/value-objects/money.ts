/**
 * shared-kernel/value-objects/money.ts
 *
 * Money — Immutable value object for monetary amounts.
 *
 * Layer: VS0 Shared Kernel — Domain (pure, no I/O)
 * Per docs/architecture/README.md: Value Objects must be immutable and self-validating.
 *
 * Used by: finance.slice, workspace.slice/domain.tasks (unitPrice, subtotal)
 */

/** Supported currency codes. */
export type CurrencyCode = 'TWD' | 'USD' | 'EUR';

/** Error codes for Money validation failures. */
export const MONEY_ERRORS = {
  NEGATIVE_AMOUNT: 'MONEY_NEGATIVE_AMOUNT',
  INVALID_CURRENCY: 'MONEY_INVALID_CURRENCY',
  PRECISION_OVERFLOW: 'MONEY_PRECISION_OVERFLOW',
} as const;

export type MoneyError = (typeof MONEY_ERRORS)[keyof typeof MONEY_ERRORS];

const SUPPORTED_CURRENCIES: ReadonlySet<string> = new Set(['TWD', 'USD', 'EUR']);
/** Maximum number of decimal places allowed. */
const MAX_DECIMAL_PLACES = 4;
/** Factor used to detect decimal places via modulo: 10^MAX_DECIMAL_PLACES. */
const PRECISION_FACTOR = 10 ** MAX_DECIMAL_PLACES;

/** Returns the number of decimal places in a finite number using modulo arithmetic. */
function decimalPlaces(n: number): number {
  if (!isFinite(n)) return 0;
  let rounded = n;
  let places = 0;
  while (places <= MAX_DECIMAL_PLACES) {
    if (Math.round(rounded) === rounded) return places;
    rounded *= 10;
    places++;
  }
  return places;
}

/**
 * Money — Immutable value object for monetary amounts with currency.
 *
 * Invariants enforced at construction:
 *   - Amount must be non-negative
 *   - Currency must be a supported code
 *   - Amount precision must not exceed MAX_DECIMAL_PLACES
 *
 * Usage:
 *   const price = Money.of(100, 'TWD')
 *   if (price.ok) { ... price.value.amount ... }
 */
export class Money {
  private constructor(
    /** The monetary amount (non-negative). */
    readonly amount: number,
    /** The ISO 4217 currency code. */
    readonly currency: CurrencyCode,
  ) {}

  /**
   * Creates a Money value object.
   * Returns `{ ok: true, value }` on success or `{ ok: false, error }` on failure.
   */
  static of(amount: number, currency: CurrencyCode): { ok: true; value: Money } | { ok: false; error: MoneyError } {
    if (amount < 0) {
      return { ok: false, error: MONEY_ERRORS.NEGATIVE_AMOUNT };
    }
    if (!SUPPORTED_CURRENCIES.has(currency)) {
      return { ok: false, error: MONEY_ERRORS.INVALID_CURRENCY };
    }
    if (decimalPlaces(amount) > MAX_DECIMAL_PLACES) {
      return { ok: false, error: MONEY_ERRORS.PRECISION_OVERFLOW };
    }
    return { ok: true, value: new Money(amount, currency) };
  }

  /** Creates a zero-amount Money for the given currency. */
  static zero(currency: CurrencyCode): Money {
    return new Money(0, currency);
  }

  /**
   * Adds two Money values with the same currency.
   * Returns `null` if currencies differ.
   * The result amount is rounded to MAX_DECIMAL_PLACES to avoid floating-point drift.
   */
  add(other: Money): Money | null {
    if (this.currency !== other.currency) return null;
    const raw = this.amount + other.amount;
    const rounded = Math.round(raw * PRECISION_FACTOR) / PRECISION_FACTOR;
    return new Money(rounded, this.currency);
  }

  /**
   * Multiplies this Money by a non-negative scalar.
   * Returns `null` if the multiplier is negative.
   * The result amount is rounded to MAX_DECIMAL_PLACES to avoid floating-point drift.
   */
  multiply(factor: number): Money | null {
    if (factor < 0) return null;
    const raw = this.amount * factor;
    const rounded = Math.round(raw * PRECISION_FACTOR) / PRECISION_FACTOR;
    return new Money(rounded, this.currency);
  }

  /** Returns true if this Money equals another by value. */
  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toString(): string {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }
}
