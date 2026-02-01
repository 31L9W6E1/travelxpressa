export const newZealandConfig = {
    code: 'NEW_ZEALAND',
    name: 'New Zealand',
    flag: '🇳🇿',
    visaTypes: [
        'Visitor Visa',
        'Student Visa',
        'Work Visa',
        'Working Holiday Visa',
        'Partner/Family Visa',
        'Business Visitor Visa'
    ],
    formSections: [
        'Identity Details',
        'Passport Information',
        'Contact Details',
        'Character & Health',
        'Travel Plans',
        'Funds & Sponsorship',
        'Employment Details',
        'Education History',
        'Immigration History',
        'Review & Submit'
    ],
    validationRules: {
        passportExpiry: 'Valid for at least 3 months beyond intended departure',
        nameFormat: 'Full legal name as per passport',
        dateFormat: 'DD/MM/YYYY'
    },
    requiredDocuments: [
        'Valid Passport',
        'Passport Photo (digital)',
        'Evidence of Funds (NZD $1,000/month minimum)',
        'Bank Statements',
        'Return or Onward Travel Evidence',
        'Accommodation Details',
        'Employment Letter',
        'Health and Character Documents',
        'Chest X-ray (if required)',
        'Police Certificate (for long stays)',
        'Sponsorship Form (if applicable)'
    ],
    interviewRequired: false,
    processingTimeline: '20-25 working days for visitor visa',
    paymentPricing: {
        baseFee: 211,
        currency: 'NZD',
        serviceFee: 45
    },
    helpText: {
        ties: 'Show you intend to leave NZ - employment, family, property in Mongolia.',
        financials: 'Demonstrate NZD $1,000 per month of stay, or sponsorship.',
        purpose: 'Be specific about your travel plans and activities in New Zealand.',
        history: 'Honest disclosure of travel history and any visa issues is essential.',
        health: 'Chest X-ray required for stays over 6 months.'
    },
    embassyRequirements: 'Apply online through Immigration New Zealand website. No physical visa label - visa is electronic (eVisa). Biometrics may be required.',
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
