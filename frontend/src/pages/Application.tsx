import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { applicationsApi, type VisaType, type Application } from '../api/applications';
import { findCountryByCode, countryConfigs, type CountryCode } from '../config/countries';
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
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import PaymentModal from '@/components/PaymentModal';
import type { Payment } from '@/api/payments';
import { convertCurrency, isFxCurrencySupported } from '@/config/fx';
import {
  calculateExpressServiceFee,
  calculateServiceFee,
  FALLBACK_SERVICE_FEE_MNT,
} from '@/config/pricing';
import { formatNumber } from '@/lib/money';

// Form step types
type StepStatus = 'pending' | 'current' | 'completed';
type ServiceSpeed = 'STANDARD' | 'EXPRESS';
type SecurityAnswer = 'YES' | 'NO' | '';

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
  noAddressYet: boolean;
  payingForTrip: string;
  hasInviter: boolean;
  inviterName: string;
  inviterRelationship: string;
  inviterAddress: string;
  inviterPhone: string;
  needFlightItinerary: boolean;
  needHotelReservation: boolean;
  needTravelItinerary: boolean;
  serviceSpeed: ServiceSpeed;
}

interface FamilyInfo {
  fatherSurnames: string;
  fatherGivenNames: string;
  fatherDateOfBirth: string;
  motherSurnames: string;
  motherGivenNames: string;
  motherDateOfBirth: string;
  hasSpouse: boolean;
  spouseFullName: string;
  spouseDateOfBirth: string;
  hasChildren: boolean;
  numberOfChildren: string;
  children: Array<{
    fullName: string;
    dateOfBirth: string;
  }>;
}

interface WorkEducationInfo {
  primaryOccupation: string;
  employerOrSchoolName: string;
  monthlySalary: string;
  jobDuties: string;
}

interface FormData {
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  passportInfo: PassportInfo;
  travelInfo: TravelInfo;
  familyInfo: FamilyInfo;
  workEducation: WorkEducationInfo;
  securityCheck: {
    hasBeenArrested: SecurityAnswer;
    arrestDetails: string;
  };
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
    noAddressYet: false,
    payingForTrip: '',
    hasInviter: false,
    inviterName: '',
    inviterRelationship: '',
    inviterAddress: '',
    inviterPhone: '',
    needFlightItinerary: false,
    needHotelReservation: false,
    needTravelItinerary: false,
    serviceSpeed: 'STANDARD',
  },
  familyInfo: {
    fatherSurnames: '',
    fatherGivenNames: '',
    fatherDateOfBirth: '',
    motherSurnames: '',
    motherGivenNames: '',
    motherDateOfBirth: '',
    hasSpouse: false,
    spouseFullName: '',
    spouseDateOfBirth: '',
    hasChildren: false,
    numberOfChildren: '',
    children: [],
  },
  workEducation: {
    primaryOccupation: '',
    employerOrSchoolName: '',
    monthlySalary: '',
    jobDuties: '',
  },
  securityCheck: {
    hasBeenArrested: '',
    arrestDetails: '',
  },
};

