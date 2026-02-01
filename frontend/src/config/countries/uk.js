export const ukConfig = {
    code: 'UK',
    name: 'United Kingdom',
    flag: '🇬🇧',
    visaTypes: [
        'Standard Visitor Visa',
        'Student Visa (Tier 4)',
        'Skilled Worker Visa',
        'Family Visa',
        'Youth Mobility Scheme',
        'Business Visitor Visa'
    ],
    formSections: [
        'Personal Details',
        'Passport & Travel Document',
        'Travel History',
        'Family Details',
        'Accommodation & Travel Plans',
        'Employment & Income',
        'Education History',
        'Medical & Character',
        'Additional Information',
        'Declaration & Submit'
    ],
    validationRules: {
        passportExpiry: 'Valid passport required, blank page for visa',
        nameFormat: 'Name exactly as shown in passport',
        dateFormat: 'DD/MM/YYYY'
    },
    requiredDocuments: [
        'Valid Passport (with blank page)',
        'Digital Photo (meeting UK specifications)',
        'Proof of Financial Means',
        'Bank Statements (6 months)',
        'Employment/Business Evidence',
        'Accommodation Details',
        'Travel Itinerary',
        'Tuberculosis Test Results (required for Mongolia)',
        'Previous UK Visa Copies (if applicable)',
        'Sponsor Details (if applicable)',
        'English Language Test (for some visa types)'
    ],
    interviewRequired: false,
    processingTimeline: '3-6 weeks standard, priority service available',
    paymentPricing: {
        baseFee: 115,
        currency: 'GBP',
        serviceFee: 35
    },
    helpText: {
        ties: 'Demonstrate strong reasons to return home after your visit.',
        financials: 'Show you can support yourself without public funds.',
        purpose: 'Be specific about what you plan to do and where you will stay.',
        history: 'Honest travel history is essential - never hide previous refusals.',
        tb: 'TB test must be from an approved clinic and valid for 6 months.'
    },
    embassyRequirements: 'Apply online via gov.uk. Attend appointment at VFS Global for biometrics. TB test required for stays over 6 months.',
    localizedTerms: {
        en: {
            visa: 'Visa',
            permit: 'Permit',
            application: 'Application',
            biometrics: 'Biometrics'
        },
        mn: {
            visa: 'Виз',
            permit: 'Зөвшөөрөл',
            application: 'Өргөдөл',
            biometrics: 'Биометрик'
        }
    }
};
