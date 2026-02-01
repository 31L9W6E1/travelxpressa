export const australiaConfig = {
    code: 'AUSTRALIA',
    name: 'Australia',
    flag: '🇦🇺',
    visaTypes: [
        'Visitor Visa (subclass 600)',
        'Student Visa (subclass 500)',
        'Work and Holiday Visa (subclass 462)',
        'Skilled Worker Visa',
        'Partner Visa',
        'Business Visitor Visa'
    ],
    formSections: [
        'Personal Particulars',
        'Passport Details',
        'Contact Information',
        'Travel Details',
        'Employment History',
        'Education Background',
        'Financial Capacity',
        'Health Requirements',
        'Character Requirements',
        'Review & Submit'
    ],
    validationRules: {
        passportExpiry: 'Valid for at least 6 months beyond intended stay',
        nameFormat: 'Name as per passport, include all given names',
        dateFormat: 'DD/MM/YYYY'
    },
    requiredDocuments: [
        'Valid Passport',
        'Digital Photograph',
        'Proof of Funds',
        'Bank Statements (3-6 months)',
        'Employment Evidence',
        'Travel Itinerary',
        'Health Insurance',
        'Character Documents (police clearance for long stays)',
        'Health Examination (for some visa types)',
        'Genuine Temporary Entrant Statement',
        'Previous Australian Visa (if applicable)'
    ],
    interviewRequired: false,
    processingTimeline: '20-30 days for visitor visa, varies by visa type',
    paymentPricing: {
        baseFee: 190,
        currency: 'AUD',
        serviceFee: 50
    },
    helpText: {
        ties: 'Demonstrate genuine temporary entrant intent - job, family, property in Mongolia.',
        financials: 'Show sufficient funds: AUD $5,000+ recommended for tourist visa.',
        purpose: 'Clearly state your reason for visiting and planned activities.',
        history: 'Travel history helps. Be honest about any visa refusals.',
        health: 'Health exam required for stays over 3 months or certain occupations.'
    },
    embassyRequirements: 'Apply online through ImmiAccount. Biometrics collection required. Health examinations at approved clinics.',
    localizedTerms: {
        en: {
            visa: 'Visa',
            permit: 'Permit',
            application: 'Application',
            subclass: 'Subclass'
        },
        mn: {
            visa: 'Виз',
            permit: 'Зөвшөөрөл',
            application: 'Өргөдөл',
            subclass: 'Дэд ангилал'
        }
    }
};
