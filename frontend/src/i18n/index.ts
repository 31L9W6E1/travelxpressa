import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import mn from './locales/mn.json';
import zh from './locales/zh.json';
import ko from './locales/ko.json';
import ja from './locales/ja.json';
import ru from './locales/ru.json';

import { detectLanguageByLocation, hasGeoDetectionRun, resetGeoDetection } from './geoDetector';

export const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'mn', name: 'Монгол', flag: '🇲🇳' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

const resources = {
  en: { translation: en },
  mn: { translation: mn },
  zh: { translation: zh },
  ko: { translation: ko },
  ja: { translation: ja },
  ru: { translation: ru },
};

// Initialize i18n synchronously first with browser detection
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

/**
 * Initialize geolocation-based language detection
 * Should be called after app mounts to avoid blocking initial render
 */
export async function initGeoLanguageDetection(): Promise<void> {
  // Only run geo detection if:
  // 1. User hasn't manually selected a language (check localStorage)
  // 2. Geo detection hasn't run before
  const storedLanguage = localStorage.getItem('i18nextLng');
  const isFirstVisit = !storedLanguage || !hasGeoDetectionRun();

  if (isFirstVisit) {
    const geoLanguage = await detectLanguageByLocation();
    if (geoLanguage && geoLanguage !== i18n.language) {
      await i18n.changeLanguage(geoLanguage);
      console.log(`[i18n] Language set to ${geoLanguage} based on location`);
    }
  }
}

// Export geo detection utilities for testing/debugging
export { resetGeoDetection, hasGeoDetectionRun };

export default i18n;
