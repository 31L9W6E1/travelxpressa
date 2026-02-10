import { CountryConfig, CountryCode } from './types';
import { usaConfig } from './usa';
import { koreaConfig } from './korea';
import { schengenConfig } from './schengen';
import { canadaConfig } from './canada';
import { japanConfig } from './japan';
import { irelandConfig } from './ireland';
import { ukConfig } from './uk';
import { australiaConfig } from './australia';
import { newZealandConfig } from './new-zealand';

// Export all individual configs
export { usaConfig } from './usa';
export { koreaConfig } from './korea';
export { schengenConfig } from './schengen';
export { canadaConfig } from './canada';
export { japanConfig } from './japan';
export { irelandConfig } from './ireland';
export { ukConfig } from './uk';
export { australiaConfig } from './australia';
export { newZealandConfig } from './new-zealand';

// Export types
export * from './types';

// Country configuration map
export const countryConfigs: Record<CountryCode, CountryConfig> = {
  USA: usaConfig,
  KOREA: koreaConfig,
  SCHENGEN: schengenConfig,
  CANADA: canadaConfig,
  JAPAN: japanConfig,
  IRELAND: irelandConfig,
  UK: ukConfig,
  AUSTRALIA: australiaConfig,
  NEW_ZEALAND: newZealandConfig,
};

// Get configuration by country code
export const getCountryConfig = (code: CountryCode): CountryConfig => {
  return countryConfigs[code];
};

// Get all available countries
export const getAvailableCountries = (): CountryConfig[] => {
  // Business decision: we do not currently offer Korea visa services.
  return Object.values(countryConfigs).filter((c) => c.code !== "KOREA");
};

// Get country by code (with null check)
export const findCountryByCode = (code: string): CountryConfig | undefined => {
  return countryConfigs[code as CountryCode];
};

// Country list for selection dropdown
export const countryList = getAvailableCountries().map((config) => ({
  code: config.code,
  name: config.name,
  flag: config.flag,
}));

// Default country (USA for DS-160)
export const DEFAULT_COUNTRY: CountryCode = 'USA';
