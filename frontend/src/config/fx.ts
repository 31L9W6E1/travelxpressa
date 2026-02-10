// Lightweight currency conversion utilities used for *display* (and simple fee calculations).
//
// We intentionally keep rates static (no runtime network calls) to avoid flaky UX.
// Update these periodically as needed.
//
// Rates are expressed as: 1 USD = X <CURRENCY>
export const FX_LAST_UPDATED_ISO = "2026-02-10";

export const USD_TO: Record<string, number> = {
  USD: 1,

  // Major currencies (approx)
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.35,
  AUD: 1.52,
  NZD: 1.65,
  JPY: 150,
  KRW: 1330,
  CNY: 7.2,
  RUB: 92,

  // Mongolia
  MNT: 3450,
};

export const isFxCurrencySupported = (currencyCode: string): boolean => {
  return Object.prototype.hasOwnProperty.call(USD_TO, currencyCode);
};

export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
): number => {
  if (!Number.isFinite(amount)) return 0;
  if (fromCurrency === toCurrency) return amount;

  const from = USD_TO[fromCurrency];
  const to = USD_TO[toCurrency];
  if (!from || !to) return amount;

  const usd = amount / from;
  return usd * to;
};

