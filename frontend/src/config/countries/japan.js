export const japanConfig = {
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
        'Visa Application Form',
        'Flight Itinerary',
        'Hotel Reservations or Invitation Letter',
        'Bank Statements (3 months)',
        'Employment Certificate',
        'Income Tax Return',
        'Daily Schedule/Itinerary',
        'Guarantee Letter (if applicable)'
    ],
    interviewRequired: false,
    processingTimeline: '5-7 business days for tourist visa, longer for work/student visas',
    paymentPricing: {
        baseFee: 3000,
        currency: 'JPY',
        serviceFee: 5000
    },
    helpText: {
        ties: 'Provide evidence of ties to Mongolia: employment, property ownership, family.',
        financials: 'Show stable income and sufficient funds for the trip duration.',
        purpose: 'Provide detailed daily itinerary with specific locations and dates.',
        history: 'Previous travel to developed countries strengthens your application.',
        guarantor: 'Japanese guarantor or inviter can significantly help your application.'
    },
    embassyRequirements: 'Apply through authorized travel agency in Mongolia. Direct application at Embassy not accepted for most visa types.',
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
