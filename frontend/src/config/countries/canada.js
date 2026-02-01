export const canadaConfig = {
    code: 'CANADA',
    name: 'Canada',
    flag: '🇨🇦',
    visaTypes: [
        'Visitor Visa (TRV)',
        'Study Permit',
        'Work Permit',
        'Super Visa (Parents/Grandparents)',
        'Working Holiday (IEC)',
        'Express Entry'
    ],
    formSections: [
        'Personal Details',
        'Passport Information',
        'Travel History',
        'Purpose of Visit',
        'Ties to Home Country',
        'Financial Information',
        'Background Information',
        'Biometrics',
        'Review & Submit'
    ],
    validationRules: {
        passportExpiry: 'Valid through entire intended stay',
        nameFormat: 'Legal name as per passport',
        dateFormat: 'YYYY-MM-DD'
    },
    requiredDocuments: [
        'Valid Passport',
        'Digital Photo',
        'Letter of Invitation (if applicable)',
        'Proof of Funds (4 months bank statements)',
        'Employment Letter',
        'Property Documents (ties to home)',
        'Travel History Proof',
        'Medical Exam Results (if required)'
    ],
    interviewRequired: false,
    processingTimeline: '2-8 weeks depending on visa type and country of residence',
    paymentPricing: {
        baseFee: 100,
        currency: 'CAD',
        serviceFee: 45
    },
    helpText: {
        ties: 'Demonstrate strong ties to your home country (property, employment, family).',
        financials: 'Show bank statements proving funds of CAD $1,000/month minimum.',
        purpose: 'Clearly explain purpose of visit and intended activities.',
        history: 'Previous travel history to other countries strengthens your application.',
        biometrics: 'Biometrics collection at designated VAC required.'
    },
    embassyRequirements: 'Apply online through IRCC portal. Biometrics collection at Visa Application Centre (VAC) within 30 days.',
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
