/**
 * shared-kernel/value-objects/money.test.ts
 *
 * Unit tests for Money value object.
 *
 * Layer: VS0 Shared Kernel — Domain (pure)
 */
import { describe, expect, it } from 'vitest';

import { MONEY_ERRORS, Money } from './money';

describe('Money', () => {
  describe('of()', () => {
    it('creates Money for a valid non-negative amount and currency', () => {
      const result = Money.of(100, 'TWD');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.amount).toBe(100);
        expect(result.value.currency).toBe('TWD');
      }
    });

    it('creates Money for zero amount', () => {
      const result = Money.of(0, 'USD');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.amount).toBe(0);
      }
    });

    it('creates Money for a decimal amount within precision', () => {
      const result = Money.of(10.5, 'USD');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.amount).toBe(10.5);
      }
    });

    it('returns MONEY_NEGATIVE_AMOUNT error for a negative amount', () => {
      const result = Money.of(-1, 'TWD');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe(MONEY_ERRORS.NEGATIVE_AMOUNT);
      }
    });

    it('returns MONEY_INVALID_CURRENCY error for an unsupported currency', () => {
      const result = Money.of(100, 'JPY' as never);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe(MONEY_ERRORS.INVALID_CURRENCY);
      }
    });

    it('returns MONEY_PRECISION_OVERFLOW error for too many decimal places', () => {
      const result = Money.of(1.123456789, 'TWD');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe(MONEY_ERRORS.PRECISION_OVERFLOW);
      }
    });
  });

  describe('zero()', () => {
    it('creates a zero-amount Money for the given currency', () => {
      const m = Money.zero('EUR');
      expect(m.amount).toBe(0);
      expect(m.currency).toBe('EUR');
    });
  });

  describe('add()', () => {
    it('adds two Money values with the same currency', () => {
      const a = Money.zero('TWD');
      const b = Money.of(200, 'TWD');
      expect(b.ok).toBe(true);
      if (b.ok) {
        const sum = a.add(b.value);
        expect(sum).not.toBeNull();
        expect(sum?.amount).toBe(200);
      }
    });

    it('returns null when currencies differ', () => {
      const a = Money.zero('TWD');
      const b = Money.of(50, 'USD');
      expect(b.ok).toBe(true);
      if (b.ok) {
        expect(a.add(b.value)).toBeNull();
      }
    });

    it('avoids floating-point drift on addition', () => {
      const a = Money.of(0.1, 'USD');
      const b = Money.of(0.2, 'USD');
      expect(a.ok && b.ok).toBe(true);
      if (a.ok && b.ok) {
        const sum = a.value.add(b.value);
        expect(sum?.amount).toBe(0.3);
      }
    });
  });

  describe('multiply()', () => {
    it('multiplies Money by a positive factor', () => {
      const m = Money.of(100, 'TWD');
      expect(m.ok).toBe(true);
      if (m.ok) {
        const result = m.value.multiply(3);
        expect(result?.amount).toBe(300);
      }
    });

    it('multiplies Money by zero', () => {
      const m = Money.of(999, 'TWD');
      expect(m.ok).toBe(true);
      if (m.ok) {
        const result = m.value.multiply(0);
        expect(result?.amount).toBe(0);
      }
    });

    it('returns null for a negative multiplier', () => {
      const m = Money.of(100, 'TWD');
      expect(m.ok).toBe(true);
      if (m.ok) {
        expect(m.value.multiply(-1)).toBeNull();
      }
    });
  });

  describe('equals()', () => {
    it('returns true for two Money values with identical amount and currency', () => {
      const a = Money.of(50, 'USD');
      const b = Money.of(50, 'USD');
      expect(a.ok && b.ok).toBe(true);
      if (a.ok && b.ok) {
        expect(a.value.equals(b.value)).toBe(true);
      }
    });

    it('returns false when amounts differ', () => {
      const a = Money.of(50, 'USD');
      const b = Money.of(60, 'USD');
      expect(a.ok && b.ok).toBe(true);
      if (a.ok && b.ok) {
        expect(a.value.equals(b.value)).toBe(false);
      }
    });

    it('returns false when currencies differ', () => {
      const a = Money.of(50, 'USD');
      const b = Money.of(50, 'TWD');
      expect(a.ok && b.ok).toBe(true);
      if (a.ok && b.ok) {
        expect(a.value.equals(b.value)).toBe(false);
      }
    });
  });

  describe('toString()', () => {
    it('formats as "CURRENCY amount.toFixed(2)"', () => {
      const m = Money.of(99, 'TWD');
      expect(m.ok).toBe(true);
      if (m.ok) {
        expect(m.value.toString()).toBe('TWD 99.00');
      }
    });
  });
});
