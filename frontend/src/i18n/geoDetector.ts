/**
 * Geolocation-based Language Detection
 * Detects user's country via IP and returns the recommended language
 */

import { getLanguageForCountry, defaultLanguage } from './countryLanguageMap';

// localStorage key to track if geo detection has already run
const GEO_DETECTED_KEY = 'travelxpressa_geo_detected';

// Free IP geolocation API - ipapi.co supports HTTPS (1000 req/day free)
const GEO_API_URL = 'https://ipapi.co/json/';

// Timeout for geolocation request (don't block the app for too long)
const GEO_TIMEOUT_MS = 3000;

interface GeoApiResponse {
  country_code?: string;
  error?: boolean;
}

/**
 * Detect language based on user's geographic location
 * Only runs once per device - subsequent visits use stored preference
 *
 * @returns Promise<string | null> - Language code if detected, null if skipped or failed
 */
export async function detectLanguageByLocation(): Promise<string | null> {
  // Skip if already detected before (respect user's manual choice)
  if (localStorage.getItem(GEO_DETECTED_KEY)) {
    return null;
  }

  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GEO_TIMEOUT_MS);

    const response = await fetch(GEO_API_URL, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data: GeoApiResponse = await response.json();

    if (!data.error && data.country_code) {
      const language = getLanguageForCountry(data.country_code);

      // Mark as detected so we don't override user's future manual changes
      localStorage.setItem(GEO_DETECTED_KEY, 'true');

      console.log(`[GeoDetector] Detected country: ${data.country_code}, setting language: ${language}`);
      return language;
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('[GeoDetector] Request timed out');
    } else {
      console.warn('[GeoDetector] Detection failed:', error);
    }
  }

  // Mark as attempted even on failure to avoid repeated failed requests
  localStorage.setItem(GEO_DETECTED_KEY, 'true');
  return null;
}

/**
 * Reset geo detection flag (useful for testing)
 * Call this to allow geo detection to run again
 */
export function resetGeoDetection(): void {
  localStorage.removeItem(GEO_DETECTED_KEY);
}

/**
 * Check if geo detection has already been performed
 */
export function hasGeoDetectionRun(): boolean {
  return localStorage.getItem(GEO_DETECTED_KEY) === 'true';
}
