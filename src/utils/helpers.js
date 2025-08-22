// src/utils/helpers.js
export const fmtCurrency = (n, cur) =>
  `${(isNaN(n) ? 0 : n).toLocaleString("en-US", { maximumFractionDigits: 2 })} ${cur}`;

// Simple exchange rates table (base: EGP). Replace or update via fetchRates for real data.
export const DEFAULT_EXCHANGE_RATES = {
  EGP: 1,
  USD: 31.5,
  EUR: 34.0,
  SAR: 8.4,
};

/**
 * Compute the factor to convert from -> to using a rates map expressed relative to EGP.
 * Returns a numeric multiplier such that: amount_in_to = amount_in_from * factor
 */
export function computeExchangeRateFactor(from = "EGP", to = "EGP", rates = DEFAULT_EXCHANGE_RATES) {
  if (!from || from === to) return 1;
  const rateFrom = rates[from] ?? 1;
  const rateTo = rates[to] ?? 1;
  return rateFrom / rateTo;
}

/**
 * Convert amount from one currency to another using a rates map expressed relative to EGP (base).
 */
export function convertCurrency(amount, from = "EGP", to = "EGP", rates = DEFAULT_EXCHANGE_RATES) {
  const a = Number(amount) || 0;
  const factor = computeExchangeRateFactor(from, to, rates);
  return a * factor;
}

/**
 * Fetch live conversion rates. Uses an optional environment-configurable endpoint
 * defined by VITE_RATES_ENDPOINT. If the env var is not set, falls back to exchangerate.host.
 * Returns a map relative to EGP (rates.EGP === 1).
 */
export async function fetchRates() {
  const endpoint = import.meta.env?.VITE_RATES_ENDPOINT || "https://api.exchangerate.host/latest?base=EGP";
  try {
    const res = await fetch(endpoint);
    if (!res.ok) return DEFAULT_EXCHANGE_RATES;
    const data = await res.json();
    const rates = { EGP: 1 };
    Object.entries(data.rates || {}).forEach(([k, v]) => {
      rates[k] = Number(v) || 1;
    });
    return rates;
  } catch (err) {
    return DEFAULT_EXCHANGE_RATES;
  }
}

/**
 * Build the DB insert payload for a payment given newPayment and project info.
 * If `rates` is provided it will be used to compute exchange_rate; otherwise exchange_rate defaults to 1.
 */
export function makePaymentInsertPayload(newPayment = {}, project = {}, rates = DEFAULT_EXCHANGE_RATES) {
  const from = newPayment.currency || project.currency || 'EGP';
  const to = project.currency || 'EGP';
  const exchange_rate = computeExchangeRateFactor(from, to, rates);
  return {
    amount: newPayment.amount,
    pay_date: newPayment.date,
    note: newPayment.note,
    category_id: newPayment.category_id ?? null,
    project_id: project.id,
    type: newPayment.type,
    status: newPayment.status,
    currency: from,
    exchange_rate,
    payment_method: newPayment.payment_method || null,
  };
}

/**
 * Convenience helper: fetch live rates and return the payload using those live rates.
 */
export async function createPaymentPayloadWithLiveRates(newPayment = {}, project = {}) {
  const rates = await fetchRates();
  return makePaymentInsertPayload(newPayment, project, rates);
}

export const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

export const parseDate = (v) => (v ? new Date(v) : null);

export const toISO = (d) =>
  d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10) : "";

export const daysBetween = (a, b) => {
  if (!a || !b) return 0;
  const ms = b.getTime() - a.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

export const pctFromDate = (start, end, d) => {
  if (!start || !end || !d) return 0;
  return clamp(((d.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100, 0, 100);
};

export const dateFromPct = (start, end, pct) => {
  if (!start || !end) return null;
  const t = start.getTime() + (pct / 100) * (end.getTime() - start.getTime());
  return new Date(t);
};

export const monthTicks = (start, end) => {
  if (!start || !end) return [];
  const s = new Date(start.getFullYear(), start.getMonth(), 1);
  const e = new Date(end.getFullYear(), end.getMonth(), 1);
  const arr = [];
  while (s <= e) {
    arr.push({ label: `${s.getFullYear()}-${String(s.getMonth() + 1).padStart(2, "0")}`, date: new Date(s) });
    s.setMonth(s.getMonth() + 1);
  }
  return arr;
};