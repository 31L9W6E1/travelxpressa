import { CountryConfig } from './types';

export const usaConfig: CountryConfig = {
  code: 'USA',
  name: 'United States',
  flag: '🇺🇸',
  visaTypes: [
    'B1/B2 (Business/Tourist)',
    'F1 (Student)',
    'J1 (Exchange Visitor)',
    'H1B (Work)',
    'K1 (Fiance)',
    'L1 (Intracompany Transfer)'
  ],
  formSections: [
    'Personal Information',
    'Passport Details',
    'Travel Plans',
    'Previous US Travel',
    'US Point of Contact',
    'Family Information',
    'Work/Education',
    'Security Questions',
    'Review & Submit'
  ],
  validationRules: {
    passportExpiry: 'Must be valid for at least 6 months beyond intended stay',
    nameFormat: 'Full legal name exactly as shown in passport',
    dateFormat: 'MM/DD/YYYY'
  },
  requiredDocuments: [
    'Valid Passport',
    'Digital Photo (2x2 inches)',
    'DS-160 Confirmation Page',
    'SEVIS Fee Receipt (for students)',
    'Invitation Letter (if applicable)',
    'Financial Documents',
    'Employment Letter',
    'Previous US Visas (if any)'
  ],
  interviewRequired: true,
  processingTimeline: 'Appointment availability varies by location; visa processing is typically 1-2 weeks after interview',
  paymentPricing: {
    // Displayed in MNT for local clarity (approx equivalent to current government fee board rates).
    baseFee: 666000,
    currency: 'MNT',
    serviceFee: 50
  },
  helpText: {
    personal: 'Enter your details exactly as they appear in your passport. Any discrepancy may cause delays.',
    passport: 'Your passport must be valid for at least 6 months beyond your intended period of stay.',
    travel: 'Provide a detailed itinerary including dates, addresses, and purpose of each location.',
    contact: 'You must have a US contact person or organization for your visit.',
    family: 'List all immediate family members including those not traveling with you.',
    work: 'Provide complete employment history for the past 10 years.',
    security: 'Answer all security questions truthfully. False information may result in permanent visa denial.'
  },
  embassyRequirements: 'Biometric fingerprint scan and in-person interview required at US Embassy. Arrive 15 minutes early.',
  localizedTerms: {
    en: {
      visa: 'Visa',
      application: 'Application',
      interview: 'Interview',
      appointment: 'Appointment',
      passport: 'Passport',
      photo: 'Photo'
    },
    mn: {
      visa: 'Виз',
      application: 'Өргөдөл',
      interview: 'Ярилцлага',
      appointment: 'Цаг товлолт',
      passport: 'Гадаад паспорт',
      photo: 'Зураг'
    }
  }
};
