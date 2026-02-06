import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, ArrowRight, Globe, Check } from 'lucide-react';
import { countryList } from '../config/countries';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
const CountrySelect = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [hoveredCountry, setHoveredCountry] = useState(null);
    const handleContinue = () => {
        if (selectedCountry) {
            // Store selected country in localStorage for persistence
            localStorage.setItem('selectedCountry', selectedCountry);
            navigate('/ready');
        }
    };
    return (_jsxs("main", { className: "min-h-screen bg-background text-foreground pt-24 pb-12 theme-transition", children: [_jsx("div", { className: "fixed top-4 right-4 z-50", children: _jsx(LanguageSwitcher, {}) }), _jsxs("div", { className: "max-w-4xl mx-auto px-4", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 bg-secondary rounded-full mb-6", children: _jsx(Globe, { className: "w-8 h-8 text-foreground" }) }), _jsx("h1", { className: "text-4xl font-bold mb-4", children: t('selectCountry.title') }), _jsx("p", { className: "text-xl text-muted-foreground max-w-2xl mx-auto", children: t('selectCountry.subtitle') })] }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4 mb-12", children: countryList.map((country) => {
                            const isSelected = selectedCountry === country.code;
                            const isHovered = hoveredCountry === country.code;
                            return (_jsxs("button", { onClick: () => setSelectedCountry(country.code), onMouseEnter: () => setHoveredCountry(country.code), onMouseLeave: () => setHoveredCountry(null), className: `
                  relative p-6 rounded-xl border-2 transition-all duration-200
                  ${isSelected
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border hover:border-muted-foreground bg-card'}
                `, children: [isSelected && (_jsx("div", { className: "absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center", children: _jsx(Check, { className: "w-4 h-4 text-primary-foreground" }) })), _jsx("div", { className: "text-5xl mb-3", children: country.flag }), _jsx("h3", { className: `font-semibold text-lg ${isSelected ? 'text-foreground' : 'text-foreground'}`, children: country.name }), _jsx("p", { className: `
                  text-sm text-muted-foreground mt-1 transition-opacity duration-200
                  ${isHovered || isSelected ? 'opacity-100' : 'opacity-0'}
                `, children: t('selectCountry.clickToSelect') })] }, country.code));
                        }) }), _jsxs("div", { className: "flex flex-col items-center gap-4", children: [_jsx("button", { onClick: handleContinue, disabled: !selectedCountry, className: `
              inline-flex items-center gap-3 px-8 py-4 rounded-lg font-semibold text-lg
              transition-all duration-200
              ${selectedCountry
                                    ? 'bg-primary text-primary-foreground hover:opacity-90'
                                    : 'bg-secondary text-muted-foreground cursor-not-allowed'}
            `, children: selectedCountry ? (_jsxs(_Fragment, { children: [t('selectCountry.continueToApplication'), _jsx(ArrowRight, { className: "w-5 h-5" })] })) : (t('selectCountry.selectToContinue')) }), selectedCountry && (_jsxs("p", { className: "text-sm text-muted-foreground", children: [t('selectCountry.youSelected'), ": ", _jsxs("span", { className: "font-medium text-foreground", children: [countryList.find(c => c.code === selectedCountry)?.flag, ' ', countryList.find(c => c.code === selectedCountry)?.name] })] }))] }), _jsx("div", { className: "mt-16 bg-secondary rounded-2xl p-8 border border-border", children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "w-12 h-12 bg-background rounded-lg flex items-center justify-center flex-shrink-0", children: _jsx(Plane, { className: "w-6 h-6 text-foreground" }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-lg mb-2", children: t('selectCountry.whyMatters') }), _jsx("p", { className: "text-muted-foreground", children: t('selectCountry.whyMattersDescription') }), _jsxs("ul", { className: "mt-4 space-y-2 text-muted-foreground", children: [_jsxs("li", { className: "flex items-center gap-2", children: [_jsx(Check, { className: "w-4 h-4 text-primary" }), t('selectCountry.benefit1')] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(Check, { className: "w-4 h-4 text-primary" }), t('selectCountry.benefit2')] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(Check, { className: "w-4 h-4 text-primary" }), t('selectCountry.benefit3')] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(Check, { className: "w-4 h-4 text-primary" }), t('selectCountry.benefit4')] })] })] })] }) })] })] }));
};
export default CountrySelect;
