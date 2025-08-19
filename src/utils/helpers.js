// src/utils/helpers.js
export const fmtCurrency = (n, cur) =>
  `${(isNaN(n) ? 0 : n).toLocaleString("en-US", { maximumFractionDigits: 2 })} ${cur}`;

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