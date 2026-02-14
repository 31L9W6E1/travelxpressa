import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import {
  countryConfigs,
  getAvailableCountries,
  type CountryCode,
} from "@/config/countries";
import {
  calculateExpressServiceFee,
  calculateServiceFee,
} from "@/config/pricing";
import { convertCurrency, FX_LAST_UPDATED_ISO, isFxCurrencySupported } from "@/config/fx";
import { formatCurrencyCodeAmount, getCurrencyForLanguage } from "@/lib/money";
import PageHeader from "@/components/PageHeader";
import SiteFooter from "@/components/SiteFooter";

const LearnMore = () => {
  const { t, i18n } = useTranslation();
  const [selectedCountryCode, setSelectedCountryCode] =
    useState<CountryCode | null>(null);
  const [hoveredCountryCode, setHoveredCountryCode] =
    useState<CountryCode | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("selectedCountry");
    if (stored === "KOREA") {
      localStorage.removeItem("selectedCountry");
      return;
    }
    if (stored && Object.prototype.hasOwnProperty.call(countryConfigs, stored)) {
      setSelectedCountryCode(stored as CountryCode);
    }
  }, []);

  const destinations = useMemo(() => getAvailableCountries(), []);
  const displayCurrency = getCurrencyForLanguage(i18n.language);

  const toDisplayCurrency = (amount: number, fromCurrency: string): string => {
    const rounded = Math.round(amount);
    if (!isFxCurrencySupported(fromCurrency) || !isFxCurrencySupported(displayCurrency)) {
      return formatCurrencyCodeAmount(fromCurrency, rounded, i18n.language);
    }
    const converted = convertCurrency(rounded, fromCurrency, displayCurrency);
    return formatCurrencyCodeAmount(displayCurrency, Math.round(converted), i18n.language);
  };

  const activeCountryCode = hoveredCountryCode || selectedCountryCode;

  const selectedDestination = useMemo(() => {
    if (activeCountryCode) {
      const cfg = countryConfigs[activeCountryCode];
      if (cfg && cfg.code !== "KOREA") return cfg;
    }
    return destinations[0] ?? null;
  }, [activeCountryCode, destinations]);

  const selectedGovernmentFeeLabel = selectedDestination
    ? toDisplayCurrency(
        selectedDestination.paymentPricing.baseFee,
        selectedDestination.paymentPricing.currency,
      )
    : "";
  const selectedServiceFeeLabel = selectedDestination
    ? toDisplayCurrency(
        calculateServiceFee(selectedDestination.paymentPricing.baseFee),
        selectedDestination.paymentPricing.currency,
      )
    : "";
  const selectedExpressServiceFeeLabel = selectedDestination
    ? toDisplayCurrency(
        calculateExpressServiceFee(
          calculateServiceFee(selectedDestination.paymentPricing.baseFee),
        ),
        selectedDestination.paymentPricing.currency,
      )
    : "";
  const selectedTotalLabel = selectedDestination
    ? toDisplayCurrency(
        selectedDestination.paymentPricing.baseFee +
          calculateServiceFee(selectedDestination.paymentPricing.baseFee),
        selectedDestination.paymentPricing.currency,
      )
    : "";
  const selectedExpressTotalLabel = selectedDestination
    ? toDisplayCurrency(
        selectedDestination.paymentPricing.baseFee +
          calculateExpressServiceFee(
            calculateServiceFee(selectedDestination.paymentPricing.baseFee),
          ),
        selectedDestination.paymentPricing.currency,
      )
    : "";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader
        title={
          <>
            {t("learnMorePage.hero.titleLine1", { defaultValue: "Visa Fees &" })}
            <span className="block text-muted-foreground">
              {t("learnMorePage.hero.titleLine2", { defaultValue: "Requirements" })}
            </span>
          </>
        }
        subtitle={t("learnMorePage.hero.subtitle", {
          defaultValue:
            "Compare government fees, interview requirements, and processing timelines for major destinations. We focus on practical pre-check guidance before payment, then provide case-level document support after onboarding.",
        })}
      >
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/select-country" className="inline-flex items-center gap-2">
              {t("learnMorePage.hero.cta", { defaultValue: "Choose Destination" })}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/application">
              {t("learnMorePage.hero.secondaryCta", {
                defaultValue: "Continue Application",
              })}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/translation-service">
              {t("learnMorePage.hero.translationCta", {
                defaultValue: "Translation Service",
              })}
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* Fees & Requirements */}
      <section className="py-12 md:py-20 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-secondary rounded-lg">
                  <Globe className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">
                  {t("learnMorePage.sections.fees.title", {
                    defaultValue: "Fees by Destination",
                  })}
                </h2>
              </div>
              <p className="text-muted-foreground max-w-2xl">
                {t("learnMorePage.sections.fees.subtitle", {
                  defaultValue:
                    "Government fees vary by visa type and can change. Use this as a quick reference and confirm on official embassy/consulate websites.",
                })}
              </p>

              {selectedCountryCode && (
                <p className="text-sm text-muted-foreground mt-3">
                  {t("learnMorePage.sections.fees.selectedDestination", {
                    defaultValue: "Selected destination: {{country}}",
                    country:
                      countryConfigs[selectedCountryCode]?.name ||
                      selectedCountryCode,
                  })}
                </p>
              )}
            </div>

            <Card className="bg-secondary/50">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/15 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("learnMorePage.sections.fees.serviceFeeLabel", {
                      defaultValue: "Service fee (standard)",
                    })}
                  </p>
                  <p className="text-2xl font-bold">
                    {selectedServiceFeeLabel || t("common.na", { defaultValue: "N/A" })}
                  </p>
                  {selectedDestination && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("learnMorePage.sections.fees.currentDestination", {
                        defaultValue: "For {{country}}",
                        country: selectedDestination.name,
                      })}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("learnMorePage.sections.fees.serviceFeeNote", {
                      defaultValue:
                        "Includes guided form support, checklist review, and case communication.",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-secondary/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      {t("learnMorePage.sections.fees.table.destination", {
                        defaultValue: "Destination",
                      })}
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      {t("learnMorePage.sections.fees.table.governmentFee", {
                        defaultValue: "Typical government fee",
                      })}
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      {t("learnMorePage.sections.fees.table.serviceFee", {
                        defaultValue: "Service fee",
                      })}
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      {t("learnMorePage.sections.fees.table.processing", {
                        defaultValue: "Processing time",
                      })}
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      {t("learnMorePage.sections.fees.table.interview", {
                        defaultValue: "Interview",
                      })}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {destinations.map((dest) => {
                    const isSelected = dest.code === selectedCountryCode;
                    const governmentFee = toDisplayCurrency(
                      dest.paymentPricing.baseFee,
                      dest.paymentPricing.currency,
                    );
                    const serviceFee = toDisplayCurrency(
                      calculateServiceFee(dest.paymentPricing.baseFee),
                      dest.paymentPricing.currency,
                    );
                    return (
                      <tr
                        key={dest.code}
                        onMouseEnter={() => setHoveredCountryCode(dest.code as CountryCode)}
                        onMouseLeave={() => setHoveredCountryCode(null)}
                        onClick={() => {
                          setSelectedCountryCode(dest.code as CountryCode);
                          localStorage.setItem("selectedCountry", dest.code);
                        }}
                        className={`cursor-pointer border-b border-border/50 ${
                          isSelected ? "bg-primary/10" : "hover:bg-primary/5"
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{dest.flag}</span>
                            <span className={isSelected ? "font-semibold" : ""}>
                              {dest.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-sm">{governmentFee}</td>
                        <td className="p-4 font-mono text-sm">{serviceFee}</td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {dest.processingTimeline}
                        </td>
                        <td className="p-4 text-sm">
                          {dest.interviewRequired
                            ? t("learnMorePage.sections.fees.interviewYes", {
                                defaultValue: "Usually yes",
                              })
                            : t("learnMorePage.sections.fees.interviewNo", {
                                defaultValue: "Usually no",
                              })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <p className="text-xs text-muted-foreground mt-4">
            {t("learnMorePage.sections.fees.disclaimer", {
              defaultValue:
                "We are not affiliated with any government agency. Fees and timelines may change. Converted amounts are estimates (FX updated: {{date}}).",
              date: FX_LAST_UPDATED_ISO,
            })}
          </p>

          {selectedDestination && (
            <div className="mt-10 grid md:grid-cols-2 gap-6">
              <Card className="bg-secondary/50">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold">
                    {t("learnMorePage.sections.fees.breakdown.title", {
                      defaultValue: "Detailed fee breakdown",
                    })}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("learnMorePage.sections.fees.breakdown.subtitle", {
                      defaultValue:
                        "Displayed in {{currency}} based on your selected language.",
                      currency: displayCurrency,
                    })}
                  </p>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">
                        {t("learnMorePage.sections.fees.breakdown.governmentFee", {
                          defaultValue: "Government fee",
                        })}
                      </span>
                      <span className="font-mono">{selectedGovernmentFeeLabel}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">
                        {t("learnMorePage.sections.fees.breakdown.serviceFee", {
                          defaultValue: "Service fee (standard)",
                        })}
                      </span>
                      <span className="font-mono">{selectedServiceFeeLabel}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">
                        {t("learnMorePage.sections.fees.breakdown.expressServiceFee", {
                          defaultValue: "Service fee (express, +15%)",
                        })}
                      </span>
                      <span className="font-mono">{selectedExpressServiceFeeLabel}</span>
                    </div>

                    <div className="border-t border-border pt-3 mt-3 space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-medium">
                          {t("learnMorePage.sections.fees.breakdown.totalStandard", {
                            defaultValue: "Total (standard)",
                          })}
                        </span>
                        <span className="font-mono font-semibold">
                          {selectedTotalLabel}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-medium">
                          {t("learnMorePage.sections.fees.breakdown.totalExpress", {
                            defaultValue: "Total (express)",
                          })}
                        </span>
                        <span className="font-mono font-semibold">
                          {selectedExpressTotalLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-secondary/50">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold">
                    {t("learnMorePage.sections.fees.notes.title", {
                      defaultValue: "Notes",
                    })}
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc pl-5">
                    <li>
                      {t("learnMorePage.sections.fees.notes.item1", {
                        defaultValue:
                          "Government fees are set by authorities and can change without notice.",
                      })}
                    </li>
                    <li>
                      {t("learnMorePage.sections.fees.notes.item2", {
                        defaultValue:
                          "Converted amounts are estimates for comparison only.",
                      })}
                    </li>
                    <li>
                      {t("learnMorePage.sections.fees.notes.item3", {
                        defaultValue:
                          "Express support depends on document readiness and appointment availability.",
                      })}
                    </li>
                    <li>
                      {t("learnMorePage.sections.fees.notes.item4", {
                        defaultValue:
                          "Translation requests are handled as a separate service with per-page pricing.",
                      })}
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-12 md:py-20 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">
            {t("learnMorePage.tips.title", {
              defaultValue: "Tips to Improve Your Approval Chances",
            })}
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: t("learnMorePage.tips.items.documentation.title", {
                  defaultValue: "Complete Documentation",
                }),
                description: t(
                  "learnMorePage.tips.items.documentation.description",
                  {
                    defaultValue:
                      "Ensure all required documents are accurate, up-to-date, and properly organized before your appointment.",
                  },
                ),
              },
              {
                title: t("learnMorePage.tips.items.ties.title", {
                  defaultValue: "Strong Ties to Home",
                }),
                description: t("learnMorePage.tips.items.ties.description", {
                  defaultValue:
                    "Demonstrate reasons you will return home: work, family, study, property, or ongoing commitments.",
                }),
              },
              {
                title: t("learnMorePage.tips.items.purpose.title", {
                  defaultValue: "Clear Travel Purpose",
                }),
                description: t("learnMorePage.tips.items.purpose.description", {
                  defaultValue:
                    "Be specific about your purpose, itinerary, accommodation, and funding, and bring supporting proof.",
                }),
              },
              {
                title: t("learnMorePage.tips.items.finances.title", {
                  defaultValue: "Financial Stability",
                }),
                description: t("learnMorePage.tips.items.finances.description", {
                  defaultValue:
                    "Show sufficient funds and stable income to cover your trip and avoid inconsistencies in statements.",
                }),
              },
              {
                title: t("learnMorePage.tips.items.honesty.title", {
                  defaultValue: "Honest Answers",
                }),
                description: t("learnMorePage.tips.items.honesty.description", {
                  defaultValue:
                    "Always provide truthful information. Mismatches across forms and documents are a common reason for refusal.",
                }),
              },
              {
                title: t("learnMorePage.tips.items.appearance.title", {
                  defaultValue: "Professional Preparation",
                }),
                description: t(
                  "learnMorePage.tips.items.appearance.description",
                  {
                    defaultValue:
                      "Prepare a short explanation of your trip, review your documents, and arrive early for biometrics/interview.",
                  },
                ),
              },
            ].map((tip, index) => (
              <Card
                key={index}
                className="bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <CardContent className="p-6">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold mb-4">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{tip.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {tip.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Card className="bg-secondary">
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl font-bold mb-4">
                {t("learnMorePage.cta.title", { defaultValue: "Ready to Apply?" })}
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t("learnMorePage.cta.subtitle", {
                  defaultValue:
                    "Choose your destination and start a guided application with clear steps and checklists.",
                })}
              </p>
              <Button asChild size="lg">
                <Link to="/select-country" className="inline-flex items-center gap-2">
                  {t("learnMorePage.cta.primary", {
                    defaultValue: "Start Your Application",
                  })}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <SiteFooter
        links={[
          { to: "/about", label: t("footer.links.about", { defaultValue: "About Us" }) },
          { to: "/learn-more", label: t("nav.learnMore", { defaultValue: "Learn More" }) },
          { to: "/privacy", label: t("footer.links.privacy", { defaultValue: "Privacy Policy" }) },
          { to: "/terms", label: t("footer.links.terms", { defaultValue: "Terms of Service" }) },
        ]}
      />
    </div>
  );
};

export default LearnMore;
