import { CountryConfig } from './types';

export const japanConfig: CountryConfig = {
  code: 'JAPAN',
  name: 'Japan',
  flag: '🇯🇵',
  visaTypes: [
    'Tourist Visa (Short-term Stay)',
    'Work Visa (Engineer/Specialist)',
    'Student Visa',
    'Business Visa',
    'Spouse/Dependent Visa',
    'Working Holiday Visa'
  ],
  formSections: [
    'Personal Details',
    'Passport Information',
    'Travel Itinerary',
    'Accommodation Details',
    'Employment Information',
    'Financial Information',
    'Guarantor/Inviter Details',
    'Previous Japan Visits',
    'Review & Submit'
  ],
  validationRules: {
    passportExpiry: 'Valid for at least 6 months beyond travel dates',
    nameFormat: 'Name exactly as per passport',
    dateFormat: 'YYYY-MM-DD'
  },
  requiredDocuments: [
    'Valid Passport',
    'Passport-size Photo (4.5cm x 4.5cm, white background)',
    'Visa Application Form (prepared after applicant fills form data)',
    'Flight Itinerary (service supported)',
    'Hotel Reservations (service supported)',
    'Invitation Letter / Guarantee Letter (optional)',
    'Bank Statements (6 months summary)',
    'Employment Certificate or School Certificate',
    'Income Tax Return',
    'Travel Itinerary (service supported)'
  ],
  interviewRequired: false,
  processingTimeline: '5-7 business days for tourist visa, longer for work/student visas',
  paymentPricing: {
    baseFee: 104000,
    currency: 'MNT',
    serviceFee: 218400
  },
  helpText: {
    ties: 'Provide evidence of ties to Mongolia: employment, property ownership, family.',
    financials: 'Show stable income and sufficient funds for the trip duration.',
    purpose: 'Provide detailed daily itinerary with specific locations and dates.',
    history: 'Previous travel to developed countries strengthens your application.',
    guarantor: 'Japanese guarantor or inviter can significantly help your application.'
  },
  embassyRequirements: 'Applications can be processed via online submission and VAC/Embassy channel based on case requirements.',
  localizedTerms: {
    en: {
      visa: 'Visa',
      permit: 'Permit',
      application: 'Application',
      guarantor: 'Guarantor'
    },
    mn: {
      visa: 'Виз',
      permit: 'Зөвшөөрөл',
      application: 'Өргөдөл',
      guarantor: 'Батлан даагч'
    }
  }
};
