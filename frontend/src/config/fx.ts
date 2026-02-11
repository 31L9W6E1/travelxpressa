// Lightweight currency conversion utilities used for *display* (and simple fee calculations).
//
// We intentionally keep rates static (no runtime network calls) to avoid flaky UX.
// Update these periodically as needed.
//
// Rates are expressed as: 1 USD = X <CURRENCY>
export const FX_LAST_UPDATED_ISO = "2026-02-11";

export const USD_TO: Record<string, number> = {
  USD: 1,

  // Approx based on quoted FX board shared by user (2026-02-11).
  EUR: 0.85,
  GBP: 0.74,
  CAD: 1.36,
  AUD: 1.43,
  NZD: 1.68,
  JPY: 154,
  KRW: 1458,
  CNY: 6.93,
  RUB: 83,

  // Mongolia
  MNT: 3559,
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
