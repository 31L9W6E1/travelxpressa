const languageToLocale = (language?: string): string => {
  const base = (language || 'en').toLowerCase().split('-')[0];
  switch (base) {
    case 'mn':
      return 'mn-MN';
    case 'ru':
      return 'ru-RU';
    case 'zh':
      return 'zh-CN';
    case 'ko':
      return 'ko-KR';
    case 'ja':
      return 'ja-JP';
    default:
      return 'en-US';
  }
};

export const getCurrencyForLanguage = (language?: string): string => {
  const base = (language || 'en').toLowerCase().split('-')[0];
  switch (base) {
    case 'mn':
      return 'MNT';
    case 'ru':
      return 'RUB';
    case 'zh':
      return 'CNY';
    case 'ko':
      return 'KRW';
    case 'ja':
      return 'JPY';
    default:
      return 'USD';
  }
};

export const formatNumber = (value: number, language?: string): string => {
  const locale = languageToLocale(language);
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
};

export const formatMnt = (amount: number, language?: string): string => {
  return `${formatNumber(amount, language)} MNT`;
};

export const formatCurrencyCodeAmount = (currencyCode: string, amount: number, language?: string): string => {
  return `${currencyCode} ${formatNumber(amount, language)}`;
};
