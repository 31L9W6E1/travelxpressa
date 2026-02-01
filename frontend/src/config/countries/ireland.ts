import { CountryConfig } from './types';

export const irelandConfig: CountryConfig = {
  code: 'IRELAND',
  name: 'Ireland',
  flag: '🇮🇪',
  visaTypes: [
    'Short Stay Visa (C)',
    'Long Stay Visa (D)',
    'Study Visa',
    'Work Visa (Employment Permit)',
    'Join Family Visa',
    'Business Visa'
  ],
  formSections: [
    'Personal Details',
    'Passport Information',
    'Travel Details',
    'Accommodation in Ireland',
    'Employment/Education History',
    'Financial Information',
    'Family Information',
    'Previous Immigration History',
    'Sponsor/Reference Details',
    'Review & Submit'
  ],
  validationRules: {
    passportExpiry: 'Valid for at least 6 months after intended departure from Ireland',
    nameFormat: 'Full legal name as per passport',
    dateFormat: 'DD/MM/YYYY'
  },
  requiredDocuments: [
    'Valid Passport',
    'Passport Photos (35mm x 45mm)',
    'Completed Application Summary',
    'Letter Explaining Purpose of Visit',
    'Flight Booking (do not purchase until visa approved)',
    'Accommodation Proof',
    'Bank Statements (6 months)',
    'Employment Letter',
    'Travel Insurance',
    'Invitation Letter (if visiting family/friends)',
    'Previous Visa Copies'
  ],
  interviewRequired: false,
  processingTimeline: '8-12 weeks standard processing',
  paymentPricing: {
    baseFee: 60,
    currency: 'EUR',
    serviceFee: 25
  },
  helpText: {
    ties: 'Strong ties to home country are essential - job, property, family responsibilities.',
    financials: 'Demonstrate access to €3,000+ in readily available funds.',
    purpose: 'Explain clearly and concisely why you want to visit Ireland.',
    history: 'Travel history to UK, Schengen, US, Canada, Australia is viewed favorably.',
    sponsor: 'If being sponsored, include sponsor\'s Irish residency proof and financials.'
  },
  embassyRequirements: 'Apply online through AVATS system, then submit documents to VFS Global or Embassy. Biometrics may be required.',
  localizedTerms: {
    en: {
      visa: 'Visa',
      permit: 'Permit',
      application: 'Application',
      sponsor: 'Sponsor'
    },
    mn: {
      visa: 'Виз',
      permit: 'Зөвшөөрөл',
      application: 'Өргөдөл',
      sponsor: 'Ивээн тэтгэгч'
    }
  }
};
