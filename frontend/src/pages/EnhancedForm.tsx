import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useTranslation } from "react-i18next";

const EnhancedForm = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    message: "",
    serviceType: "visa",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [charCount, setCharCount] = useState(0);

  const serviceTypes = [
    { 
      value: "visa", 
      label: t("inquiryPage.services.visa.label", { defaultValue: "Visa Application" }), 
      icon: "🛂", 
      description: t("inquiryPage.services.visa.description", { defaultValue: "Tourist, business, or student visas" }),
      pricing: t("inquiryPage.services.visa.pricing", { defaultValue: "From $299" }),
      features: [
        t("inquiryPage.services.visa.features.expertConsultation", { defaultValue: "Expert consultation" }),
        t("inquiryPage.services.visa.features.documentPreparation", { defaultValue: "Document preparation" }),
        t("inquiryPage.services.visa.features.fastProcessing", { defaultValue: "Fast processing" }),
      ]
    },
    { 
      value: "tourism", 
      label: t("inquiryPage.services.tourism.label", { defaultValue: "Tourism Package" }), 
      icon: "✈️", 
      description: t("inquiryPage.services.tourism.description", { defaultValue: "Custom travel packages and tours" }),
      pricing: t("inquiryPage.services.tourism.pricing", { defaultValue: "From $599" }), 
      features: [
        t("inquiryPage.services.tourism.features.flightBooking", { defaultValue: "Flight booking" }),
        t("inquiryPage.services.tourism.features.hotelAccommodation", { defaultValue: "Hotel accommodation" }),
        t("inquiryPage.services.tourism.features.tourGuide", { defaultValue: "Tour guide" }),
        t("inquiryPage.services.tourism.features.travelInsurance", { defaultValue: "Travel insurance" }),
      ]
    },
    { 
      value: "consultation", 
      label: t("inquiryPage.services.consultation.label", { defaultValue: "Consultation" }), 
      icon: "💼", 
      description: t("inquiryPage.services.consultation.description", { defaultValue: "Expert travel advice and planning" }),
      pricing: t("inquiryPage.services.consultation.pricing", { defaultValue: "From $99" }),
      features: [
        t("inquiryPage.services.consultation.features.personalizedPlanning", { defaultValue: "Personalized planning" }),
        t("inquiryPage.services.consultation.features.budgetOptimization", { defaultValue: "Budget optimization" }),
        t("inquiryPage.services.consultation.features.support24x7", { defaultValue: "24/7 support" }),
        t("inquiryPage.services.consultation.features.itineraryCreation", { defaultValue: "Itinerary creation" }),
      ]
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === "message") {
      setCharCount(value.length);
    }
    
    // Clear error when user starts typing
    if (submitStatus === "error") {
      setSubmitStatus("idle");
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      setSubmitStatus("error");
      setErrorMessage(
        t("inquiryPage.validation.requiredFields", {
          defaultValue: "Please fill in all required fields",
        }),
      );
      return;
    }

    if (!formData.email.includes("@")) {
      setSubmitStatus("error");
      setErrorMessage(
        t("inquiryPage.validation.invalidEmail", {
          defaultValue: "Please enter a valid email address",
        }),
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const response = await api.post("/api/inquiry", formData);

      if (response.data.success) {
        setSubmitStatus("success");
        // Reset form but keep user data
        setFormData({
          name: user?.name || "",
          email: user?.email || "",
          phone: "",
          message: "",
          serviceType: "visa",
        });
        setCharCount(0);
      } else {
        throw new Error(
          response.data.error ||
            t("inquiryPage.validation.submitFailed", {
              defaultValue: "Failed to submit application",
            }),
        );
      }
    } catch (error: any) {
      setSubmitStatus("error");
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl opacity-10"></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-primary mb-4">
              {t("inquiryPage.title", { defaultValue: "Travel Application" })}
            </h1>
            <p className="text-lg text-secondary mb-8 max-w-2xl mx-auto">
              {t("inquiryPage.subtitle", {
                defaultValue:
                  "Complete the form below to begin your journey with confidence and ease",
              })}
            </p>
          </div>

          {/* Service Selection */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-primary mb-6">
              {t("inquiryPage.serviceType.title", { defaultValue: "Select Service Type" })}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {serviceTypes.map((service) => (
                <label
                  key={service.value}
                  className={`
                    prettify-card cursor-pointer
                    ${formData.serviceType === service.value 
                      ? 'border-gradient' 
                      : 'hover:border-gradient'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="serviceType"
                    value={service.value}
                    checked={formData.serviceType === service.value}
                    onChange={() => setFormData(prev => ({ ...prev, serviceType: service.value }))}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-3xl mb-4">{service.icon}</div>
                    <div className="font-semibold text-primary text-lg mb-2">{service.label}</div>
                    <div className="text-secondary text-sm mb-4">{service.description}</div>
                    <div className="text-accent-cyan font-semibold">{service.pricing}</div>
                    <div className="mt-4 space-y-1">
                      {service.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm text-secondary">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="prettify-card mb-8">
            <div className="prettify-header">
              <div className="prettify-deck">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              </div>
              <h2 className="prettify-title">
                {t("inquiryPage.form.title", { defaultValue: "Application Details" })}
              </h2>
              <p className="prettify-subtitle">
                {t("inquiryPage.form.subtitle", { defaultValue: "Please provide accurate information" })}
              </p>
            </div>

            {submitStatus === "success" && (
              <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-xl flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                    {t("inquiryPage.alerts.success.title", { defaultValue: "Application Submitted!" })}
                  </h3>
                  <p className="text-green-700 dark:text-green-300">
                    {t("inquiryPage.alerts.success.description", {
                      defaultValue:
                        "Your application has been successfully submitted. We'll contact you within 24 hours.",
                    })}
                  </p>
                </div>
              </div>
            )}

            {submitStatus === "error" && (
              <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-xl flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                    {t("inquiryPage.alerts.error.title", { defaultValue: "Submission Failed" })}
                  </h3>
                  <p className="text-red-700 dark:text-red-300">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    {t("auth.fullName", { defaultValue: "Full Name" })} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!!user?.name}
                    className="prettify-input"
                    placeholder={t("inquiryPage.fields.fullNamePlaceholder", { defaultValue: "Enter your full name" })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    {t("auth.emailAddress", { defaultValue: "Email address" })} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!!user?.email}
                    className="prettify-input"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  {t("form.contact.phone", { defaultValue: "Phone Number" })} *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="prettify-input"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  {t("inquiryPage.fields.messageLabel", {
                    defaultValue: "Message / Additional Details",
                  })}{" "}
                  *
                  <span className="text-muted ml-2">({charCount}/500)</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  className="prettify-input resize-none"
                  placeholder={t("inquiryPage.fields.messagePlaceholder", {
                    defaultValue:
                      "Please describe your requirements, travel dates, destination, and any specific needs...",
                  })}
                />
              </div>

              <div className="flex items-center justify-center pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || submitStatus === "success"}
                  className={`
                    prettify-button primary
                    ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                    ${submitStatus === "success" ? 'bg-green-600 border-green-600 hover:bg-green-700' : ''}
                  `}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-white rounded-full animate-spin"></div>
                      <span>{t("common.processing", { defaultValue: "Processing..." })}</span>
                    </div>
                  ) : submitStatus === "success" ? (
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{t("inquiryPage.buttons.submitted", { defaultValue: "Application Submitted" })}</span>
                    </div>
                  ) : (
                    t("inquiryPage.buttons.submit", { defaultValue: "Submit Application" })
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <div className="prettify-kpi">
              <div className="stat-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span className="stat-value">{t("inquiryPage.quickLinks.needHelp", { defaultValue: "Need Help?" })}</span>
              </div>
              <div className="stat-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span className="stat-value">{t("inquiryPage.quickLinks.contactSupport", { defaultValue: "Contact Support" })}</span>
              </div>
              <div className="stat-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <span className="stat-value">{t("dashboard.documents", { defaultValue: "Documents" })}</span>
              </div>
            </div>
            <Link 
              to="/dashboard" 
              className="prettify-button cyan mt-6"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2h-4m4 11h6m-6 0h6"></path>
              </svg>
              {t("inquiryPage.quickLinks.viewDashboard", { defaultValue: "View Dashboard" })}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedForm;