const LOCAL_DRAFT_SNAPSHOT_KEY = 'applicationDraftSnapshot';

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
  const [isRestoringDraft, setIsRestoringDraft] = useState(false);
  const PAYMENT_REQUIRED = false;

  // Get selected country from localStorage (set in CountrySelect page)
  // Note: Korea is currently not offered, so fall back to USA if it was previously selected.
  const storedCountryCode = localStorage.getItem('selectedCountry') as CountryCode | null;
  const selectedCountryCode: CountryCode =
    storedCountryCode && storedCountryCode !== 'KOREA' ? storedCountryCode : 'USA';
  const countryConfig = findCountryByCode(selectedCountryCode);

  useEffect(() => {
    if (!storedCountryCode || storedCountryCode === 'KOREA') {
      navigate('/select-country', { replace: true });
    }
  }, [navigate, storedCountryCode]);

  const serviceFeeAmountMnt = (() => {
    const baseFee = countryConfig?.paymentPricing?.baseFee;
    const currency = countryConfig?.paymentPricing?.currency;
    if (!baseFee || !currency) return FALLBACK_SERVICE_FEE_MNT;

    const standardServiceFee = calculateServiceFee(baseFee);
    if (!standardServiceFee) return FALLBACK_SERVICE_FEE_MNT;
    const serviceFeeInCurrency =
      formData.travelInfo.serviceSpeed === 'EXPRESS'
        ? calculateExpressServiceFee(standardServiceFee)
        : standardServiceFee;

    if (!isFxCurrencySupported(currency) || !isFxCurrencySupported("MNT")) {
      return FALLBACK_SERVICE_FEE_MNT;
    }

    const mnt = convertCurrency(serviceFeeInCurrency, currency, "MNT");
    const rounded = Math.round(mnt);
    return rounded > 0 ? rounded : FALLBACK_SERVICE_FEE_MNT;
  })();

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

  const applyRestoredFormData = useCallback(
    (restored: FormData, restoredAppId?: string | null, restoredStep?: number) => {
      if (restoredAppId) {
        setApplicationId(restoredAppId);
      }
      if (restoredStep) {
        setCurrentStep(Math.min(restoredStep, 7));
      }
      setFormData({
        ...initialFormData,
        ...restored,
        travelInfo: {
          ...initialFormData.travelInfo,
          ...restored.travelInfo,
          serviceSpeed:
            restored.travelInfo?.serviceSpeed === 'EXPRESS' ? 'EXPRESS' : 'STANDARD',
        },
        familyInfo: {
          ...initialFormData.familyInfo,
          ...restored.familyInfo,
          children: restored.familyInfo?.children || [],
        },
        securityCheck: {
          ...initialFormData.securityCheck,
          ...restored.securityCheck,
          hasBeenArrested:
            restored.securityCheck?.hasBeenArrested === 'YES' ||
            restored.securityCheck?.hasBeenArrested === 'NO'
              ? restored.securityCheck.hasBeenArrested
              : '',
        },
      });
    },
    [],
  );

  const restoreFromLocalSnapshot = useCallback(() => {
    try {
      const raw = localStorage.getItem(LOCAL_DRAFT_SNAPSHOT_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw) as {
        applicationId?: string | null;
        currentStep?: number;
        selectedCountryCode?: CountryCode;
        formData?: FormData;
      };
      if (!parsed.formData) return false;
      if (
        parsed.selectedCountryCode &&
        parsed.selectedCountryCode !== selectedCountryCode
      ) {
        return false;
      }
      applyRestoredFormData(parsed.formData, parsed.applicationId, parsed.currentStep);
      toast.info(
        t('applicationPage.toasts.draftLoaded.title', {
          defaultValue: 'Draft loaded',
        }),
        {
          description: t('applicationPage.toasts.localDraftLoaded.description', {
            defaultValue: 'Restored your latest locally saved draft.',
          }),
        },
      );
      return true;
    } catch {
      return false;
    }
  }, [applyRestoredFormData, selectedCountryCode, t]);

  const saveLocalSnapshot = useCallback(
    (nextApplicationId: string | null, nextStep: number, nextFormData: FormData) => {
      try {
        localStorage.setItem(
          LOCAL_DRAFT_SNAPSHOT_KEY,
          JSON.stringify({
            applicationId: nextApplicationId,
            currentStep: nextStep,
            selectedCountryCode,
            formData: nextFormData,
            updatedAt: new Date().toISOString(),
          }),
        );
      } catch {
        // Ignore localStorage quota errors.
      }
    },
    [selectedCountryCode],
  );

  const buildSecurityInfoPayload = useCallback(() => {
    const hasBeenArrested = formData.securityCheck.hasBeenArrested === 'YES';
    return {
      hasCommunicableDisease: false,
      hasMentalOrPhysicalDisorder: false,
      isDrugAbuser: false,
      hasBeenArrested,
      arrestDetails: hasBeenArrested ? formData.securityCheck.arrestDetails || undefined : undefined,
      hasViolatedControlledSubstancesLaw: false,
      isEngagedInProstitution: false,
      isInvolvedInMoneyLaundering: false,
      hasCommittedHumanTrafficking: false,
      hasBenefitedFromTrafficking: false,
      hasAidedHumanTrafficking: false,
      seeksEspionage: false,
      seeksToEngageInTerrorism: false,
      hasProvidedTerroristSupport: false,
      isTerroristOrganizationMember: false,
      isRelatedToTerrorist: false,
      hasParticipatedInGenocide: false,
      hasParticipatedInTorture: false,
      hasParticipatedInExtrajudicialKillings: false,
      hasRecruitedChildSoldiers: false,
      hasViolatedReligiousFreedom: false,
      hasEnforcedPopulationControls: false,
      hasInvolvedInOrganTrafficking: false,
      hasSoughtVisaByFraud: false,
      hasBeenRemovedOrDeported: false,
      hasWithheldCustodyOfUSCitizen: false,
      hasVotedInUSIllegally: false,
      hasRenouncedUSCitizenshipToAvoidTax: false,
      hasBeenInUS: false,
      hasBeenIssuedUSVisa: false,
      hasBeenRefusedUSVisa: false,
      hasImmigrantPetitionFiled: false,
    };
  }, [formData.securityCheck.arrestDetails, formData.securityCheck.hasBeenArrested]);

  const restoreLatestDraft = useCallback(
    async (options?: { initial?: boolean; notifyIfMissing?: boolean }) => {
      const initial = options?.initial ?? false;
      const notifyIfMissing = options?.notifyIfMissing ?? false;

      try {
        if (initial) {
          setIsLoading(true);
        } else {
          setIsRestoringDraft(true);
        }

        const response = await applicationsApi.getAll(1, 100);
        const drafts =
          response.data?.filter(
            (app: Application) => app.status === 'DRAFT' || app.status === 'IN_PROGRESS',
          ) || [];

        if (drafts.length === 0) {
          const restoredLocally = restoreFromLocalSnapshot();
          if (restoredLocally) {
            return;
          }
          if (notifyIfMissing) {
            toast.info(
              t('applicationPage.toasts.noDraft.title', { defaultValue: 'No saved draft found' }),
              {
                description: t('applicationPage.toasts.noDraft.description', {
                  defaultValue: 'Create a draft first by saving your progress.',
                }),
              },
            );
          }
          return;
        }

        const latestDrafts = [...drafts].sort((a, b) => {
          const aTime = new Date(a.updatedAt || a.createdAt).getTime();
          const bTime = new Date(b.updatedAt || b.createdAt).getTime();
          return bTime - aTime;
        });

        const preferredDraft =
          latestDrafts.find((app) => app.visaType === getVisaTypeForCountry(selectedCountryCode)) ||
          latestDrafts[0];

        const draftMeta = preferredDraft;
        setApplicationId(draftMeta.id);

        // NOTE: The list endpoint intentionally returns only metadata (no decrypted form sections).
        // Fetch the full application by ID to restore saved form data.
        const fullDraft = await applicationsApi.getById(draftMeta.id);
        setCurrentStep(Math.min(fullDraft.currentStep || 1, 7));

        const restoredDestination = (fullDraft.travelInfo as any)?.destinationCountry as CountryCode | undefined;
        if (
          restoredDestination &&
          restoredDestination !== 'KOREA' &&
          Object.prototype.hasOwnProperty.call(countryConfigs, restoredDestination)
        ) {
          localStorage.setItem('selectedCountry', restoredDestination);
        }

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
                noAddressYet: Boolean((fullDraft.travelInfo as any).noUSAddressYet),
                payingForTrip: fullDraft.travelInfo.payingForTrip || '',
                hasInviter: Boolean((fullDraft.travelInfo as any).hasInviter),
                inviterName: String((fullDraft.travelInfo as any).inviterName || ''),
                inviterRelationship: String((fullDraft.travelInfo as any).inviterRelationship || ''),
                inviterAddress: String((fullDraft.travelInfo as any).inviterAddress || ''),
                inviterPhone: String((fullDraft.travelInfo as any).inviterPhone || ''),
                needFlightItinerary: Boolean((fullDraft.travelInfo as any).supportServices?.preFlightBooking),
                needHotelReservation: Boolean((fullDraft.travelInfo as any).supportServices?.hotelBooking),
                needTravelItinerary: Boolean((fullDraft.travelInfo as any).supportServices?.travelItinerary),
                serviceSpeed:
                  (fullDraft.travelInfo as any).serviceSpeed === 'EXPRESS'
                    ? 'EXPRESS'
                    : 'STANDARD',
              }
            : initialFormData.travelInfo,
          familyInfo: fullDraft.familyInfo
            ? {
                fatherSurnames: fullDraft.familyInfo.fatherSurnames || '',
                fatherGivenNames: fullDraft.familyInfo.fatherGivenNames || '',
                fatherDateOfBirth: fullDraft.familyInfo.fatherDateOfBirth || '',
                motherSurnames: fullDraft.familyInfo.motherSurnames || '',
                motherGivenNames: fullDraft.familyInfo.motherGivenNames || '',
                motherDateOfBirth: fullDraft.familyInfo.motherDateOfBirth || '',
                hasSpouse: Boolean(fullDraft.familyInfo.hasSpouse),
                spouseFullName: fullDraft.familyInfo.spouseFullName || '',
                spouseDateOfBirth: fullDraft.familyInfo.spouseDateOfBirth || '',
                hasChildren: Boolean(fullDraft.familyInfo.hasChildren),
                numberOfChildren: String(fullDraft.familyInfo.children?.length || ''),
                children:
                  (fullDraft.familyInfo.children || []).map((child: any) => ({
                    fullName: child?.fullName || '',
                    dateOfBirth: child?.dateOfBirth || '',
                  })) || [],
              }
            : initialFormData.familyInfo,
          workEducation: fullDraft.workEducation
            ? {
                primaryOccupation: fullDraft.workEducation.primaryOccupation || '',
                employerOrSchoolName: fullDraft.workEducation.presentEmployerName || '',
                monthlySalary: fullDraft.workEducation.monthlySalary || '',
                jobDuties: fullDraft.workEducation.jobDuties || '',
              }
            : initialFormData.workEducation,
          securityCheck: fullDraft.securityInfo
            ? {
                hasBeenArrested:
                  (fullDraft.securityInfo as any).hasBeenArrested === true ? 'YES' : 'NO',
                arrestDetails: (fullDraft.securityInfo as any).arrestDetails || '',
              }
            : initialFormData.securityCheck,
        };

        applyRestoredFormData(nextFormData, draftMeta.id, Math.min(fullDraft.currentStep || 1, 7));
        saveLocalSnapshot(draftMeta.id, Math.min(fullDraft.currentStep || 1, 7), nextFormData);

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
      } catch (error) {
        console.error('Failed to load draft:', error);
      } finally {
        if (initial) {
          setIsLoading(false);
        } else {
          setIsRestoringDraft(false);
        }
      }
    },
    [applyRestoredFormData, restoreFromLocalSnapshot, saveLocalSnapshot, selectedCountryCode, t],
  );

  // Load existing draft application on mount
  useEffect(() => {
    void restoreLatestDraft({ initial: true });
  }, [restoreLatestDraft]);

  useEffect(() => {
    if (!formData.familyInfo.hasChildren) {
      if (formData.familyInfo.numberOfChildren !== '' || formData.familyInfo.children.length > 0) {
        setFormData((prev) => ({
          ...prev,
          familyInfo: {
            ...prev.familyInfo,
            numberOfChildren: '',
            children: [],
          },
        }));
      }
      return;
    }

    const count = Number(formData.familyInfo.numberOfChildren || '0');
    if (!Number.isFinite(count) || count < 1) {
      if (formData.familyInfo.children.length > 0) {
        setFormData((prev) => ({
          ...prev,
          familyInfo: {
            ...prev.familyInfo,
            children: [],
          },
        }));
      }
      return;
    }

    const normalizedCount = Math.min(Math.max(Math.floor(count), 0), 10);
    if (formData.familyInfo.children.length === normalizedCount) return;

    setFormData((prev) => {
      const nextChildren = Array.from({ length: normalizedCount }).map((_, index) => ({
        fullName: prev.familyInfo.children[index]?.fullName || '',
        dateOfBirth: prev.familyInfo.children[index]?.dateOfBirth || '',
      }));
      return {
        ...prev,
        familyInfo: {
          ...prev.familyInfo,
          children: nextChildren,
        },
      };
    });
  }, [formData.familyInfo.children.length, formData.familyInfo.hasChildren, formData.familyInfo.numberOfChildren]);

  const steps: FormStep[] = [
    { id: 1, name: t('form.steps.personal', { defaultValue: 'Personal Info' }), icon: <User className="w-5 h-5" />, status: currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'pending' },
    { id: 2, name: t('form.steps.contact', { defaultValue: 'Contact Info' }), icon: <Phone className="w-5 h-5" />, status: currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : 'pending' },
    { id: 3, name: t('form.steps.passport', { defaultValue: 'Passport' }), icon: <FileText className="w-5 h-5" />, status: currentStep === 3 ? 'current' : currentStep > 3 ? 'completed' : 'pending' },
    { id: 4, name: t('form.steps.travel', { defaultValue: 'Travel Plans' }), icon: <Plane className="w-5 h-5" />, status: currentStep === 4 ? 'current' : currentStep > 4 ? 'completed' : 'pending' },
    { id: 5, name: t('form.steps.family', { defaultValue: 'Family' }), icon: <Users className="w-5 h-5" />, status: currentStep === 5 ? 'current' : currentStep > 5 ? 'completed' : 'pending' },
    { id: 6, name: t('form.steps.work', { defaultValue: 'Work' }), icon: <Briefcase className="w-5 h-5" />, status: currentStep === 6 ? 'current' : currentStep > 6 ? 'completed' : 'pending' },
    { id: 7, name: t('form.steps.review', { defaultValue: 'Review' }), icon: <Shield className="w-5 h-5" />, status: currentStep === 7 ? 'current' : 'pending' },
  ];

  const updateFormData = (section: keyof FormData, field: string, value: any) => {
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

  const updateChildInfo = (index: number, field: 'fullName' | 'dateOfBirth', value: string) => {
    setFormData((prev) => {
      const nextChildren = [...prev.familyInfo.children];
      nextChildren[index] = {
        fullName: nextChildren[index]?.fullName || '',
        dateOfBirth: nextChildren[index]?.dateOfBirth || '',
        [field]: value,
      };
      return {
        ...prev,
        familyInfo: {
          ...prev.familyInfo,
          children: nextChildren,
        },
      };
    });
    if (errors.children) {
      setErrors((prev) => ({ ...prev, children: '' }));
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
      if (!formData.travelInfo.noAddressYet && !formData.travelInfo.usAddress) {
        newErrors.usAddress = t('form.validation.required', { defaultValue: 'Required' });
      }
      if (formData.travelInfo.hasInviter && !formData.travelInfo.inviterName) {
        newErrors.inviterName = t('form.validation.required', { defaultValue: 'Required' });
      }
    } else if (step === 5) {
      if (!formData.familyInfo.fatherSurnames) newErrors.fatherSurnames = t('form.validation.required', { defaultValue: 'Required' });
      if (!formData.familyInfo.fatherGivenNames) newErrors.fatherGivenNames = t('form.validation.required', { defaultValue: 'Required' });
      if (!formData.familyInfo.fatherDateOfBirth) newErrors.fatherDateOfBirth = t('form.validation.required', { defaultValue: 'Required' });
      if (!formData.familyInfo.motherSurnames) newErrors.motherSurnames = t('form.validation.required', { defaultValue: 'Required' });
      if (!formData.familyInfo.motherGivenNames) newErrors.motherGivenNames = t('form.validation.required', { defaultValue: 'Required' });
      if (!formData.familyInfo.motherDateOfBirth) newErrors.motherDateOfBirth = t('form.validation.required', { defaultValue: 'Required' });
      if (formData.familyInfo.hasSpouse && !formData.familyInfo.spouseFullName) {
        newErrors.spouseFullName = t('form.validation.required', { defaultValue: 'Required' });
      }
      if (formData.familyInfo.hasSpouse && !formData.familyInfo.spouseDateOfBirth) {
        newErrors.spouseDateOfBirth = t('form.validation.required', { defaultValue: 'Required' });
      }
      if (formData.familyInfo.hasChildren) {
        const count = Number(formData.familyInfo.numberOfChildren || '0');
        if (!Number.isFinite(count) || count < 1) {
          newErrors.numberOfChildren = t('form.validation.required', { defaultValue: 'Required' });
        } else {
          const missingChildData = formData.familyInfo.children.some(
            (child) => !child.fullName.trim() || !child.dateOfBirth,
          );
          if (missingChildData) {
            newErrors.children = t('applicationPage.family.childrenValidation', {
              defaultValue: 'Please complete each child full name and date of birth.',
            });
          }
        }
      }
    } else if (step === 6) {
      if (!formData.workEducation.primaryOccupation) newErrors.primaryOccupation = t('form.validation.required', { defaultValue: 'Required' });
      if (!formData.workEducation.employerOrSchoolName) newErrors.employerOrSchoolName = t('form.validation.required', { defaultValue: 'Required' });
    } else if (step === 7) {
      if (!formData.securityCheck.hasBeenArrested) {
        newErrors.securityAnswer = t('form.validation.required', { defaultValue: 'Required' });
      }
      if (
        formData.securityCheck.hasBeenArrested === 'YES' &&
        !formData.securityCheck.arrestDetails.trim()
      ) {
        newErrors.arrestDetails = t('form.validation.required', { defaultValue: 'Required' });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 7));
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
          noUSAddressYet: formData.travelInfo.noAddressYet,
          destinationCountry: selectedCountryCode,
          hasInviter: formData.travelInfo.hasInviter,
          inviterName: formData.travelInfo.inviterName || undefined,
          inviterRelationship: formData.travelInfo.inviterRelationship || undefined,
          inviterAddress: formData.travelInfo.inviterAddress || undefined,
          inviterPhone: formData.travelInfo.inviterPhone || undefined,
          supportServices: {
            hotelBooking: formData.travelInfo.needHotelReservation,
            preFlightBooking: formData.travelInfo.needFlightItinerary,
            travelItinerary: formData.travelInfo.needTravelItinerary,
          },
          serviceSpeed: formData.travelInfo.serviceSpeed || 'STANDARD',
          payingForTrip: formData.travelInfo.payingForTrip || '',
          travelingWithOthers: false,
        },
        familyInfo: {
          fatherSurnames: formData.familyInfo.fatherSurnames || '',
          fatherGivenNames: formData.familyInfo.fatherGivenNames || '',
          fatherDateOfBirth: formData.familyInfo.fatherDateOfBirth || undefined,
          motherSurnames: formData.familyInfo.motherSurnames || '',
          motherGivenNames: formData.familyInfo.motherGivenNames || '',
          motherDateOfBirth: formData.familyInfo.motherDateOfBirth || undefined,
          hasSpouse: formData.familyInfo.hasSpouse,
          spouseFullName: formData.familyInfo.hasSpouse ? formData.familyInfo.spouseFullName : undefined,
          spouseDateOfBirth:
            formData.familyInfo.hasSpouse && formData.familyInfo.spouseDateOfBirth
              ? formData.familyInfo.spouseDateOfBirth
              : undefined,
          hasChildren: formData.familyInfo.hasChildren,
          children:
            formData.familyInfo.hasChildren && Number(formData.familyInfo.numberOfChildren) > 0
              ? formData.familyInfo.children.map((child) => ({
                  fullName: child.fullName || undefined,
                  dateOfBirth: child.dateOfBirth || undefined,
                  relationship: 'CHILD',
                }))
              : [],
        },
        workEducation: {
          primaryOccupation: formData.workEducation.primaryOccupation || '',
          presentEmployerName: formData.workEducation.employerOrSchoolName || '',
          monthlySalary: formData.workEducation.monthlySalary || undefined,
          jobDuties: formData.workEducation.jobDuties || undefined,
        },
        securityInfo: buildSecurityInfoPayload(),
      };

      let nextApplicationId = applicationId;

      if (applicationId) {
        // Update existing application
        await applicationsApi.update(applicationId, apiData);
      } else {
        // Create new application first
        const newApp = await applicationsApi.create({ visaType: getVisaTypeForCountry(selectedCountryCode) });
        setApplicationId(newApp.id);
        await applicationsApi.update(newApp.id, apiData);
        nextApplicationId = newApp.id;
      }
      saveLocalSnapshot(nextApplicationId || null, currentStep, formData);
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
      currentStep: 7,
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
        noUSAddressYet: formData.travelInfo.noAddressYet,
        destinationCountry: selectedCountryCode,
        hasInviter: formData.travelInfo.hasInviter,
        inviterName: formData.travelInfo.inviterName || undefined,
        inviterRelationship: formData.travelInfo.inviterRelationship || undefined,
        inviterAddress: formData.travelInfo.inviterAddress || undefined,
        inviterPhone: formData.travelInfo.inviterPhone || undefined,
        supportServices: {
          hotelBooking: formData.travelInfo.needHotelReservation,
          preFlightBooking: formData.travelInfo.needFlightItinerary,
          travelItinerary: formData.travelInfo.needTravelItinerary,
        },
        serviceSpeed: formData.travelInfo.serviceSpeed,
        payingForTrip: formData.travelInfo.payingForTrip,
        travelingWithOthers: false,
      },
      familyInfo: {
        fatherSurnames: formData.familyInfo.fatherSurnames,
        fatherGivenNames: formData.familyInfo.fatherGivenNames,
        fatherDateOfBirth: formData.familyInfo.fatherDateOfBirth || undefined,
        motherSurnames: formData.familyInfo.motherSurnames,
        motherGivenNames: formData.familyInfo.motherGivenNames,
        motherDateOfBirth: formData.familyInfo.motherDateOfBirth || undefined,
        hasSpouse: formData.familyInfo.hasSpouse,
        spouseFullName: formData.familyInfo.hasSpouse ? formData.familyInfo.spouseFullName : undefined,
        spouseDateOfBirth:
          formData.familyInfo.hasSpouse && formData.familyInfo.spouseDateOfBirth
            ? formData.familyInfo.spouseDateOfBirth
            : undefined,
        hasChildren: formData.familyInfo.hasChildren,
        children:
          formData.familyInfo.hasChildren && Number(formData.familyInfo.numberOfChildren) > 0
            ? formData.familyInfo.children.map((child) => ({
                fullName: child.fullName || undefined,
                dateOfBirth: child.dateOfBirth || undefined,
                relationship: 'CHILD',
              }))
            : [],
      },
      workEducation: {
        primaryOccupation: formData.workEducation.primaryOccupation,
        presentEmployerName: formData.workEducation.employerOrSchoolName,
        monthlySalary: formData.workEducation.monthlySalary || undefined,
        jobDuties: formData.workEducation.jobDuties || undefined,
      },
      securityInfo: buildSecurityInfoPayload(),
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
      localStorage.removeItem(LOCAL_DRAFT_SNAPSHOT_KEY);

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
    for (let step = 1; step <= 7; step++) {
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
      saveLocalSnapshot(appId, 7, formData);

      if (PAYMENT_REQUIRED) {
        setShowPaymentModal(true);
      } else {
        await applicationsApi.submit(appId);
        localStorage.removeItem(LOCAL_DRAFT_SNAPSHOT_KEY);
        setPaymentComplete(true);
        toast.success(t('applicationPage.toasts.submitted.title', { defaultValue: 'Application submitted!' }), {
          description: t('applicationPage.toasts.submitted.description', {
            defaultValue: 'Your application has been submitted for review.',
          }),
          duration: 5000,
        });
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      }
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
                <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={formData.travelInfo.noAddressYet}
                    onChange={(e) => updateFormData('travelInfo', 'noAddressYet', e.target.checked)}
                    className="w-4 h-4 rounded border-border"
                  />
                  {t('applicationPage.travel.noAddressYet', {
                    defaultValue:
                      "I don't have an exact destination address yet (your team will assist with hotel/itinerary).",
                  })}
                </label>
              </div>

              {!formData.travelInfo.noAddressYet && (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {selectedCountryCode === 'USA'
                        ? t('form.travel.usAddress', { defaultValue: 'US Address' })
                        : t('applicationPage.travel.destinationAddress', { defaultValue: 'Destination Address' })}{' '}
                      *
                    </label>
                    <input
                      type="text"
                      value={formData.travelInfo.usAddress}
                      onChange={(e) => updateFormData('travelInfo', 'usAddress', e.target.value)}
                      className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder={
                        selectedCountryCode === 'USA'
                          ? t('applicationPage.placeholders.usAddress', { defaultValue: 'Hotel or residence address in the US' })
                          : t('applicationPage.travel.destinationAddressPlaceholder', { defaultValue: 'Hotel or residence address in destination country' })
                      }
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
                      placeholder={selectedCountryCode === 'USA' ? 'New York' : 'Tokyo'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('form.contact.state', { defaultValue: 'State/Region' })}
                    </label>
                    <input
                      type="text"
                      value={formData.travelInfo.usState}
                      onChange={(e) => updateFormData('travelInfo', 'usState', e.target.value)}
                      className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder={selectedCountryCode === 'USA' ? 'NY' : 'Tokyo'}
                    />
                  </div>
                </>
              )}

              <div className="md:col-span-2 rounded-lg border border-border p-4">
                <p className="text-sm font-medium text-foreground mb-3">
                  {t('applicationPage.travel.supportServices', {
                    defaultValue: 'Travel support services (our team can prepare these)',
                  })}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className="inline-flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={formData.travelInfo.needFlightItinerary}
                      onChange={(e) => updateFormData('travelInfo', 'needFlightItinerary', e.target.checked)}
                      className="w-4 h-4 rounded border-border"
                    />
                    {t('applicationPage.travel.needFlightItinerary', { defaultValue: 'Flight itinerary (we will do it)' })}
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={formData.travelInfo.needHotelReservation}
                      onChange={(e) => updateFormData('travelInfo', 'needHotelReservation', e.target.checked)}
                      className="w-4 h-4 rounded border-border"
                    />
                    {t('applicationPage.travel.needHotelReservation', { defaultValue: 'Hotel reservation (we will do it)' })}
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={formData.travelInfo.needTravelItinerary}
                      onChange={(e) => updateFormData('travelInfo', 'needTravelItinerary', e.target.checked)}
                      className="w-4 h-4 rounded border-border"
                    />
                    {t('applicationPage.travel.needTravelItinerary', { defaultValue: 'Travel itinerary (we will do it)' })}
                  </label>
                </div>
              </div>

              <div className="md:col-span-2 rounded-lg border border-border p-4">
                <p className="text-sm font-medium text-foreground mb-3">
                  {t('applicationPage.travel.serviceSpeedTitle', {
                    defaultValue: 'Processing option',
                  })}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/40">
                    <input
                      type="radio"
                      name="serviceSpeed"
                      checked={formData.travelInfo.serviceSpeed === 'STANDARD'}
                      onChange={() => updateFormData('travelInfo', 'serviceSpeed', 'STANDARD')}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-foreground">
                        {t('applicationPage.travel.serviceSpeed.standard', {
                          defaultValue: 'Standard',
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('applicationPage.travel.serviceSpeed.standardDesc', {
                          defaultValue: 'Regular review queue.',
                        })}
                      </p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/40">
                    <input
                      type="radio"
                      name="serviceSpeed"
                      checked={formData.travelInfo.serviceSpeed === 'EXPRESS'}
                      onChange={() => updateFormData('travelInfo', 'serviceSpeed', 'EXPRESS')}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-foreground">
                        {t('applicationPage.travel.serviceSpeed.express', {
                          defaultValue: 'Express (+15%)',
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('applicationPage.travel.serviceSpeed.expressDesc', {
                          defaultValue: 'Priority handling for urgent timelines.',
                        })}
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="md:col-span-2 flex items-center gap-2">
                <input
                  id="hasInviter"
                  type="checkbox"
                  checked={formData.travelInfo.hasInviter}
                  onChange={(e) => updateFormData('travelInfo', 'hasInviter', e.target.checked)}
                  className="w-4 h-4 rounded border-border"
                />
                <label htmlFor="hasInviter" className="text-sm font-medium text-foreground">
                  {t('applicationPage.travel.hasInviter', { defaultValue: 'I have an inviter / guarantor' })}
                </label>
              </div>

              {formData.travelInfo.hasInviter && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('applicationPage.travel.inviterName', { defaultValue: 'Inviter Full Name' })} *
                    </label>
                    <input
                      type="text"
                      value={formData.travelInfo.inviterName}
                      onChange={(e) => updateFormData('travelInfo', 'inviterName', e.target.value)}
                      className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="Inviter full name"
                    />
                    {errors.inviterName && <p className="mt-1 text-sm text-destructive">{errors.inviterName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('applicationPage.travel.inviterRelationship', { defaultValue: 'Relationship' })}
                    </label>
                    <input
                      type="text"
                      value={formData.travelInfo.inviterRelationship}
                      onChange={(e) => updateFormData('travelInfo', 'inviterRelationship', e.target.value)}
                      className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="Friend / Relative / Employer"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('applicationPage.travel.inviterAddress', { defaultValue: 'Inviter Address' })}
                    </label>
                    <input
                      type="text"
                      value={formData.travelInfo.inviterAddress}
                      onChange={(e) => updateFormData('travelInfo', 'inviterAddress', e.target.value)}
                      className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="Inviter address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('applicationPage.travel.inviterPhone', { defaultValue: 'Inviter Phone' })}
                    </label>
                    <input
                      type="text"
                      value={formData.travelInfo.inviterPhone}
                      onChange={(e) => updateFormData('travelInfo', 'inviterPhone', e.target.value)}
                      className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="+81 ..."
                    />
                  </div>
                </>
              )}

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
              {t('form.family.title', { defaultValue: 'Family Information' })}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.family.fatherSurname', { defaultValue: "Father's Surname" })} *
                </label>
                <input
                  type="text"
                  value={formData.familyInfo.fatherSurnames}
                  onChange={(e) => updateFormData('familyInfo', 'fatherSurnames', e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent uppercase"
                  placeholder="SMITH"
                />
                {errors.fatherSurnames && <p className="mt-1 text-sm text-destructive">{errors.fatherSurnames}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.family.fatherGivenName', { defaultValue: "Father's Given Name" })} *
                </label>
                <input
                  type="text"
                  value={formData.familyInfo.fatherGivenNames}
                  onChange={(e) => updateFormData('familyInfo', 'fatherGivenNames', e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent uppercase"
                  placeholder="JOHN"
                />
                {errors.fatherGivenNames && <p className="mt-1 text-sm text-destructive">{errors.fatherGivenNames}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('applicationPage.family.fatherDob', { defaultValue: "Father's Date of Birth" })} *
                </label>
                <input
                  type="date"
                  value={formData.familyInfo.fatherDateOfBirth}
                  onChange={(e) => updateFormData('familyInfo', 'fatherDateOfBirth', e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                />
                {errors.fatherDateOfBirth && <p className="mt-1 text-sm text-destructive">{errors.fatherDateOfBirth}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.family.motherSurname', { defaultValue: "Mother's Surname" })} *
                </label>
                <input
                  type="text"
                  value={formData.familyInfo.motherSurnames}
                  onChange={(e) => updateFormData('familyInfo', 'motherSurnames', e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent uppercase"
                  placeholder="DOE"
                />
                {errors.motherSurnames && <p className="mt-1 text-sm text-destructive">{errors.motherSurnames}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.family.motherGivenName', { defaultValue: "Mother's Given Name" })} *
                </label>
                <input
                  type="text"
                  value={formData.familyInfo.motherGivenNames}
                  onChange={(e) => updateFormData('familyInfo', 'motherGivenNames', e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent uppercase"
                  placeholder="JANE"
                />
                {errors.motherGivenNames && <p className="mt-1 text-sm text-destructive">{errors.motherGivenNames}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('applicationPage.family.motherDob', { defaultValue: "Mother's Date of Birth" })} *
                </label>
                <input
                  type="date"
                  value={formData.familyInfo.motherDateOfBirth}
                  onChange={(e) => updateFormData('familyInfo', 'motherDateOfBirth', e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                />
                {errors.motherDateOfBirth && <p className="mt-1 text-sm text-destructive">{errors.motherDateOfBirth}</p>}
              </div>

              <div className="md:col-span-2 flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={formData.familyInfo.hasSpouse}
                    onChange={(e) => updateFormData('familyInfo', 'hasSpouse', e.target.checked)}
                    className="w-4 h-4 rounded border-border"
                  />
                  {t('form.family.hasSpouse', { defaultValue: 'I have a spouse' })}
                </label>

                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={formData.familyInfo.hasChildren}
                    onChange={(e) => updateFormData('familyInfo', 'hasChildren', e.target.checked)}
                    className="w-4 h-4 rounded border-border"
                  />
                  {t('form.family.hasChildren', { defaultValue: 'I have children' })}
                </label>
              </div>

              {formData.familyInfo.hasSpouse && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('form.family.spouseName', { defaultValue: 'Spouse Full Name' })} *
                    </label>
                    <input
                      type="text"
                      value={formData.familyInfo.spouseFullName}
                      onChange={(e) => updateFormData('familyInfo', 'spouseFullName', e.target.value)}
                      className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="Spouse full name"
                    />
                    {errors.spouseFullName && <p className="mt-1 text-sm text-destructive">{errors.spouseFullName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('applicationPage.family.spouseDob', { defaultValue: 'Spouse Date of Birth' })} *
                    </label>
                    <input
                      type="date"
                      value={formData.familyInfo.spouseDateOfBirth}
                      onChange={(e) => updateFormData('familyInfo', 'spouseDateOfBirth', e.target.value)}
                      className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                    />
                    {errors.spouseDateOfBirth && <p className="mt-1 text-sm text-destructive">{errors.spouseDateOfBirth}</p>}
                  </div>
                </>
              )}

              {formData.familyInfo.hasChildren && (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('form.family.numberOfChildren', { defaultValue: 'Number of Children' })}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={formData.familyInfo.numberOfChildren}
                      onChange={(e) => updateFormData('familyInfo', 'numberOfChildren', e.target.value)}
                      className="w-full md:w-1/3 px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="1"
                    />
                    {errors.numberOfChildren && <p className="mt-1 text-sm text-destructive">{errors.numberOfChildren}</p>}
                  </div>
                  {formData.familyInfo.children.map((child, index) => (
                    <div key={`child-${index}`} className="md:col-span-2 rounded-lg border border-border p-4">
                      <p className="text-sm font-medium text-foreground mb-3">
                        {t('applicationPage.family.childTitle', {
                          defaultValue: 'Child {{index}}',
                          index: index + 1,
                        })}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            {t('applicationPage.family.childName', { defaultValue: 'Full Name' })} *
                          </label>
                          <input
                            type="text"
                            value={child.fullName}
                            onChange={(e) => updateChildInfo(index, 'fullName', e.target.value)}
                            className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            {t('applicationPage.family.childDob', { defaultValue: 'Date of Birth' })} *
                          </label>
                          <input
                            type="date"
                            value={child.dateOfBirth}
                            onChange={(e) => updateChildInfo(index, 'dateOfBirth', e.target.value)}
                            className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {errors.children && <p className="md:col-span-2 mt-1 text-sm text-destructive">{errors.children}</p>}
                </>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              {t('form.work.title', { defaultValue: 'Work / Education Information' })}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.work.primaryOccupation', { defaultValue: 'Primary Occupation' })} *
                </label>
                <select
                  value={formData.workEducation.primaryOccupation}
                  onChange={(e) => updateFormData('workEducation', 'primaryOccupation', e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  <option value="">{t('common.select', { defaultValue: 'Select' })}</option>
                  <option value="STUDENT">{t('form.work.options.student', { defaultValue: 'Student' })}</option>
                  <option value="EMPLOYED">{t('form.work.options.employed', { defaultValue: 'Employed' })}</option>
                  <option value="SELF_EMPLOYED">{t('form.work.options.selfEmployed', { defaultValue: 'Self-Employed' })}</option>
                  <option value="UNEMPLOYED">{t('form.work.options.unemployed', { defaultValue: 'Unemployed' })}</option>
                  <option value="OTHER">{t('form.work.options.other', { defaultValue: 'Other' })}</option>
                </select>
                {errors.primaryOccupation && <p className="mt-1 text-sm text-destructive">{errors.primaryOccupation}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.work.orgName', { defaultValue: 'Employer / School Name' })} *
                </label>
                <input
                  type="text"
                  value={formData.workEducation.employerOrSchoolName}
                  onChange={(e) => updateFormData('workEducation', 'employerOrSchoolName', e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="Organization name"
                />
                {errors.employerOrSchoolName && <p className="mt-1 text-sm text-destructive">{errors.employerOrSchoolName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.work.monthlyIncome', { defaultValue: 'Monthly Income (optional)' })}
                </label>
                <input
                  type="text"
                  value={formData.workEducation.monthlySalary}
                  onChange={(e) => updateFormData('workEducation', 'monthlySalary', e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="e.g. 2,500,000 MNT"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.work.duties', { defaultValue: 'Job / Study Details' })}
                </label>
                <textarea
                  value={formData.workEducation.jobDuties}
                  onChange={(e) => updateFormData('workEducation', 'jobDuties', e.target.value)}
                  className="w-full min-h-[120px] px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder={t('form.work.dutiesPlaceholder', { defaultValue: 'Describe your role, program, or responsibilities' })}
                />
              </div>
            </div>
          </div>
        );

      case 7:
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
                          {formatNumber(serviceFeeAmountMnt, i18n.language)}
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

              {!paymentComplete && (
                <div className="bg-muted/50 border border-border rounded-xl p-6">
                  <h4 className="text-lg font-medium text-foreground mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    {t('applicationPage.security.title', {
                      defaultValue: 'Security Question',
                    })}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('applicationPage.security.question', {
                      defaultValue: 'Have you ever been arrested or convicted?',
                    })}
                  </p>
                  <div className="flex flex-wrap gap-6">
                    <label className="inline-flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="radio"
                        name="securityQuestion"
                        checked={formData.securityCheck.hasBeenArrested === 'NO'}
                        onChange={() => updateFormData('securityCheck', 'hasBeenArrested', 'NO')}
                      />
                      {t('common.no', { defaultValue: 'No' })}
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="radio"
                        name="securityQuestion"
                        checked={formData.securityCheck.hasBeenArrested === 'YES'}
                        onChange={() => updateFormData('securityCheck', 'hasBeenArrested', 'YES')}
                      />
                      {t('common.yes', { defaultValue: 'Yes' })}
                    </label>
                  </div>
                  {errors.securityAnswer && (
                    <p className="mt-2 text-sm text-destructive">{errors.securityAnswer}</p>
                  )}
                  {formData.securityCheck.hasBeenArrested === 'YES' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        {t('applicationPage.security.details', {
                          defaultValue: 'Please provide details',
                        })}
                      </label>
                      <textarea
                        value={formData.securityCheck.arrestDetails}
                        onChange={(e) =>
                          updateFormData('securityCheck', 'arrestDetails', e.target.value)
                        }
                        className="w-full min-h-[100px] px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                      />
                      {errors.arrestDetails && (
                        <p className="mt-1 text-sm text-destructive">{errors.arrestDetails}</p>
                      )}
                    </div>
                  )}
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
                  <div>
                    <span className="text-muted-foreground">
                      {t('applicationPage.review.labels.processingOption', { defaultValue: 'Processing' })}:
                    </span>{' '}
                    <span className="text-foreground ml-2">
                      {formData.travelInfo.serviceSpeed === 'EXPRESS'
                        ? t('applicationPage.travel.serviceSpeed.express', { defaultValue: 'Express (+15%)' })
                        : t('applicationPage.travel.serviceSpeed.standard', { defaultValue: 'Standard' })}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">
                      {t('form.travel.usAddress', { defaultValue: 'US Address' })}:
                    </span>{' '}
                    <span className="text-foreground ml-2">
                      {formData.travelInfo.noAddressYet
                        ? t('applicationPage.travel.noAddressSelected', {
                            defaultValue: 'Address will be arranged with hotel/itinerary support.',
                          })
                        : `${formData.travelInfo.usAddress}, ${formData.travelInfo.usCity} ${formData.travelInfo.usState}`}
                    </span>
                  </div>
                  {formData.travelInfo.hasInviter && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">
                        {t('applicationPage.travel.inviterName', { defaultValue: 'Inviter' })}:
                      </span>{' '}
                      <span className="text-foreground ml-2">
                        {formData.travelInfo.inviterName}
                        {formData.travelInfo.inviterRelationship ? ` (${formData.travelInfo.inviterRelationship})` : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Family Summary */}
              <div className="bg-muted/50 border border-border rounded-xl p-6">
                <h4 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {t('form.family.title', { defaultValue: 'Family Information' })}
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t('form.family.fatherGivenName', { defaultValue: "Father" })}:</span>{' '}
                    <span className="text-foreground ml-2">
                      {formData.familyInfo.fatherSurnames} {formData.familyInfo.fatherGivenNames}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('form.family.motherGivenName', { defaultValue: "Mother" })}:</span>{' '}
                    <span className="text-foreground ml-2">
                      {formData.familyInfo.motherSurnames} {formData.familyInfo.motherGivenNames}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('applicationPage.family.fatherDob', { defaultValue: "Father's Date of Birth" })}:</span>{' '}
                    <span className="text-foreground ml-2">{formData.familyInfo.fatherDateOfBirth || '-'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('applicationPage.family.motherDob', { defaultValue: "Mother's Date of Birth" })}:</span>{' '}
                    <span className="text-foreground ml-2">{formData.familyInfo.motherDateOfBirth || '-'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('form.family.hasSpouse', { defaultValue: 'Spouse' })}:</span>{' '}
                    <span className="text-foreground ml-2">
                      {formData.familyInfo.hasSpouse
                        ? formData.familyInfo.spouseFullName || t('common.yes', { defaultValue: 'Yes' })
                        : t('common.no', { defaultValue: 'No' })}
                    </span>
                  </div>
                  {formData.familyInfo.hasSpouse && (
                    <div>
                      <span className="text-muted-foreground">{t('applicationPage.family.spouseDob', { defaultValue: 'Spouse Date of Birth' })}:</span>{' '}
                      <span className="text-foreground ml-2">{formData.familyInfo.spouseDateOfBirth || '-'}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">{t('form.family.hasChildren', { defaultValue: 'Children' })}:</span>{' '}
                    <span className="text-foreground ml-2">
                      {formData.familyInfo.hasChildren
                        ? formData.familyInfo.numberOfChildren || t('common.yes', { defaultValue: 'Yes' })
                        : t('common.no', { defaultValue: 'No' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Work Summary */}
              <div className="bg-muted/50 border border-border rounded-xl p-6">
                <h4 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  {t('form.work.title', { defaultValue: 'Work / Education Information' })}
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t('form.work.primaryOccupation', { defaultValue: 'Occupation' })}:</span>{' '}
                    <span className="text-foreground ml-2">{formData.workEducation.primaryOccupation}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('form.work.orgName', { defaultValue: 'Employer / School' })}:</span>{' '}
                    <span className="text-foreground ml-2">{formData.workEducation.employerOrSchoolName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('form.work.monthlyIncome', { defaultValue: 'Monthly Income' })}:</span>{' '}
                    <span className="text-foreground ml-2">{formData.workEducation.monthlySalary || '-'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">{t('form.work.duties', { defaultValue: 'Details' })}:</span>{' '}
                    <span className="text-foreground ml-2">{formData.workEducation.jobDuties || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Japan Requirements */}
              {selectedCountryCode === 'JAPAN' && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-foreground mb-4">
                    {t('applicationPage.japan.requiredDocsTitle', { defaultValue: 'Required Documents (Japan)' })}
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                    <li>Valid Passport</li>
                    <li>Passport-size Photo (4.5cm x 4.5cm, white background)</li>
                    <li>Visa Application Form (prepared after user information is complete)</li>
                    <li>Flight Itinerary (we will do it if selected)</li>
                    <li>Hotel Reservations (we will do it if selected)</li>
                    <li>Invitation / Guarantee Letter (optional)</li>
                    <li>Bank Statements (6 months summary)</li>
                    <li>Employment Certificate or School Certificate</li>
                    <li>Income Tax Return</li>
                    <li>Travel Itinerary (we will do it if selected)</li>
                  </ul>
                  <div className="mt-4 text-sm text-foreground">
                    <p>Online visa fee: <strong>104,000 MNT</strong></p>
                    <p>Service fee formula: <strong>104,000 x 2 + 5% = 218,400 MNT</strong></p>
                    <p>Application channels: <strong>Online</strong> and <strong>VAC/Embassy</strong>.</p>
                  </div>
                </div>
              )}

              {/* Document Submission Notice */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                <p className="text-sm text-foreground">
                  {t('applicationPage.docs.emailNotice', {
                    defaultValue: 'No document upload is required here. You can send supporting files by email:',
                  })}{' '}
                  <a href="mailto:example@email.com" className="font-semibold text-blue-600 dark:text-blue-400 underline">
                    example@email.com
                  </a>
                </p>
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 md:pt-10 pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {t('applicationPage.title', { defaultValue: 'DS-160 Visa Application' })}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
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
          <div className="overflow-x-auto pb-2">
            <div className="inline-flex items-center min-w-max px-1">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border-2 transition-all ${
                      step.status === 'completed'
                        ? 'bg-primary border-primary text-primary-foreground'
                        : step.status === 'current'
                        ? 'bg-primary/20 border-primary text-foreground'
                        : 'bg-muted border-border text-muted-foreground'
                    }`}>
                      {step.status === 'completed' ? <Check className="w-5 h-5 md:w-6 md:h-6" /> : step.icon}
                    </div>
                    <span
                      className={`mt-2 w-16 text-center text-[10px] md:text-xs font-medium ${
                        step.status === 'current' ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-10 sm:w-14 md:w-24 h-1 mx-2 rounded ${
                      step.status === 'completed' ? 'bg-primary' : 'bg-border'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground text-center md:text-left">
            {t('applicationPage.progress.currentStep', {
              defaultValue: 'Current step: {{current}} / {{total}}',
              current: currentStep,
              total: steps.length,
            })}
          </p>
        </div>

        {/* Form Content */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 md:p-8">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-border space-y-4">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto px-4 sm:px-6 py-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              {t('common.previous', { defaultValue: 'Previous' })}
            </button>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
              <button
                onClick={() => void restoreLatestDraft({ notifyIfMissing: true })}
                disabled={isRestoringDraft || isSaving}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 sm:px-6 py-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all disabled:opacity-50"
              >
                {isRestoringDraft ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <RotateCcw className="w-5 h-5" />
                )}
                {t('applicationPage.buttons.restoreDraft', { defaultValue: 'Restore Draft' })}
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 sm:px-6 py-3 text-primary hover:bg-primary/10 rounded-lg transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {t('form.actions.saveDraft', { defaultValue: 'Save Draft' })}
              </button>

              {currentStep < 7 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 sm:px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all"
                >
                  {t('common.next', { defaultValue: 'Next' })}
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || paymentComplete}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 sm:px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
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
                  ) : PAYMENT_REQUIRED ? (
                    <>
                      <CreditCard className="w-5 h-5" />
                      {t('applicationPage.buttons.paySubmit', { defaultValue: 'Pay & Submit' })}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {t('applicationPage.buttons.submit', { defaultValue: 'Submit Application' })}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
	      {PAYMENT_REQUIRED && applicationId && (
	        <PaymentModal
	          isOpen={showPaymentModal}
	          onClose={() => setShowPaymentModal(false)}
	          applicationId={applicationId}
	          serviceType="VISA_APPLICATION"
	          amount={serviceFeeAmountMnt}
	          description={`${t('applicationPage.title', { defaultValue: 'DS-160 Visa Application' })} - ${formData.personalInfo.surnames} ${formData.personalInfo.givenNames}`}
	          onPaymentSuccess={handlePaymentSuccess}
	        />
	      )}
    </div>
  );
}
