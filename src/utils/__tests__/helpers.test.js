import { describe, it, expect } from 'vitest';
import { computeExchangeRateFactor, makePaymentInsertPayload } from '../helpers';

describe('exchange helpers', () => {
  it('computes factor 1 when from==to', () => {
    expect(computeExchangeRateFactor('EGP', 'EGP', {EGP:1})).toBe(1);
  });

  it('computes expected factor from sample rates', () => {
    const rates = { EGP: 1, USD: 31.5, SAR: 8.4 };
    // Convert from USD to SAR: factor = rateFrom / rateTo = 31.5 / 8.4
    const f = computeExchangeRateFactor('USD', 'SAR', rates);
    expect(Math.abs(f - (31.5/8.4))).toBeLessThan(1e-9);
  });

  it('makes a sensible payment payload with provided rates', () => {
    const project = { id: 42, currency: 'EGP' };
    const newPayment = { amount: 100, date: '2025-01-01', note: 'test', type: 'income', status: 'paid', currency: 'USD' };
    const rates = { EGP:1, USD:31.5 };
    const payload = makePaymentInsertPayload(newPayment, project, rates);
    expect(payload.currency).toBe('USD');
    // exchange_rate should be rateFrom/rateTo = 31.5 / 1
    expect(payload.exchange_rate).toBeCloseTo(31.5);
    expect(payload.project_id).toBe(42);
  });
});
