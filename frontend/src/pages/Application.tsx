import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { applicationsApi, type VisaType, type Application } from '../api/applications';
import { findCountryByCode, type CountryCode } from '../config/countries';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Save,
  Send,
  User,
  Phone,
  FileText,
  Plane,
  Users,
  Briefcase,
  Shield,
  AlertCircle,
  Loader2,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import PaymentModal from '@/components/PaymentModal';
import type { Payment } from '@/api/payments';
import { SERVICE_FEE_MNT } from '@/config/pricing';
import { formatNumber } from '@/lib/money';

// Form step types
type StepStatus = 'pending' | 'current' | 'completed';

interface FormStep {
  id: number;
  name: string;
  icon: React.ReactNode;
  status: StepStatus;
}

// Form data types
interface PersonalInfo {
  surnames: string;
  givenNames: string;
  fullNameNative: string;
  sex: string;
  maritalStatus: string;
  dateOfBirth: string;
  cityOfBirth: string;
  stateOfBirth: string;
  countryOfBirth: string;
  nationality: string;
  nationalId: string;
}

interface ContactInfo {
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface PassportInfo {
  passportNumber: string;
  passportBookNumber: string;
  countryOfIssuance: string;
  cityOfIssuance: string;
  issuanceDate: string;
  expirationDate: string;
}

interface TravelInfo {
  purposeOfTrip: string;
  intendedArrivalDate: string;
  intendedLengthOfStay: string;
  usAddress: string;
  usCity: string;
  usState: string;
  payingForTrip: string;
}

interface FormData {
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  passportInfo: PassportInfo;
  travelInfo: TravelInfo;
}

const initialFormData: FormData = {
  personalInfo: {
    surnames: '',
    givenNames: '',
    fullNameNative: '',
    sex: '',
    maritalStatus: '',
    dateOfBirth: '',
    cityOfBirth: '',
    stateOfBirth: '',
    countryOfBirth: '',
    nationality: '',
    nationalId: '',
  },
  contactInfo: {
    email: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  },
  passportInfo: {
    passportNumber: '',
    passportBookNumber: '',
    countryOfIssuance: '',
    cityOfIssuance: '',
    issuanceDate: '',
    expirationDate: '',
  },
  travelInfo: {
    purposeOfTrip: '',
    intendedArrivalDate: '',
    intendedLengthOfStay: '',
    usAddress: '',
    usCity: '',
    usState: '',
    payingForTrip: '',
  },
};

export default function Application() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  // Get selected country from localStorage (set in CountrySelect page)
  const selectedCountryCode = localStorage.getItem('selectedCountry') as CountryCode || 'USA';
  const countryConfig = findCountryByCode(selectedCountryCode);

  // Map country to visa type
  const getVisaTypeForCountry = (countryCode: CountryCode): VisaType => {
    const visaTypeMap: Record<string, VisaType> = {
      'USA': 'B1_B2',
      'KOREA': 'OTHER',
      'SCHENGEN': 'OTHER',
      'CANADA': 'OTHER',
      'JAPAN': 'OTHER',
      'IRELAND': 'OTHER',
      'UK': 'OTHER',
      'AUSTRALIA': 'OTHER',
      'NEW_ZEALAND': 'OTHER',
    };
    return visaTypeMap[countryCode] || 'OTHER';
  };

  // Load existing draft application on mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        setIsLoading(true);
        const response = await applicationsApi.getAll(1, 10);
        // Find the most recent draft or in-progress application
        const drafts = response.data?.filter((app: Application) =>
          app.status === 'DRAFT' || app.status === 'IN_PROGRESS'
        ) || [];

