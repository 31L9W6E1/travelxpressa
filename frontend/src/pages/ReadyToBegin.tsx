import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { findCountryByCode, type CountryConfig } from "../config/countries";
import { convertCurrency, isFxCurrencySupported } from "@/config/fx";
import { calculateServiceFee } from "@/config/pricing";
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
import { useTranslation } from "react-i18next";
import { formatCurrencyCodeAmount, getCurrencyForLanguage } from "@/lib/money";

const MONGOLIAN_SECTION_TRANSLATIONS: Record<string, string> = {
  "Personal Information": "Хувийн мэдээлэл",
  "Passport Details": "Паспортын мэдээлэл",
  "Travel Plans": "Аяллын төлөвлөгөө",
  "Previous US Travel": "АНУ-д өмнө зорчсон түүх",
  "US Point of Contact": "АНУ дахь холбоо барих хүн/байгууллага",
  "Family Information": "Гэр бүлийн мэдээлэл",
  "Work/Education": "Ажил/Боловсрол",
  "Security Questions": "Аюулгүй байдлын асуултууд",
  "Review & Submit": "Шалгах ба илгээх",
  "Travel Itinerary": "Аяллын маршрут",
  "Accommodation Details": "Байрлах газрын мэдээлэл",
  "Travel Insurance": "Аяллын даатгал",
  "Financial Proof": "Санхүүгийн нотолгоо",
  "Purpose of Visit": "Айлчлалын зорилго",
  "Previous Schengen Visas": "Өмнөх Шенгений визүүд",
  "Personal Details": "Хувийн дэлгэрэнгүй мэдээлэл",
  "Passport Information": "Паспортын мэдээлэл",
  "Employment Information": "Ажлын мэдээлэл",
  "Financial Information": "Санхүүгийн мэдээлэл",
  "Guarantor/Inviter Details": "Батлан даагч/Уригчийн мэдээлэл",
  "Previous Japan Visits": "Японд өмнө зорчсон түүх",
  "Personal Particulars": "Хувийн ерөнхий мэдээлэл",
  "Contact Information": "Холбоо барих мэдээлэл",
  "Travel Details": "Аяллын дэлгэрэнгүй",
  "Employment History": "Ажлын түүх",
  "Education Background": "Боловсролын мэдээлэл",
  "Financial Capacity": "Санхүүгийн чадамж",
  "Health Requirements": "Эрүүл мэндийн шаардлага",
  "Character Requirements": "Ёс зүйн шаардлага",
  "Travel History": "Аяллын түүх",
  "Ties to Home Country": "Эх оронтой холбоо",
  "Background Information": "Ерөнхий мэдээлэл",
  Biometrics: "Биометрик",
  "Accommodation in Ireland": "Ирланд дахь байрлах мэдээлэл",
  "Employment/Education History": "Ажил/Боловсролын түүх",
  "Previous Immigration History": "Цагаачлалын өмнөх түүх",
  "Sponsor/Reference Details": "Ивээн тэтгэгч/Лавлагаа мэдээлэл",
  "Basic Information": "Үндсэн мэдээлэл",
  "Travel Purpose": "Аяллын зорилго",
  Accommodation: "Байрлах мэдээлэл",
  "Invitation Letter": "Урилгын захидал",
  "Work/Study Details": "Ажил/Сургалтын дэлгэрэнгүй",
  "Identity Details": "Иргэний үнэмлэхийн мэдээлэл",
  "Contact Details": "Холбоо барих дэлгэрэнгүй",
  "Character & Health": "Ёс зүй ба эрүүл мэнд",
  "Funds & Sponsorship": "Санхүү ба ивээн тэтгэгч",
  "Employment Details": "Ажлын дэлгэрэнгүй",
  "Education History": "Боловсролын түүх",
  "Immigration History": "Цагаачлалын түүх",
  "Passport & Travel Document": "Паспорт ба аяллын баримт",
  "Family Details": "Гэр бүлийн дэлгэрэнгүй",
  "Accommodation & Travel Plans": "Байрлал ба аяллын төлөвлөгөө",
  "Employment & Income": "Ажил ба орлого",
  "Medical & Character": "Эрүүл мэнд ба ёс зүй",
  "Additional Information": "Нэмэлт мэдээлэл",
  "Declaration & Submit": "Мэдэгдэл ба илгээх",
};

