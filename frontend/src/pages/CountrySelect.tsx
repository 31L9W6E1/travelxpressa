import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, ArrowRight, Globe, Check } from 'lucide-react';
import { countryList, type CountryCode } from '../config/countries';

const CountrySelect = () => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedCountry) {
      // Store selected country in localStorage for persistence
      localStorage.setItem('selectedCountry', selectedCountry);
      navigate('/ready');
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground pt-24 pb-12 theme-transition">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary rounded-full mb-6">
            <Globe className="w-8 h-8 text-foreground" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Select Your Destination</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the country you're applying to visit. We'll customize your application form
            based on that country's specific visa requirements.
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
                  relative p-6 rounded-xl border-2 transition-all duration-200
                  ${isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-muted-foreground bg-card'
                  }
                `}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}

                {/* Flag */}
                <div className="text-5xl mb-3">{country.flag}</div>

                {/* Country name */}
                <h3 className={`font-semibold text-lg ${isSelected ? 'text-foreground' : 'text-foreground'}`}>
                  {country.name}
                </h3>

                {/* Hover effect text */}
                <p className={`
                  text-sm text-muted-foreground mt-1 transition-opacity duration-200
                  ${isHovered || isSelected ? 'opacity-100' : 'opacity-0'}
                `}>
                  Click to select
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
                Continue to Application
                <ArrowRight className="w-5 h-5" />
              </>
            ) : (
              'Select a country to continue'
            )}
          </button>

          {selectedCountry && (
            <p className="text-sm text-muted-foreground">
              You selected: <span className="font-medium text-foreground">
                {countryList.find(c => c.code === selectedCountry)?.flag}{' '}
                {countryList.find(c => c.code === selectedCountry)?.name}
              </span>
            </p>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-16 bg-secondary rounded-2xl p-8 border border-border">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-background rounded-lg flex items-center justify-center flex-shrink-0">
              <Plane className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Why does country selection matter?</h3>
              <p className="text-muted-foreground">
                Each country has different visa requirements, document checklists, and application forms.
                By selecting your destination country upfront, we can:
              </p>
              <ul className="mt-4 space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Show you the exact documents you'll need
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Guide you through country-specific form sections
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Provide accurate processing time estimates
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Calculate the correct visa fees
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
