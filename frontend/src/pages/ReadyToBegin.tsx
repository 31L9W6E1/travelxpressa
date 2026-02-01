import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { findCountryByCode, type CountryConfig } from "../config/countries";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  User,
  Phone,
  FileText,
  Plane,
  MapPin,
  Users,
  Briefcase,
  GraduationCap,
  Shield,
  Camera,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Globe,
  Clock,
  DollarSign
} from "lucide-react";

const ReadyToBegin = () => {
  const { user } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState<CountryConfig | null>(null);

  useEffect(() => {
    const countryCode = localStorage.getItem('selectedCountry');
    if (countryCode) {
      const config = findCountryByCode(countryCode);
      if (config) {
        setSelectedCountry(config);
      }
    }
  }, []);

  // If no country selected, redirect to country selection
  if (!localStorage.getItem('selectedCountry')) {
    return <Navigate to="/select-country" />;
  }

  // Icon mapping for sections
  const sectionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    "Personal Details": User,
    "Personal Particulars": User,
    "Identity Details": User,
    "Contact Information": Phone,
    "Address & Contact": Phone,
    "Contact Details": Phone,
    "Passport Information": FileText,
    "Passport Details": FileText,
    "Passport & Travel Document": FileText,
    "Travel Information": Plane,
    "Travel Details": Plane,
    "Travel Itinerary": Plane,
    "Travel Plans": Plane,
    "Travel History": MapPin,
    "Previous Japan Visits": MapPin,
    "Previous Immigration History": MapPin,
    "Immigration History": MapPin,
    "U.S. Point of Contact": MapPin,
    "Accommodation Details": MapPin,
    "Accommodation in Ireland": MapPin,
    "Accommodation & Travel Plans": MapPin,
    "Family Information": Users,
    "Family Details": Users,
    "Guarantor/Inviter Details": Users,
    "Sponsor/Reference Details": Users,
    "Work/Education/Training": Briefcase,
    "Employment Information": Briefcase,
    "Employment Details": Briefcase,
    "Employment/Education History": Briefcase,
    "Employment & Income": Briefcase,
    "Employment History": Briefcase,
    "Education Background": GraduationCap,
    "Education History": GraduationCap,
    "Security and Background": Shield,
    "Background Information": Shield,
    "Medical & Character": Shield,
    "Character & Health": Shield,
    "Character Requirements": Shield,
    "Health Requirements": Shield,
    "SEVIS Information": GraduationCap,
    "Biometrics": Camera,
    "Photo Requirements": Camera,
    "Financial Information": DollarSign,
    "Financial Capacity": DollarSign,
    "Funds & Sponsorship": DollarSign,
    "Purpose of Visit": Plane,
    "Ties to Home Country": MapPin,
    "Additional Information": FileText,
    "Declaration & Submit": CheckCircle,
    "Review & Submit": CheckCircle,
  };

  const getIconForSection = (sectionName: string) => {
    return sectionIcons[sectionName] || FileText;
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-16 theme-transition">
      {/* Header Section */}
      <section className="py-16 border-b border-border">
        <div className="max-w-6xl mx-auto px-6">
          {/* Welcome badge with country */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            {user && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-full text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4" />
                Welcome back, {user.name}
              </div>
            )}
            {selectedCountry && (
              <Link
                to="/select-country"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm text-foreground hover:bg-primary/20 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="text-lg">{selectedCountry.flag}</span>
                {selectedCountry.name}
                <span className="text-muted-foreground text-xs">(Change)</span>
              </Link>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Information You'll Need
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            {selectedCountry
              ? `The ${selectedCountry.name} visa application contains ${selectedCountry.formSections.length} main sections. Gather these details before starting to make the process smoother.`
              : "Gather all required details before starting your visa application to make the process smoother."}
          </p>
        </div>
      </section>

      {/* Country-specific Info Bar */}
      {selectedCountry && (
        <section className="py-6 border-b border-border">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Processing Time</p>
                  <p className="font-medium text-foreground text-sm">{selectedCountry.processingTimeline}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Visa Fee</p>
                  <p className="font-medium text-foreground text-sm">
                    {selectedCountry.paymentPricing.currency} {selectedCountry.paymentPricing.baseFee}
                    {selectedCountry.paymentPricing.serviceFee > 0 && ` + ${selectedCountry.paymentPricing.serviceFee} service fee`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
                <Users className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Interview Required</p>
                  <p className="font-medium text-foreground text-sm">{selectedCountry.interviewRequired ? 'Yes' : 'Generally No'}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Important Notice */}
      <section className="py-8 border-b border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-secondary border border-border rounded-xl p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-foreground flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground mb-1">Important Notice</h4>
                <p className="text-muted-foreground text-sm">
                  {selectedCountry?.embassyRequirements ||
                    "All answers must be in English using English characters. Your application will be saved automatically as you progress."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form Sections Grid */}
      <section className="py-16 border-b border-border">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8">Application Sections</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedCountry?.formSections.map((section, index) => {
              const IconComponent = getIconForSection(section);
              const helpText = selectedCountry.helpText[section.toLowerCase().replace(/\s+/g, '')] || null;

              return (
                <div
                  key={index}
                  className="bg-card hover:bg-secondary border border-border hover:border-muted-foreground rounded-xl p-6 transition-all"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-secondary rounded-lg">
                      <IconComponent className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Section {index + 1}</span>
                      <h3 className="font-semibold text-foreground">{section}</h3>
                    </div>
                  </div>
                  {helpText && (
                    <p className="text-sm text-muted-foreground">{helpText}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Required Documents Checklist */}
      <section className="py-16 border-b border-border">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8">Required Documents</h2>

          <div className="grid md:grid-cols-2 gap-4">
            {selectedCountry?.requiredDocuments.map((doc, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-card border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                <div className="w-5 h-5 border-2 border-border rounded flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground text-sm">{doc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-secondary border border-border rounded-2xl p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Begin?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Our guided system will walk you through each section of your {selectedCountry?.name || 'visa'} application.
              Your progress is automatically saved.
            </p>

            <Link
              to="/application"
              className="group inline-flex items-center gap-3 px-10 py-5 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-all text-lg"
            >
              Start {selectedCountry?.name || 'Visa'} Application
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Free to start
              </span>
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Auto-save enabled
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReadyToBegin;
