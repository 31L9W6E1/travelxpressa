import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { applicationsApi, type VisaType } from '../api/applications';
import { findCountryByCode, type CountryCode } from '../config/countries';
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
  Loader2
} from 'lucide-react';

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
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [applicationId, setApplicationId] = useState<string | null>(null);

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

  const steps: FormStep[] = [
    { id: 1, name: 'Personal Info', icon: <User className="w-5 h-5" />, status: currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'pending' },
    { id: 2, name: 'Contact Info', icon: <Phone className="w-5 h-5" />, status: currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : 'pending' },
    { id: 3, name: 'Passport', icon: <FileText className="w-5 h-5" />, status: currentStep === 3 ? 'current' : currentStep > 3 ? 'completed' : 'pending' },
    { id: 4, name: 'Travel Plans', icon: <Plane className="w-5 h-5" />, status: currentStep === 4 ? 'current' : currentStep > 4 ? 'completed' : 'pending' },
    { id: 5, name: 'Review', icon: <Shield className="w-5 h-5" />, status: currentStep === 5 ? 'current' : 'pending' },
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
      if (!formData.personalInfo.surnames) newErrors.surnames = 'Surname is required';
      if (!formData.personalInfo.givenNames) newErrors.givenNames = 'Given name is required';
      if (!formData.personalInfo.sex) newErrors.sex = 'Please select your sex';
      if (!formData.personalInfo.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.personalInfo.countryOfBirth) newErrors.countryOfBirth = 'Country of birth is required';
      if (!formData.personalInfo.nationality) newErrors.nationality = 'Nationality is required';
    } else if (step === 2) {
      if (!formData.contactInfo.email) newErrors.email = 'Email is required';
      if (!formData.contactInfo.phone) newErrors.phone = 'Phone is required';
      if (!formData.contactInfo.streetAddress) newErrors.streetAddress = 'Address is required';
      if (!formData.contactInfo.city) newErrors.city = 'City is required';
      if (!formData.contactInfo.country) newErrors.country = 'Country is required';
    } else if (step === 3) {
      if (!formData.passportInfo.passportNumber) newErrors.passportNumber = 'Passport number is required';
      if (!formData.passportInfo.countryOfIssuance) newErrors.countryOfIssuance = 'Country of issuance is required';
      if (!formData.passportInfo.issuanceDate) newErrors.issuanceDate = 'Issuance date is required';
      if (!formData.passportInfo.expirationDate) newErrors.expirationDate = 'Expiration date is required';
    } else if (step === 4) {
      if (!formData.travelInfo.purposeOfTrip) newErrors.purposeOfTrip = 'Purpose of trip is required';
      if (!formData.travelInfo.intendedArrivalDate) newErrors.intendedArrivalDate = 'Arrival date is required';
      if (!formData.travelInfo.usAddress) newErrors.usAddress = 'US address is required';
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
    try {
      // Transform form data to match API schema
      const apiData = {
        currentStep,
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

      if (applicationId) {
        // Update existing application
        await applicationsApi.update(applicationId, apiData);
      } else {
        // Create new application first
        const newApp = await applicationsApi.create({ visaType: getVisaTypeForCountry(selectedCountryCode) });
        setApplicationId(newApp.id);
        await applicationsApi.update(newApp.id, apiData);
      }
      alert('Application saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save application. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      // Transform form data to match API schema
      const apiData = {
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

      let appId = applicationId;

      if (!appId) {
        // Create new application first
        const newApp = await applicationsApi.create({ visaType: getVisaTypeForCountry(selectedCountryCode) });
        appId = newApp.id;
        setApplicationId(appId);
      }

      // Save all form data
      await applicationsApi.update(appId, apiData);

      // Submit the application
      await applicationsApi.submit(appId);

      alert('Application submitted successfully! You will receive a confirmation email.');
      navigate('/profile');
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-6">Personal Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Surname(s) / Family Name(s) *
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.surnames}
                  onChange={(e) => updateFormData('personalInfo', 'surnames', e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                  placeholder="SMITH"
                />
                {errors.surnames && <p className="mt-1 text-sm text-red-400">{errors.surnames}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Given Name(s) *
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.givenNames}
                  onChange={(e) => updateFormData('personalInfo', 'givenNames', e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                  placeholder="JOHN MICHAEL"
                />
                {errors.givenNames && <p className="mt-1 text-sm text-red-400">{errors.givenNames}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name in Native Alphabet
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.fullNameNative}
                  onChange={(e) => updateFormData('personalInfo', 'fullNameNative', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter in your native script"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sex *</label>
                <select
                  value={formData.personalInfo.sex}
                  onChange={(e) => updateFormData('personalInfo', 'sex', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="" className="bg-slate-800">Select</option>
                  <option value="M" className="bg-slate-800">Male</option>
                  <option value="F" className="bg-slate-800">Female</option>
                </select>
                {errors.sex && <p className="mt-1 text-sm text-red-400">{errors.sex}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Marital Status *</label>
                <select
                  value={formData.personalInfo.maritalStatus}
                  onChange={(e) => updateFormData('personalInfo', 'maritalStatus', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="" className="bg-slate-800">Select</option>
                  <option value="SINGLE" className="bg-slate-800">Single</option>
                  <option value="MARRIED" className="bg-slate-800">Married</option>
                  <option value="DIVORCED" className="bg-slate-800">Divorced</option>
                  <option value="WIDOWED" className="bg-slate-800">Widowed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth *</label>
                <input
                  type="date"
                  value={formData.personalInfo.dateOfBirth}
                  onChange={(e) => updateFormData('personalInfo', 'dateOfBirth', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.dateOfBirth && <p className="mt-1 text-sm text-red-400">{errors.dateOfBirth}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">City of Birth *</label>
                <input
                  type="text"
                  value={formData.personalInfo.cityOfBirth}
                  onChange={(e) => updateFormData('personalInfo', 'cityOfBirth', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ulaanbaatar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Country of Birth *</label>
                <input
                  type="text"
                  value={formData.personalInfo.countryOfBirth}
                  onChange={(e) => updateFormData('personalInfo', 'countryOfBirth', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mongolia"
                />
                {errors.countryOfBirth && <p className="mt-1 text-sm text-red-400">{errors.countryOfBirth}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nationality *</label>
                <input
                  type="text"
                  value={formData.personalInfo.nationality}
                  onChange={(e) => updateFormData('personalInfo', 'nationality', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mongolian"
                />
                {errors.nationality && <p className="mt-1 text-sm text-red-400">{errors.nationality}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">National ID Number</label>
                <input
                  type="text"
                  value={formData.personalInfo.nationalId}
                  onChange={(e) => updateFormData('personalInfo', 'nationalId', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ID Number"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-6">Contact Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
                <input
                  type="email"
                  value={formData.contactInfo.email}
                  onChange={(e) => updateFormData('contactInfo', 'email', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.contactInfo.phone}
                  onChange={(e) => updateFormData('contactInfo', 'phone', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+976-9999-9999"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Street Address *</label>
                <input
                  type="text"
                  value={formData.contactInfo.streetAddress}
                  onChange={(e) => updateFormData('contactInfo', 'streetAddress', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123 Main Street, Apt 4B"
                />
                {errors.streetAddress && <p className="mt-1 text-sm text-red-400">{errors.streetAddress}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">City *</label>
                <input
                  type="text"
                  value={formData.contactInfo.city}
                  onChange={(e) => updateFormData('contactInfo', 'city', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ulaanbaatar"
                />
                {errors.city && <p className="mt-1 text-sm text-red-400">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">State/Province</label>
                <input
                  type="text"
                  value={formData.contactInfo.state}
                  onChange={(e) => updateFormData('contactInfo', 'state', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="State/Province"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Postal Code</label>
                <input
                  type="text"
                  value={formData.contactInfo.postalCode}
                  onChange={(e) => updateFormData('contactInfo', 'postalCode', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Country *</label>
                <input
                  type="text"
                  value={formData.contactInfo.country}
                  onChange={(e) => updateFormData('contactInfo', 'country', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mongolia"
                />
                {errors.country && <p className="mt-1 text-sm text-red-400">{errors.country}</p>}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-6">Passport Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Passport Number *</label>
                <input
                  type="text"
                  value={formData.passportInfo.passportNumber}
                  onChange={(e) => updateFormData('passportInfo', 'passportNumber', e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                  placeholder="E12345678"
                />
                {errors.passportNumber && <p className="mt-1 text-sm text-red-400">{errors.passportNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Passport Book Number</label>
                <input
                  type="text"
                  value={formData.passportInfo.passportBookNumber}
                  onChange={(e) => updateFormData('passportInfo', 'passportBookNumber', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Book number (if applicable)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Country of Issuance *</label>
                <input
                  type="text"
                  value={formData.passportInfo.countryOfIssuance}
                  onChange={(e) => updateFormData('passportInfo', 'countryOfIssuance', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mongolia"
                />
                {errors.countryOfIssuance && <p className="mt-1 text-sm text-red-400">{errors.countryOfIssuance}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">City of Issuance</label>
                <input
                  type="text"
                  value={formData.passportInfo.cityOfIssuance}
                  onChange={(e) => updateFormData('passportInfo', 'cityOfIssuance', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ulaanbaatar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Issuance Date *</label>
                <input
                  type="date"
                  value={formData.passportInfo.issuanceDate}
                  onChange={(e) => updateFormData('passportInfo', 'issuanceDate', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.issuanceDate && <p className="mt-1 text-sm text-red-400">{errors.issuanceDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Expiration Date *</label>
                <input
                  type="date"
                  value={formData.passportInfo.expirationDate}
                  onChange={(e) => updateFormData('passportInfo', 'expirationDate', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.expirationDate && <p className="mt-1 text-sm text-red-400">{errors.expirationDate}</p>}
                <p className="mt-1 text-xs text-gray-500">Must be valid for at least 6 months beyond your intended stay</p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-6">Travel Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Purpose of Trip *</label>
                <select
                  value={formData.travelInfo.purposeOfTrip}
                  onChange={(e) => updateFormData('travelInfo', 'purposeOfTrip', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="" className="bg-slate-800">Select purpose</option>
                  <option value="TOURISM" className="bg-slate-800">Tourism/Vacation</option>
                  <option value="BUSINESS" className="bg-slate-800">Business</option>
                  <option value="STUDY" className="bg-slate-800">Study</option>
                  <option value="MEDICAL" className="bg-slate-800">Medical Treatment</option>
                  <option value="CONFERENCE" className="bg-slate-800">Conference</option>
                  <option value="FAMILY" className="bg-slate-800">Visit Family/Friends</option>
                </select>
                {errors.purposeOfTrip && <p className="mt-1 text-sm text-red-400">{errors.purposeOfTrip}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Intended Arrival Date *</label>
                <input
                  type="date"
                  value={formData.travelInfo.intendedArrivalDate}
                  onChange={(e) => updateFormData('travelInfo', 'intendedArrivalDate', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.intendedArrivalDate && <p className="mt-1 text-sm text-red-400">{errors.intendedArrivalDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Length of Stay</label>
                <input
                  type="text"
                  value={formData.travelInfo.intendedLengthOfStay}
                  onChange={(e) => updateFormData('travelInfo', 'intendedLengthOfStay', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 2 weeks"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">US Address *</label>
                <input
                  type="text"
                  value={formData.travelInfo.usAddress}
                  onChange={(e) => updateFormData('travelInfo', 'usAddress', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Hotel or residence address in the US"
                />
                {errors.usAddress && <p className="mt-1 text-sm text-red-400">{errors.usAddress}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
                <input
                  type="text"
                  value={formData.travelInfo.usCity}
                  onChange={(e) => updateFormData('travelInfo', 'usCity', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="New York"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">State</label>
                <input
                  type="text"
                  value={formData.travelInfo.usState}
                  onChange={(e) => updateFormData('travelInfo', 'usState', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="NY"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Who is paying for your trip?</label>
                <select
                  value={formData.travelInfo.payingForTrip}
                  onChange={(e) => updateFormData('travelInfo', 'payingForTrip', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="" className="bg-slate-800">Select</option>
                  <option value="SELF" className="bg-slate-800">Self</option>
                  <option value="EMPLOYER" className="bg-slate-800">Employer</option>
                  <option value="FAMILY" className="bg-slate-800">Family Member</option>
                  <option value="SPONSOR" className="bg-slate-800">Sponsor</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-6">Review Your Application</h3>

            <div className="space-y-6">
              {/* Personal Info Summary */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-400">Name:</span> <span className="text-white ml-2">{formData.personalInfo.surnames} {formData.personalInfo.givenNames}</span></div>
                  <div><span className="text-gray-400">DOB:</span> <span className="text-white ml-2">{formData.personalInfo.dateOfBirth}</span></div>
                  <div><span className="text-gray-400">Nationality:</span> <span className="text-white ml-2">{formData.personalInfo.nationality}</span></div>
                  <div><span className="text-gray-400">Birth Place:</span> <span className="text-white ml-2">{formData.personalInfo.cityOfBirth}, {formData.personalInfo.countryOfBirth}</span></div>
                </div>
              </div>

              {/* Contact Info Summary */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-400">Email:</span> <span className="text-white ml-2">{formData.contactInfo.email}</span></div>
                  <div><span className="text-gray-400">Phone:</span> <span className="text-white ml-2">{formData.contactInfo.phone}</span></div>
                  <div className="col-span-2"><span className="text-gray-400">Address:</span> <span className="text-white ml-2">{formData.contactInfo.streetAddress}, {formData.contactInfo.city}, {formData.contactInfo.country}</span></div>
                </div>
              </div>

              {/* Passport Summary */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Passport Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-400">Passport #:</span> <span className="text-white ml-2">{formData.passportInfo.passportNumber}</span></div>
                  <div><span className="text-gray-400">Country:</span> <span className="text-white ml-2">{formData.passportInfo.countryOfIssuance}</span></div>
                  <div><span className="text-gray-400">Issued:</span> <span className="text-white ml-2">{formData.passportInfo.issuanceDate}</span></div>
                  <div><span className="text-gray-400">Expires:</span> <span className="text-white ml-2">{formData.passportInfo.expirationDate}</span></div>
                </div>
              </div>

              {/* Travel Summary */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <Plane className="w-5 h-5" />
                  Travel Plans
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-400">Purpose:</span> <span className="text-white ml-2">{formData.travelInfo.purposeOfTrip}</span></div>
                  <div><span className="text-gray-400">Arrival:</span> <span className="text-white ml-2">{formData.travelInfo.intendedArrivalDate}</span></div>
                  <div className="col-span-2"><span className="text-gray-400">US Address:</span> <span className="text-white ml-2">{formData.travelInfo.usAddress}, {formData.travelInfo.usCity} {formData.travelInfo.usState}</span></div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-white/5 border border-white/20 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-white flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-medium mb-1">Important Notice</h4>
                    <p className="text-sm text-gray-400">
                      Please review all information carefully before submitting. Once submitted, you may need to start a new application to make changes. Providing false information may result in visa denial.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">DS-160 Visa Application</h1>
          <p className="text-gray-400">Complete your nonimmigrant visa application</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                  step.status === 'completed'
                    ? 'bg-white border-white text-black'
                    : step.status === 'current'
                    ? 'bg-white/20 border-white text-white'
                    : 'bg-white/5 border-white/20 text-gray-400'
                }`}>
                  {step.status === 'completed' ? <Check className="w-6 h-6" /> : step.icon}
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden md:block w-24 h-1 mx-2 rounded ${
                    step.status === 'completed' ? 'bg-white' : 'bg-white/10'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <span key={step.id} className={`text-xs font-medium ${
                step.status === 'current' ? 'text-white' : 'text-gray-500'
              }`}>
                {step.name}
              </span>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Draft
              </button>

              {currentStep < 5 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-all"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  Submit Application
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
