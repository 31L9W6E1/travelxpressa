/**
 * Country to Language Mapping
 * Maps ISO 3166-1 alpha-2 country codes to supported language codes
 */

export const countryToLanguage: Record<string, string> = {
  // Mongolian
  MN: 'mn',

  // Russian-speaking countries
  RU: 'ru',  // Russia
  KZ: 'ru',  // Kazakhstan
  BY: 'ru',  // Belarus
  KG: 'ru',  // Kyrgyzstan
  TJ: 'ru',  // Tajikistan
  UZ: 'ru',  // Uzbekistan
  TM: 'ru',  // Turkmenistan
  UA: 'ru',  // Ukraine
  AZ: 'ru',  // Azerbaijan
  AM: 'ru',  // Armenia
  MD: 'ru',  // Moldova

  // Chinese-speaking
  CN: 'zh',  // China
  TW: 'zh',  // Taiwan
  HK: 'zh',  // Hong Kong
  MO: 'zh',  // Macau

  // Japanese
  JP: 'ja',

  // Korean
  KR: 'ko',  // South Korea
};

// Default language for countries not in the mapping
export const defaultLanguage = 'en';

/**
 * Get the recommended language for a given country code
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., 'MN', 'RU', 'US')
 * @returns Language code (e.g., 'mn', 'ru', 'en')
 */
export function getLanguageForCountry(countryCode: string): string {
  return countryToLanguage[countryCode?.toUpperCase()] || defaultLanguage;
}
