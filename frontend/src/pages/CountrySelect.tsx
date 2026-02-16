import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, ArrowRight, Globe, Check } from 'lucide-react';
import { countryList, type CountryCode } from '../config/countries';
import { useTranslation } from 'react-i18next';

const CountrySelect = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const premiumCardClass =
    'group relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/15 via-background to-background shadow-sm transition-colors duration-200 hover:border-primary/45';

  const handleContinue = () => {
    if (selectedCountry) {
      // Store selected country in localStorage for persistence
      localStorage.setItem('selectedCountry', selectedCountry);
      navigate('/ready');
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground py-10 md:py-12 theme-transition">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${premiumCardClass}`}>
            <div className="pointer-events-none absolute -top-7 -right-7 h-16 w-16 rounded-full bg-primary/15 blur-xl" />
            <div className="pointer-events-none absolute -bottom-8 -left-8 h-16 w-16 rounded-full bg-primary/10 blur-xl" />
            <Globe className="relative z-[1] w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('selectCountry.title')}</h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('selectCountry.subtitle')}
          </p>
        </div>

        {/* Country Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          {countryList.map((country) => {
            const isSelected = selectedCountry === country.code;
            const isHovered = hoveredCountry === country.code;

            return (
              <button
                key={country.code}
                onClick={() => setSelectedCountry(country.code as CountryCode)}
                onMouseEnter={() => setHoveredCountry(country.code)}
                onMouseLeave={() => setHoveredCountry(null)}
                className={`
                  relative p-6 rounded-2xl border transition-all duration-200 overflow-hidden
                  ${isSelected
                    ? 'border-primary/45 bg-gradient-to-br from-primary/20 via-background to-background'
                    : 'border-primary/25 bg-gradient-to-br from-primary/15 via-background to-background hover:border-primary/45'
                  }
                `}
              >
                <div className="pointer-events-none absolute -top-7 -right-7 h-16 w-16 rounded-full bg-primary/15 blur-xl" />
                <div className="pointer-events-none absolute -bottom-8 -left-8 h-16 w-16 rounded-full bg-primary/10 blur-xl" />
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3 z-[2] w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}

                {/* Flag */}
                <div className="relative z-[1] text-5xl mb-3">{country.flag}</div>

                {/* Country name */}
                <h3 className={`relative z-[1] font-semibold text-lg ${isSelected ? 'text-foreground' : 'text-foreground'}`}>
                  {country.name}
                </h3>

                {/* Hover effect text */}
                <p className={`
                  relative z-[1] text-sm text-muted-foreground mt-1 transition-opacity duration-200
                  ${isHovered || isSelected ? 'opacity-100' : 'opacity-0'}
                `}>
                  {t('selectCountry.clickToSelect')}
                </p>
              </button>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleContinue}
            disabled={!selectedCountry}
            className={`
              inline-flex items-center gap-3 px-8 py-4 rounded-lg font-semibold text-lg
              transition-all duration-200
              ${selectedCountry
                ? 'bg-primary text-primary-foreground hover:opacity-90'
                : 'bg-secondary text-muted-foreground cursor-not-allowed'
              }
            `}
          >
            {selectedCountry ? (
              <>
                {t('selectCountry.continueToApplication')}
                <ArrowRight className="w-5 h-5" />
              </>
            ) : (
              t('selectCountry.selectToContinue')
            )}
          </button>

          {selectedCountry && (
            <p className="text-sm text-muted-foreground">
              {t('selectCountry.youSelected')}: <span className="font-medium text-foreground">
                {countryList.find(c => c.code === selectedCountry)?.flag}{' '}
                {countryList.find(c => c.code === selectedCountry)?.name}
              </span>
            </p>
          )}
        </div>

        {/* Info Section */}
        <div className={`mt-10 md:mt-16 p-6 md:p-8 ${premiumCardClass}`}>
          <div className="pointer-events-none absolute -top-7 -right-7 h-16 w-16 rounded-full bg-primary/15 blur-xl" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 h-16 w-16 rounded-full bg-primary/10 blur-xl" />
          <div className="relative flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Plane className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">{t('selectCountry.whyMatters')}</h3>
              <p className="text-muted-foreground">
                {t('selectCountry.whyMattersDescription')}
              </p>
              <ul className="mt-4 space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  {t('selectCountry.benefit1')}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  {t('selectCountry.benefit2')}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  {t('selectCountry.benefit3')}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  {t('selectCountry.benefit4')}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CountrySelect;
