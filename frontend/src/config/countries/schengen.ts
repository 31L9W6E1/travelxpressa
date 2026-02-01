import { CountryConfig } from './types';

export const schengenConfig: CountryConfig = {
  code: 'SCHENGEN',
  name: 'Schengen Area',
  flag: '🇪🇺',
  visaTypes: [
    'Type C (Short-stay up to 90 days)',
    'Type D (Long-stay/National Visa)',
    'Airport Transit Visa',
    'Multiple Entry Visa'
  ],
  formSections: [
    'Personal Information',
    'Passport Details',
    'Travel Itinerary',
    'Accommodation Details',
    'Travel Insurance',
    'Financial Proof',
    'Purpose of Visit',
    'Previous Schengen Visas',
    'Review & Submit'
  ],
  validationRules: {
    passportExpiry: 'Valid for at least 3 months beyond return date with 2 blank pages',
    nameFormat: 'Full name as per passport',
    dateFormat: 'DD/MM/YYYY'
  },
  requiredDocuments: [
    'Valid Passport (10 years old max)',
    'Passport Photos (35x45mm)',
    'Travel Medical Insurance (€30,000 minimum)',
    'Hotel Bookings/Accommodation Proof',
    'Round-trip Flight Tickets',
    'Bank Statements (3 months)',
    'Employment Letter',
    'Travel Itinerary',
    'Cover Letter'
  ],
  interviewRequired: true,
  processingTimeline: '15-30 calendar days, may extend to 60 days in peak season',
  paymentPricing: {
    baseFee: 80,
    currency: 'EUR',
    serviceFee: 50
  },
  helpText: {
    insurance: 'Travel insurance must cover minimum €30,000 with medical repatriation.',
    itinerary: 'Provide detailed day-by-day travel plan with dates and locations.',
    accommodation: 'Hotel reservations for entire stay or invitation from host.',
    financial: 'Prove you have €100/day for your stay.',
    destination: 'Apply at embassy of main destination or first entry country.'
  },
  embassyRequirements: 'Apply at embassy/consulate of main destination country. Biometric data collection required.',
  localizedTerms: {
    en: {
      visa: 'Schengen Visa',
      application: 'Application',
      insurance: 'Travel Insurance',
      itinerary: 'Travel Itinerary'
    },
    mn: {
      visa: 'Шенгений Виз',
      application: 'Өргөдөл',
      insurance: 'Аялалын даатгал',
      itinerary: 'Аялалын төлөвлөгөө'
    }
  }
};