const MONGOLIAN_DOCUMENT_TRANSLATIONS: Record<string, string> = {
  "Valid Passport": "Хүчинтэй гадаад паспорт",
  "Digital Photo (2x2 inches)": "Цахим зураг (2x2 инч)",
  "DS-160 Confirmation Page": "DS-160 баталгаажуулалтын хуудас",
  "SEVIS Fee Receipt (for students)": "SEVIS төлбөрийн баримт (оюутанд)",
  "Invitation Letter (if applicable)": "Урилгын захидал (холбогдох бол)",
  "Financial Documents": "Санхүүгийн баримт бичгүүд",
  "Employment Letter": "Ажлын газрын тодорхойлолт",
  "Previous US Visas (if any)": "Өмнөх АНУ-ын визүүд (байгаа бол)",
};

const ReadyToBegin = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState<CountryConfig | null>(null);
  const displayCurrency = getCurrencyForLanguage(i18n.language);
  const locale = i18n.language.toLowerCase().split("-")[0];

  // Business decision: Korea visa services are not currently offered.
  // Clear any stale selection so the redirect logic below works immediately.
  if (typeof window !== "undefined" && localStorage.getItem("selectedCountry") === "KOREA") {
    localStorage.removeItem("selectedCountry");
  }

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

  const getLocalizedSectionName = (sectionName: string) => {
    if (locale === "mn") {
      return MONGOLIAN_SECTION_TRANSLATIONS[sectionName] || sectionName;
    }
    return sectionName;
  };

  const getLocalizedDocumentName = (documentName: string) => {
    if (locale === "mn") {
      return MONGOLIAN_DOCUMENT_TRANSLATIONS[documentName] || documentName;
    }
    return documentName;
  };

  const premiumCardClass =
    "group relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/15 via-background to-background shadow-sm transition-colors duration-200 hover:border-primary/45";
  const premiumGlowClass =
    "pointer-events-none absolute -top-7 -right-7 h-16 w-16 rounded-full bg-primary/15 blur-xl";
  const premiumGlowBottomClass =
    "pointer-events-none absolute -bottom-8 -left-8 h-16 w-16 rounded-full bg-primary/10 blur-xl";

  const toDisplayCurrency = (amount: number, fromCurrency: string): string => {
    const rounded = Math.round(amount);
    if (!isFxCurrencySupported(fromCurrency) || !isFxCurrencySupported(displayCurrency)) {
      return formatCurrencyCodeAmount(fromCurrency, rounded, i18n.language);
    }
    const converted = convertCurrency(rounded, fromCurrency, displayCurrency);
    return formatCurrencyCodeAmount(displayCurrency, Math.round(converted), i18n.language);
  };

  return (
    <div className="min-h-screen bg-background text-foreground theme-transition">
      {/* Header Section */}
      <section className="py-10 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Welcome badge with country */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            {user && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-full text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4" />
                {t("readyPage.badge.welcomeBack", {
                  defaultValue: "Welcome back, {{name}}",
                  name: user.name,
                })}
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
                <span className="text-muted-foreground text-xs">
                  {t("readyPage.badge.change", { defaultValue: "(Change)" })}
                </span>
              </Link>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            {t("readyPage.title", { defaultValue: "Information You'll Need" })}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
            {selectedCountry
              ? t("readyPage.subtitleWithCountry", {
                  defaultValue:
                    "The {{country}} visa application contains {{count}} main sections. Gather these details before starting to make the process smoother.",
                  country: selectedCountry.name,
                  count: selectedCountry.formSections.length,
                })
              : t("readyPage.subtitleGeneric", {
                  defaultValue:
                    "Gather all required details before starting your visa application to make the process smoother.",
                })}
          </p>
        </div>
      </section>

      {/* Country-specific Info Bar */}
      {selectedCountry && (
        <section className="py-6 border-b border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`${premiumCardClass} p-4`}>
                <div className={premiumGlowClass} />
                <div className={premiumGlowBottomClass} />
                <div className="relative flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                  <p className="text-xs text-muted-foreground">
                    {t("readyPage.info.processingTime", { defaultValue: "Processing Time" })}
                  </p>
                  <p className="font-medium text-foreground text-sm">{selectedCountry.processingTimeline}</p>
                </div>
              </div>
              </div>
              <div className={`${premiumCardClass} p-4`}>
                <div className={premiumGlowClass} />
                <div className={premiumGlowBottomClass} />
                <div className="relative flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                  <p className="text-xs text-muted-foreground">
                    {t("readyPage.info.visaFee", { defaultValue: "Visa Fee" })}
                  </p>
                  <p className="font-medium text-foreground text-sm">
                    {toDisplayCurrency(
                      selectedCountry.paymentPricing.baseFee,
                      selectedCountry.paymentPricing.currency,
                    )}{" "}
                    {t("readyPage.info.serviceFeeSuffix", {
                      defaultValue: "+ {{fee}} service fee",
                      fee: toDisplayCurrency(
                        calculateServiceFee(selectedCountry.paymentPricing.baseFee),
                        selectedCountry.paymentPricing.currency,
                      ),
                    })}
                  </p>
                </div>
              </div>
              </div>
              <div className={`${premiumCardClass} p-4`}>
                <div className={premiumGlowClass} />
                <div className={premiumGlowBottomClass} />
                <div className="relative flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                  <p className="text-xs text-muted-foreground">
                    {t("readyPage.info.interviewRequired", { defaultValue: "Interview Required" })}
                  </p>
                  <p className="font-medium text-foreground text-sm">
                    {selectedCountry.interviewRequired
                      ? t("readyPage.info.interviewYes", { defaultValue: "Yes" })
                      : t("readyPage.info.interviewNo", { defaultValue: "Generally No" })}
                  </p>
                </div>
              </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Important Notice */}
      <section className="py-8 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className={`${premiumCardClass} p-6`}>
            <div className={premiumGlowClass} />
            <div className={premiumGlowBottomClass} />
            <div className="relative flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">
                  {t("readyPage.notice.title", { defaultValue: "Important Notice" })}
                </h4>
                <p className="text-muted-foreground text-sm">
                  {selectedCountry?.embassyRequirements ||
                    t("readyPage.notice.defaultDescription", {
                      defaultValue:
                        "All answers must be in English using English characters. Your application will be saved automatically as you progress.",
                    })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form Sections Grid */}
      <section className="py-12 md:py-16 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold mb-8">
            {t("readyPage.sections.title", { defaultValue: "Application Sections" })}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {selectedCountry?.formSections.map((section, index) => {
              const IconComponent = getIconForSection(section);
              const helpText = selectedCountry.helpText[section.toLowerCase().replace(/\s+/g, '')] || null;

              return (
                <div
                  key={index}
                  className={`${premiumCardClass} p-4 md:p-6`}
                >
                  <div className={premiumGlowClass} />
                  <div className={premiumGlowBottomClass} />
                  <div className="relative flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">
                        {t("readyPage.sections.sectionNumber", {
                          defaultValue: "Section {{number}}",
                          number: index + 1,
                        })}
                      </span>
                      <h3 className="font-semibold text-foreground">{getLocalizedSectionName(section)}</h3>
                    </div>
                  </div>
                  {helpText && (
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3">{helpText}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Required Documents Checklist */}
      <section className="py-12 md:py-16 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold mb-8">
            {t("readyPage.documents.title", { defaultValue: "Required Documents" })}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedCountry?.requiredDocuments.map((doc, index) => (
              <div
                key={index}
                className={`${premiumCardClass} p-4`}
              >
                <div className={premiumGlowClass} />
                <div className={premiumGlowBottomClass} />
                <div className="relative flex items-start gap-3">
                  <div className="w-5 h-5 border-2 border-primary/30 rounded flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground text-sm">{getLocalizedDocumentName(doc)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className={`${premiumCardClass} p-8 md:p-12`}>
            <div className={premiumGlowClass} />
            <div className={premiumGlowBottomClass} />
            <div className="relative">
            <h2 className="text-3xl font-bold mb-4">
              {t("readyPage.cta.title", { defaultValue: "Ready to Begin?" })}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              {t("readyPage.cta.subtitle", {
                defaultValue:
                  "Our guided system will walk you through each section of your {{country}} application. Your progress is automatically saved.",
                country:
                  selectedCountry?.name ||
                  t("readyPage.cta.visa", { defaultValue: "visa" }),
              })}
            </p>

            <Link
              to="/application"
              className="group inline-flex items-center gap-3 px-10 py-5 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-all text-lg"
            >
              {t("readyPage.cta.startButton", {
                defaultValue: "Start {{country}} Application",
                country:
                  selectedCountry?.name ||
                  t("readyPage.cta.visaCapitalized", { defaultValue: "Visa" }),
              })}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {t("readyPage.cta.badges.freeToStart", { defaultValue: "Free to start" })}
              </span>
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                {t("readyPage.cta.badges.noCardRequired", { defaultValue: "No credit card required" })}
              </span>
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {t("readyPage.cta.badges.autoSaveEnabled", { defaultValue: "Auto-save enabled" })}
              </span>
            </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReadyToBegin;