        if (drafts.length > 0) {
          const draftMeta = drafts[0];
          setApplicationId(draftMeta.id);

          // NOTE: The list endpoint intentionally returns only metadata (no decrypted form sections).
          // Fetch the full application by ID to restore saved form data.
          const fullDraft = await applicationsApi.getById(draftMeta.id);
          setCurrentStep(fullDraft.currentStep || 1);

          const nextFormData: FormData = {
            personalInfo: fullDraft.personalInfo
              ? {
                  surnames: fullDraft.personalInfo.surnames || '',
                  givenNames: fullDraft.personalInfo.givenNames || '',
                  fullNameNative: fullDraft.personalInfo.fullNameNative || '',
                  sex: fullDraft.personalInfo.sex || '',
                  maritalStatus: fullDraft.personalInfo.maritalStatus || '',
                  dateOfBirth: fullDraft.personalInfo.dateOfBirth || '',
                  cityOfBirth: fullDraft.personalInfo.cityOfBirth || '',
                  stateOfBirth: fullDraft.personalInfo.stateOfBirth || '',
                  countryOfBirth: fullDraft.personalInfo.countryOfBirth || '',
                  nationality: fullDraft.personalInfo.nationality || '',
                  nationalId: '',
                }
              : initialFormData.personalInfo,
            contactInfo: fullDraft.contactInfo
              ? {
                  email: fullDraft.contactInfo.email || '',
                  phone: fullDraft.contactInfo.phone || '',
                  streetAddress: fullDraft.contactInfo.homeAddress?.street || '',
                  city: fullDraft.contactInfo.homeAddress?.city || '',
                  state: fullDraft.contactInfo.homeAddress?.state || '',
                  postalCode: fullDraft.contactInfo.homeAddress?.postalCode || '',
                  country: fullDraft.contactInfo.homeAddress?.country || '',
                }
              : initialFormData.contactInfo,
            passportInfo: fullDraft.passportInfo
              ? {
                  passportNumber: fullDraft.passportInfo.passportNumber || '',
                  passportBookNumber: fullDraft.passportInfo.passportBookNumber || '',
                  countryOfIssuance: fullDraft.passportInfo.countryOfIssuance || '',
                  cityOfIssuance: fullDraft.passportInfo.cityOfIssuance || '',
                  issuanceDate: fullDraft.passportInfo.issuanceDate || '',
                  expirationDate: fullDraft.passportInfo.expirationDate || '',
                }
              : initialFormData.passportInfo,
            travelInfo: fullDraft.travelInfo
              ? {
                  purposeOfTrip: fullDraft.travelInfo.purposeOfTrip || '',
                  intendedArrivalDate: fullDraft.travelInfo.intendedArrivalDate || '',
                  intendedLengthOfStay: fullDraft.travelInfo.intendedLengthOfStay || '',
                  usAddress: fullDraft.travelInfo.addressWhileInUS?.street || '',
                  usCity: fullDraft.travelInfo.addressWhileInUS?.city || '',
                  usState: fullDraft.travelInfo.addressWhileInUS?.state || '',
                  payingForTrip: fullDraft.travelInfo.payingForTrip || '',
                }
              : initialFormData.travelInfo,
          };

          setFormData(nextFormData);

          const hasAnyRestoredValue = Object.values(nextFormData).some((section) =>
            Object.values(section).some((v) => String(v || '').trim() !== ''),
          );
          if (hasAnyRestoredValue) {
            toast.info(
              t('applicationPage.toasts.draftLoaded.title', {
                defaultValue: 'Draft loaded',
              }),
              {
                description: t('applicationPage.toasts.draftLoaded.description', {
                  defaultValue: 'Your previous progress has been restored.',
                }),
              },
            );
          }
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDraft();
  }, []);

  const steps: FormStep[] = [
    { id: 1, name: t('form.steps.personal', { defaultValue: 'Personal Info' }), icon: <User className="w-5 h-5" />, status: currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'pending' },
    { id: 2, name: t('form.steps.contact', { defaultValue: 'Contact Info' }), icon: <Phone className="w-5 h-5" />, status: currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : 'pending' },
    { id: 3, name: t('form.steps.passport', { defaultValue: 'Passport' }), icon: <FileText className="w-5 h-5" />, status: currentStep === 3 ? 'current' : currentStep > 3 ? 'completed' : 'pending' },
    { id: 4, name: t('form.steps.travel', { defaultValue: 'Travel Plans' }), icon: <Plane className="w-5 h-5" />, status: currentStep === 4 ? 'current' : currentStep > 4 ? 'completed' : 'pending' },
    { id: 5, name: t('form.steps.review', { defaultValue: 'Review' }), icon: <Shield className="w-5 h-5" />, status: currentStep === 5 ? 'current' : 'pending' },
  ];

  const updateFormData = (section: keyof FormData, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.personalInfo.surnames) newErrors.surnames = t('form.validation.required', { defaultValue: 'Required' });
      if (!formData.personalInfo.givenNames) newErrors.givenNames = t('form.validation.required', { defaultValue: 'Required' });
      if (!formData.personalInfo.sex) newErrors.sex = t('form.validation.required', { defaultValue: 'Required' });
      if (!formData.personalInfo.dateOfBirth) newErrors.dateOfBirth = t('form.validation.required', { defaultValue: 'Required' });
      if (!formData.personalInfo.countryOfBirth) newErrors.countryOfBirth = t('form.validation.required', { defaultValue: 'Required' });
      if (!formData.personalInfo.nationality) newErrors.nationality = t('form.validation.required', { defaultValue: 'Required' });
    } else if (step === 2) {
      if (!formData.contactInfo.email) newErrors.email = t('form.validation.required', { defaultValue: 'Required' });
      if (!formData.contactInfo.phone) newErrors.phone = t('form.validation.required', { defaultValue: 'Required' });
      if (!formData.contactInfo.streetAddress) newErrors.streetAddress = t('form.validation.required', { defaultValue: 'Required' });
      if (!formData.contactInfo.city) newErrors.city = t('form.validation.required', { defaultValue: 'Required' });
      if (!formData.contactInfo.country) newErrors.country = t('form.validation.required', { defaultValue: 'Required' });
    } else if (step === 3) {
      if (!formData.passportInfo.passportNumber) newErrors.passportNumber = t('form.validation.required', { defaultValue: 'Required' });
      if (!formData.passportInfo.countryOfIssuance) newErrors.countryOfIssuance = t('form.validation.required', { defaultValue: 'Required' });
      if (!formData.passportInfo.issuanceDate) newErrors.issuanceDate = t('form.validation.required', { defaultValue: 'Required' });
      if (!formData.passportInfo.expirationDate) newErrors.expirationDate = t('form.validation.required', { defaultValue: 'Required' });
    } else if (step === 4) {
      if (!formData.travelInfo.purposeOfTrip) newErrors.purposeOfTrip = t('form.validation.required', { defaultValue: 'Required' });
      if (!formData.travelInfo.intendedArrivalDate) newErrors.intendedArrivalDate = t('form.validation.required', { defaultValue: 'Required' });
      if (!formData.travelInfo.usAddress) newErrors.usAddress = t('form.validation.required', { defaultValue: 'Required' });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      // Transform form data to match API schema
      const apiData = {
        currentStep,
        personalInfo: {
          surnames: formData.personalInfo.surnames || 'PENDING',
          givenNames: formData.personalInfo.givenNames || 'PENDING',
          fullNameNative: formData.personalInfo.fullNameNative || undefined,
          otherNamesUsed: false,
          telCode: '',
          sex: (formData.personalInfo.sex || 'M') as 'M' | 'F',
          maritalStatus: (formData.personalInfo.maritalStatus || 'SINGLE') as 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED',
          dateOfBirth: formData.personalInfo.dateOfBirth || '2000-01-01',
          cityOfBirth: formData.personalInfo.cityOfBirth || '',
          stateOfBirth: formData.personalInfo.stateOfBirth || undefined,
          countryOfBirth: formData.personalInfo.countryOfBirth || 'Unknown',
          nationality: formData.personalInfo.nationality || 'Unknown',
        },
        contactInfo: {
          homeAddress: {
            street: formData.contactInfo.streetAddress || 'TBD',
            city: formData.contactInfo.city || 'TBD',
            state: formData.contactInfo.state || undefined,
            postalCode: formData.contactInfo.postalCode || undefined,
            country: formData.contactInfo.country || 'TBD',
          },
          phone: formData.contactInfo.phone || '0000000000',
          email: formData.contactInfo.email || user?.email || 'pending@example.com',
        },
        passportInfo: {
          passportType: 'REGULAR' as const,
          passportNumber: formData.passportInfo.passportNumber || 'PENDING',
          passportBookNumber: formData.passportInfo.passportBookNumber || undefined,
          countryOfIssuance: formData.passportInfo.countryOfIssuance || 'Unknown',
          cityOfIssuance: formData.passportInfo.cityOfIssuance || '',
          issuanceDate: formData.passportInfo.issuanceDate || '2020-01-01',
          expirationDate: formData.passportInfo.expirationDate || '2030-01-01',
          hasOtherPassport: false,
        },
        travelInfo: {
          purposeOfTrip: formData.travelInfo.purposeOfTrip || 'TOURISM',
          intendedArrivalDate: formData.travelInfo.intendedArrivalDate || '2026-12-01',
          intendedLengthOfStay: formData.travelInfo.intendedLengthOfStay || '',
          addressWhileInUS: {
            street: formData.travelInfo.usAddress || '',
            city: formData.travelInfo.usCity || '',
            state: formData.travelInfo.usState || '',
          },
          payingForTrip: formData.travelInfo.payingForTrip || '',
          travelingWithOthers: false,
        },
      };

      if (applicationId) {
        // Update existing application
        await applicationsApi.update(applicationId, apiData);
      } else {
        // Create new application first
        const newApp = await applicationsApi.create({ visaType: getVisaTypeForCountry(selectedCountryCode) });
        setApplicationId(newApp.id);
        await applicationsApi.update(newApp.id, apiData);
      }
      toast.success(t('applicationPage.toasts.saved.title', { defaultValue: 'Application saved!' }), {
        description: t('applicationPage.toasts.saved.description', {
          defaultValue: 'Your progress has been saved. You can continue later.',
        }),
      });
    } catch (error: any) {
      console.error('Save error:', error);
      const errorMessage =
        error?.message ||
        t('applicationPage.toasts.saveFailed.description', {
          defaultValue: 'Failed to save application. Please try again.',
        });
      setSaveError(errorMessage);
      toast.error(t('applicationPage.toasts.saveFailed.title', { defaultValue: 'Save failed' }), {
        description: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Prepare application data for submission (reusable)
  const prepareApplicationData = () => {
    return {
      currentStep: 5,
      personalInfo: {
        surnames: formData.personalInfo.surnames,
        givenNames: formData.personalInfo.givenNames,
        fullNameNative: formData.personalInfo.fullNameNative || undefined,
        otherNamesUsed: false,
        telCode: '',
        sex: (formData.personalInfo.sex || 'M') as 'M' | 'F',
        maritalStatus: (formData.personalInfo.maritalStatus || 'SINGLE') as 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED',
        dateOfBirth: formData.personalInfo.dateOfBirth,
        cityOfBirth: formData.personalInfo.cityOfBirth,
        stateOfBirth: formData.personalInfo.stateOfBirth || undefined,
        countryOfBirth: formData.personalInfo.countryOfBirth,
        nationality: formData.personalInfo.nationality,
      },
      contactInfo: {
        homeAddress: {
          street: formData.contactInfo.streetAddress,
          city: formData.contactInfo.city,
          state: formData.contactInfo.state || undefined,
          postalCode: formData.contactInfo.postalCode || undefined,
          country: formData.contactInfo.country,
        },
        phone: formData.contactInfo.phone,
        email: formData.contactInfo.email,
      },
      passportInfo: {
        passportType: 'REGULAR' as const,
        passportNumber: formData.passportInfo.passportNumber,
        passportBookNumber: formData.passportInfo.passportBookNumber || undefined,
        countryOfIssuance: formData.passportInfo.countryOfIssuance,
        cityOfIssuance: formData.passportInfo.cityOfIssuance,
        issuanceDate: formData.passportInfo.issuanceDate,
        expirationDate: formData.passportInfo.expirationDate,
        hasOtherPassport: false,
      },
      travelInfo: {
        purposeOfTrip: formData.travelInfo.purposeOfTrip,
        intendedArrivalDate: formData.travelInfo.intendedArrivalDate,
        intendedLengthOfStay: formData.travelInfo.intendedLengthOfStay,
        addressWhileInUS: {
          street: formData.travelInfo.usAddress,
          city: formData.travelInfo.usCity,
          state: formData.travelInfo.usState,
        },
        payingForTrip: formData.travelInfo.payingForTrip,
        travelingWithOthers: false,
      },
    };
  };

  // Handle payment completion - this gets called when payment is successful
  const handlePaymentSuccess = async (payment: Payment) => {
    setShowPaymentModal(false);

    if (!applicationId) {
      toast.error(t('applicationPage.toasts.submitFailed.title', { defaultValue: 'Submission failed' }), {
        description: t('applicationPage.toasts.missingId', {
          defaultValue: 'Missing application ID. Please refresh and try again.',
        }),
      });
      return;
    }

    try {
      // Payment is only half of "submit". We must explicitly submit the application
      // so it becomes visible to admins as SUBMITTED and shows up in dashboard charts.
      await applicationsApi.submit(applicationId);

      setPaymentComplete(true);

      toast.success(t('applicationPage.toasts.submitted.title', { defaultValue: 'Application submitted!' }), {
        description: t('applicationPage.toasts.submitted.description', {
          defaultValue: 'Payment successful. Your application has been submitted for review.',
        }),
        duration: 5000,
      });

      // Navigate to profile after a short delay to show the success message
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error: any) {
      console.error('Submit after payment error:', error);
      toast.error(t('applicationPage.toasts.submitFailed.title', { defaultValue: 'Submission failed' }), {
        description:
          error?.message ||
          t('applicationPage.toasts.submitFailedAfterPayment', {
            defaultValue:
              'Payment succeeded but submitting the application failed. Please try again or contact support.',
          }),
      });
    }
  };

  const handleSubmit = async () => {
    // Validate all steps before submission
    for (let step = 1; step <= 4; step++) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        toast.error(t('applicationPage.toasts.incomplete.title', { defaultValue: 'Incomplete information' }), {
          description: t('applicationPage.toasts.incomplete.description', {
            defaultValue: `Please complete Step ${step} before submitting.`,
            step,
          }),
        });
        return;
      }
    }

    setIsSubmitting(true);
    setSaveError(null);

    try {
      const apiData = prepareApplicationData();
      let appId = applicationId;

      if (!appId) {
        // Create new application first
        const newApp = await applicationsApi.create({ visaType: getVisaTypeForCountry(selectedCountryCode) });
        appId = newApp.id;
        setApplicationId(appId);
      }

      // Save all form data before showing payment
      await applicationsApi.update(appId, apiData);

      // Show payment modal instead of directly submitting
      setShowPaymentModal(true);
    } catch (error: any) {
      console.error('Submit error:', error);
      const errorMessage =
        error?.message ||
        t('applicationPage.toasts.saveFailed.description', {
          defaultValue: 'Failed to save application. Please try again.',
        });
      setSaveError(errorMessage);
      toast.error(t('applicationPage.toasts.submitFailed.title', { defaultValue: 'Submission failed' }), {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              {t('form.personal.title', { defaultValue: 'Personal Information' })}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.personal.surnames', { defaultValue: 'Surnames' })} *
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.surnames}
                  onChange={(e) => updateFormData('personalInfo', 'surnames', e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent uppercase"
                  placeholder="SMITH"
                />
                {errors.surnames && <p className="mt-1 text-sm text-destructive">{errors.surnames}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.personal.givenNames', { defaultValue: 'Given Names' })} *
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.givenNames}
                  onChange={(e) => updateFormData('personalInfo', 'givenNames', e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent uppercase"
                  placeholder="JOHN MICHAEL"
                />
                {errors.givenNames && <p className="mt-1 text-sm text-destructive">{errors.givenNames}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.personal.fullNameNative', { defaultValue: 'Full Name in Native Language' })}
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.fullNameNative}
                  onChange={(e) => updateFormData('personalInfo', 'fullNameNative', e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder={t('applicationPage.placeholders.fullNameNative', { defaultValue: 'Enter in your native script' })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.personal.sex', { defaultValue: 'Sex' })} *
                </label>
                <select
                  value={formData.personalInfo.sex}
                  onChange={(e) => updateFormData('personalInfo', 'sex', e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  <option value="">{t('common.select', { defaultValue: 'Select' })}</option>
                  <option value="M">{t('form.personal.male', { defaultValue: 'Male' })}</option>
                  <option value="F">{t('form.personal.female', { defaultValue: 'Female' })}</option>
                </select>
                {errors.sex && <p className="mt-1 text-sm text-destructive">{errors.sex}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.personal.maritalStatus', { defaultValue: 'Marital Status' })} *
                </label>
                <select
                  value={formData.personalInfo.maritalStatus}
                  onChange={(e) => updateFormData('personalInfo', 'maritalStatus', e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  <option value="">{t('common.select', { defaultValue: 'Select' })}</option>
                  <option value="SINGLE">{t('form.personal.single', { defaultValue: 'Single' })}</option>
                  <option value="MARRIED">{t('form.personal.married', { defaultValue: 'Married' })}</option>
                  <option value="DIVORCED">{t('form.personal.divorced', { defaultValue: 'Divorced' })}</option>
                  <option value="WIDOWED">{t('form.personal.widowed', { defaultValue: 'Widowed' })}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.personal.dateOfBirth', { defaultValue: 'Date of Birth' })} *
                </label>
                <input
                  type="date"
                  value={formData.personalInfo.dateOfBirth}
                  onChange={(e) => updateFormData('personalInfo', 'dateOfBirth', e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                />
                {errors.dateOfBirth && <p className="mt-1 text-sm text-destructive">{errors.dateOfBirth}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.personal.cityOfBirth', { defaultValue: 'City of Birth' })} *
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.cityOfBirth}
                  onChange={(e) => updateFormData('personalInfo', 'cityOfBirth', e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="Ulaanbaatar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.personal.countryOfBirth', { defaultValue: 'Country of Birth' })} *
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.countryOfBirth}
                  onChange={(e) => updateFormData('personalInfo', 'countryOfBirth', e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="Mongolia"
                />
                {errors.countryOfBirth && <p className="mt-1 text-sm text-destructive">{errors.countryOfBirth}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.personal.nationality', { defaultValue: 'Nationality' })} *
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.nationality}
                  onChange={(e) => updateFormData('personalInfo', 'nationality', e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="Mongolian"
                />
                {errors.nationality && <p className="mt-1 text-sm text-destructive">{errors.nationality}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('applicationPage.fields.nationalId', { defaultValue: 'National ID Number' })}
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.nationalId}
                  onChange={(e) => updateFormData('personalInfo', 'nationalId', e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder={t('applicationPage.placeholders.nationalId', { defaultValue: 'ID Number' })}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              {t('form.contact.title', { defaultValue: 'Contact Information' })}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.contact.email', { defaultValue: 'Email' })} *
                </label>
                <input
                  type="email"
                  value={formData.contactInfo.email}
                  onChange={(e) => updateFormData('contactInfo', 'email', e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="email@example.com"
                />
                {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.contact.phone', { defaultValue: 'Phone' })} *
                </label>
                <input
                  type="tel"
                  value={formData.contactInfo.phone}
                  onChange={(e) => updateFormData('contactInfo', 'phone', e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="+976-9999-9999"
                />
                {errors.phone && <p className="mt-1 text-sm text-destructive">{errors.phone}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.contact.street', { defaultValue: 'Street' })} *
                </label>
                <input
                  type="text"
                  value={formData.contactInfo.streetAddress}
                  onChange={(e) => updateFormData('contactInfo', 'streetAddress', e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="123 Main Street, Apt 4B"
                />
                {errors.streetAddress && <p className="mt-1 text-sm text-destructive">{errors.streetAddress}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.contact.city', { defaultValue: 'City' })} *
                </label>
                <input
                  type="text"
                  value={formData.contactInfo.city}
                  onChange={(e) => updateFormData('contactInfo', 'city', e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="Ulaanbaatar"
                />
                {errors.city && <p className="mt-1 text-sm text-destructive">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.contact.state', { defaultValue: 'State' })}
                </label>
                <input
                  type="text"
                  value={formData.contactInfo.state}
                  onChange={(e) => updateFormData('contactInfo', 'state', e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="State/Province"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.contact.postalCode', { defaultValue: 'Postal Code' })}
                </label>
                <input
                  type="text"
                  value={formData.contactInfo.postalCode}
                  onChange={(e) => updateFormData('contactInfo', 'postalCode', e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.contact.country', { defaultValue: 'Country' })} *
                </label>
                <input
                  type="text"
                  value={formData.contactInfo.country}
                  onChange={(e) => updateFormData('contactInfo', 'country', e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="Mongolia"
                />
                {errors.country && <p className="mt-1 text-sm text-destructive">{errors.country}</p>}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              {t('form.passport.title', { defaultValue: 'Passport Information' })}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.passport.passportNumber', { defaultValue: 'Passport Number' })} *
                </label>
                <input
                  type="text"
                  value={formData.passportInfo.passportNumber}
                  onChange={(e) => updateFormData('passportInfo', 'passportNumber', e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent uppercase"
                  placeholder="E12345678"
                />
                {errors.passportNumber && <p className="mt-1 text-sm text-destructive">{errors.passportNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.passport.bookNumber', { defaultValue: 'Passport Book Number' })}
                </label>
                <input
                  type="text"
                  value={formData.passportInfo.passportBookNumber}
                  onChange={(e) => updateFormData('passportInfo', 'passportBookNumber', e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder={t('applicationPage.placeholders.passportBookNumber', { defaultValue: 'Book number (if applicable)' })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.passport.countryOfIssuance', { defaultValue: 'Country of Issuance' })} *
                </label>
                <input
                  type="text"
                  value={formData.passportInfo.countryOfIssuance}
                  onChange={(e) => updateFormData('passportInfo', 'countryOfIssuance', e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="Mongolia"
                />
                {errors.countryOfIssuance && <p className="mt-1 text-sm text-destructive">{errors.countryOfIssuance}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.passport.cityOfIssuance', { defaultValue: 'City of Issuance' })}
                </label>
                <input
                  type="text"
                  value={formData.passportInfo.cityOfIssuance}
                  onChange={(e) => updateFormData('passportInfo', 'cityOfIssuance', e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="Ulaanbaatar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.passport.issuanceDate', { defaultValue: 'Issuance Date' })} *
                </label>
                <input
                  type="date"
                  value={formData.passportInfo.issuanceDate}
                  onChange={(e) => updateFormData('passportInfo', 'issuanceDate', e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                />
                {errors.issuanceDate && <p className="mt-1 text-sm text-destructive">{errors.issuanceDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.passport.expirationDate', { defaultValue: 'Expiration Date' })} *
                </label>
                <input
                  type="date"
                  value={formData.passportInfo.expirationDate}
                  onChange={(e) => updateFormData('passportInfo', 'expirationDate', e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                />
                {errors.expirationDate && <p className="mt-1 text-sm text-destructive">{errors.expirationDate}</p>}
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('applicationPage.passport.expirationHint', {
                    defaultValue:
                      'Must be valid for at least 6 months beyond your intended stay',
                  })}
                </p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              {t('form.travel.title', { defaultValue: 'Travel Information' })}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.travel.purposeOfTrip', { defaultValue: 'Purpose of Trip' })} *
                </label>
                <select
                  value={formData.travelInfo.purposeOfTrip}
                  onChange={(e) => updateFormData('travelInfo', 'purposeOfTrip', e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  <option value="">
                    {t('applicationPage.travel.selectPurpose', { defaultValue: 'Select purpose' })}
                  </option>
                  <option value="TOURISM">
                    {t('applicationPage.travel.purposeOptions.tourism', { defaultValue: 'Tourism/Vacation' })}
                  </option>
                  <option value="BUSINESS">
                    {t('applicationPage.travel.purposeOptions.business', { defaultValue: 'Business' })}
                  </option>
                  <option value="STUDY">
                    {t('applicationPage.travel.purposeOptions.study', { defaultValue: 'Study' })}
                  </option>
                  <option value="MEDICAL">
                    {t('applicationPage.travel.purposeOptions.medical', { defaultValue: 'Medical Treatment' })}
                  </option>
                  <option value="CONFERENCE">
                    {t('applicationPage.travel.purposeOptions.conference', { defaultValue: 'Conference' })}
                  </option>
                  <option value="FAMILY">
                    {t('applicationPage.travel.purposeOptions.family', { defaultValue: 'Visit Family/Friends' })}
                  </option>
                </select>
                {errors.purposeOfTrip && <p className="mt-1 text-sm text-destructive">{errors.purposeOfTrip}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.travel.intendedArrival', { defaultValue: 'Intended Arrival Date' })} *
                </label>
                <input
                  type="date"
                  value={formData.travelInfo.intendedArrivalDate}
                  onChange={(e) => updateFormData('travelInfo', 'intendedArrivalDate', e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                />
                {errors.intendedArrivalDate && <p className="mt-1 text-sm text-destructive">{errors.intendedArrivalDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.travel.lengthOfStay', { defaultValue: 'Length of Stay' })}
                </label>
                <input
                  type="text"
                  value={formData.travelInfo.intendedLengthOfStay}
                  onChange={(e) => updateFormData('travelInfo', 'intendedLengthOfStay', e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="e.g., 2 weeks"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.travel.usAddress', { defaultValue: 'US Address' })} *
                </label>
                <input
                  type="text"
                  value={formData.travelInfo.usAddress}
                  onChange={(e) => updateFormData('travelInfo', 'usAddress', e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder={t('applicationPage.placeholders.usAddress', { defaultValue: 'Hotel or residence address in the US' })}
                />
                {errors.usAddress && <p className="mt-1 text-sm text-destructive">{errors.usAddress}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.contact.city', { defaultValue: 'City' })}
                </label>
                <input
                  type="text"
                  value={formData.travelInfo.usCity}
                  onChange={(e) => updateFormData('travelInfo', 'usCity', e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="New York"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.contact.state', { defaultValue: 'State' })}
                </label>
                <input
                  type="text"
                  value={formData.travelInfo.usState}
                  onChange={(e) => updateFormData('travelInfo', 'usState', e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="NY"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.travel.payingForTrip', { defaultValue: 'Who is paying for your trip?' })}
                </label>
                <select
                  value={formData.travelInfo.payingForTrip}
                  onChange={(e) => updateFormData('travelInfo', 'payingForTrip', e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  <option value="">
                    {t('common.select', { defaultValue: 'Select' })}
                  </option>
                  <option value="SELF">
                    {t('applicationPage.travel.payingOptions.self', { defaultValue: 'Self' })}
                  </option>
                  <option value="EMPLOYER">
                    {t('applicationPage.travel.payingOptions.employer', { defaultValue: 'Employer' })}
                  </option>
                  <option value="FAMILY">
                    {t('applicationPage.travel.payingOptions.family', { defaultValue: 'Family Member' })}
                  </option>
                  <option value="SPONSOR">
                    {t('applicationPage.travel.payingOptions.sponsor', { defaultValue: 'Sponsor' })}
                  </option>
                </select>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              {t('form.review.title', { defaultValue: 'Review & Submit' })}
            </h3>

            <div className="space-y-6">
              {/* Payment Success State */}
              {paymentComplete && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-green-700 dark:text-green-400 font-semibold text-lg">
                        {t('applicationPage.payment.successTitle', { defaultValue: 'Payment Successful!' })}
                      </h4>
                      <p className="text-sm text-green-600 dark:text-green-500">
                        {t('applicationPage.payment.successDescription', {
                          defaultValue:
                            'Your application has been submitted. Redirecting to your profile...',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Info Card */}
              {!paymentComplete && (
                <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-foreground font-semibold text-lg mb-1">
                        {t('applicationPage.payment.feeTitle', { defaultValue: 'Application Fee' })}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {t('applicationPage.payment.feeDescription', {
                          defaultValue:
                            'Complete your payment to submit your visa application',
                        })}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-primary">
                          {formatNumber(SERVICE_FEE_MNT, i18n.language)}
                        </span>
                        <span className="text-sm text-muted-foreground">MNT</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {t('applicationPage.payment.feeNote', {
                          defaultValue:
                            'Includes professional document review and processing assistance',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Personal Info Summary */}
              <div className="bg-muted/50 border border-border rounded-xl p-6">
                <h4 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {t('form.personal.title', { defaultValue: 'Personal Information' })}
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      {t('applicationPage.review.labels.name', { defaultValue: 'Name' })}:
                    </span>{' '}
                    <span className="text-foreground ml-2">
                      {formData.personalInfo.surnames} {formData.personalInfo.givenNames}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t('applicationPage.review.labels.dob', { defaultValue: 'DOB' })}:
                    </span>{' '}
                    <span className="text-foreground ml-2">{formData.personalInfo.dateOfBirth}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t('form.personal.nationality', { defaultValue: 'Nationality' })}:
                    </span>{' '}
                    <span className="text-foreground ml-2">{formData.personalInfo.nationality}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t('applicationPage.review.labels.birthPlace', { defaultValue: 'Birth Place' })}:
                    </span>{' '}
                    <span className="text-foreground ml-2">
                      {formData.personalInfo.cityOfBirth}, {formData.personalInfo.countryOfBirth}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info Summary */}
              <div className="bg-muted/50 border border-border rounded-xl p-6">
                <h4 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  {t('form.contact.title', { defaultValue: 'Contact Information' })}
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      {t('form.contact.email', { defaultValue: 'Email' })}:
                    </span>{' '}
                    <span className="text-foreground ml-2">{formData.contactInfo.email}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t('form.contact.phone', { defaultValue: 'Phone' })}:
                    </span>{' '}
                    <span className="text-foreground ml-2">{formData.contactInfo.phone}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">
                      {t('applicationPage.review.labels.address', { defaultValue: 'Address' })}:
                    </span>{' '}
                    <span className="text-foreground ml-2">
                      {formData.contactInfo.streetAddress}, {formData.contactInfo.city}, {formData.contactInfo.country}
                    </span>
                  </div>
                </div>
              </div>

              {/* Passport Summary */}
              <div className="bg-muted/50 border border-border rounded-xl p-6">
                <h4 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {t('form.passport.title', { defaultValue: 'Passport Information' })}
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      {t('applicationPage.review.labels.passportNumber', { defaultValue: 'Passport #' })}:
                    </span>{' '}
                    <span className="text-foreground ml-2">{formData.passportInfo.passportNumber}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t('form.contact.country', { defaultValue: 'Country' })}:
                    </span>{' '}
                    <span className="text-foreground ml-2">{formData.passportInfo.countryOfIssuance}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t('applicationPage.review.labels.issued', { defaultValue: 'Issued' })}:
                    </span>{' '}
                    <span className="text-foreground ml-2">{formData.passportInfo.issuanceDate}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t('applicationPage.review.labels.expires', { defaultValue: 'Expires' })}:
                    </span>{' '}
                    <span className="text-foreground ml-2">{formData.passportInfo.expirationDate}</span>
                  </div>
                </div>
              </div>

              {/* Travel Summary */}
              <div className="bg-muted/50 border border-border rounded-xl p-6">
                <h4 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                  <Plane className="w-5 h-5" />
                  {t('form.travel.title', { defaultValue: 'Travel Plans' })}
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      {t('applicationPage.review.labels.purpose', { defaultValue: 'Purpose' })}:
                    </span>{' '}
                    <span className="text-foreground ml-2">{formData.travelInfo.purposeOfTrip}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t('applicationPage.review.labels.arrival', { defaultValue: 'Arrival' })}:
                    </span>{' '}
                    <span className="text-foreground ml-2">{formData.travelInfo.intendedArrivalDate}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">
                      {t('form.travel.usAddress', { defaultValue: 'US Address' })}:
                    </span>{' '}
                    <span className="text-foreground ml-2">
                      {formData.travelInfo.usAddress}, {formData.travelInfo.usCity} {formData.travelInfo.usState}
                    </span>
                  </div>
                </div>
              </div>

              {/* Warning */}
              {!paymentComplete && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                    <div>
                      <h4 className="text-foreground font-medium mb-1">
                        {t('applicationPage.notice.title', { defaultValue: 'Important Notice' })}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {t('applicationPage.notice.description', {
                          defaultValue:
                            'Please review all information carefully before submitting. Once submitted, you may need to start a new application to make changes. Providing false information may result in visa denial.',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            {t('applicationPage.loading', { defaultValue: 'Loading your application...' })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('applicationPage.title', { defaultValue: 'DS-160 Visa Application' })}
          </h1>
          <p className="text-muted-foreground">
            {t('applicationPage.subtitle', {
              defaultValue: 'Complete your nonimmigrant visa application',
            })}
          </p>
        </div>

        {/* Error Banner */}
        {saveError && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">{saveError}</p>
            <button onClick={() => setSaveError(null)} className="ml-auto text-destructive hover:text-destructive/80">×</button>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                  step.status === 'completed'
                    ? 'bg-primary border-primary text-primary-foreground'
                    : step.status === 'current'
                    ? 'bg-primary/20 border-primary text-foreground'
                    : 'bg-muted border-border text-muted-foreground'
                }`}>
                  {step.status === 'completed' ? <Check className="w-6 h-6" /> : step.icon}
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden md:block w-24 h-1 mx-2 rounded ${
                    step.status === 'completed' ? 'bg-primary' : 'bg-border'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <span key={step.id} className={`text-xs font-medium ${
                step.status === 'current' ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {step.name}
              </span>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-card border border-border rounded-2xl p-8">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              {t('common.previous', { defaultValue: 'Previous' })}
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 text-primary hover:bg-primary/10 rounded-lg transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {t('form.actions.saveDraft', { defaultValue: 'Save Draft' })}
              </button>

              {currentStep < 5 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all"
                >
                  {t('common.next', { defaultValue: 'Next' })}
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || paymentComplete}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('applicationPage.buttons.processing', { defaultValue: 'Processing...' })}
                    </>
                  ) : paymentComplete ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      {t('applicationPage.buttons.submitted', { defaultValue: 'Submitted' })}
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      {t('applicationPage.buttons.paySubmit', { defaultValue: 'Pay & Submit' })}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {applicationId && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          applicationId={applicationId}
          serviceType="VISA_APPLICATION"
          amount={SERVICE_FEE_MNT}
          description={`${t('applicationPage.title', { defaultValue: 'DS-160 Visa Application' })} - ${formData.personalInfo.surnames} ${formData.personalInfo.givenNames}`}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
