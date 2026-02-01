import { CountryConfig } from './types';

export const koreaConfig: CountryConfig = {
  code: 'KOREA',
  name: 'South Korea',
  flag: '🇰🇷',
  visaTypes: [
    'C-3 (Short-term Visit)',
    'D-2 (Student)',
    'E-2 (Teaching)',
    'H-1 (Working Holiday)',
    'F-4 (Overseas Korean)',
    'D-10 (Job Seeking)'
  ],
  formSections: [
    'Basic Information',
    'Passport Details',
    'Travel Purpose',
    'Accommodation',
    'Financial Proof',
    'Invitation Letter',
    'Work/Study Details',
    'Review & Submit'
  ],
  validationRules: {
    passportExpiry: 'Valid for at least 6 months beyond intended stay',
    nameFormat: 'Romanized name as per passport',
    dateFormat: 'YYYY-MM-DD'
  },
  requiredDocuments: [
    'Valid Passport',
    'Passport-size Photo (3.5x4.5cm)',
    'Invitation Letter',
    'Bank Statement (3 months)',
    'Round-trip Flight Itinerary',
    'Accommodation Proof',
    'Employment Certificate'
  ],
  interviewRequired: false,
  processingTimeline: '5-10 business days for standard processing',
  paymentPricing: {
    baseFee: 90,
    currency: 'USD',
    serviceFee: 40
  },
  helpText: {
    personal: 'Enter your romanized name exactly as it appears in your passport.',
    invitation: 'An invitation letter from a Korean sponsor is required for most visa types.',
    financial: 'Bank statements must show sufficient funds for your stay (minimum $1,000/month).',
    accommodation: 'Provide hotel booking or host address in Korea.',
    purpose: 'Clearly state the purpose and duration of your visit.'
  },
  embassyRequirements: 'Submit application at Korean Embassy or apply online for K-ETA (Electronic Travel Authorization) if eligible.',
  localizedTerms: {
    en: {
      visa: 'Visa',
      application: 'Application',
      invitation: 'Invitation Letter',
      sponsor: 'Sponsor'
    },
    mn: {
      visa: 'Виз',
      application: 'Өргөдөл',
      invitation: 'Урилгын захидал',
      sponsor: 'Ивээн тэтгэгч'
    }
  }
};
