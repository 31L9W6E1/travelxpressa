export interface ValidationRules {
    passportExpiry: string;
    nameFormat: string;
    dateFormat: string;
}
export interface PaymentPricing {
    baseFee: number;
    currency: string;
    serviceFee: number;
}
export interface LocalizedTerms {
    en: Record<string, string>;
    mn: Record<string, string>;
}
export interface HelpText {
    [key: string]: string;
}
export interface FormSection {
    id: string;
    name: string;
    description?: string;
    fields: FormField[];
}
export interface FormField {
    id: string;
    name: string;
    type: 'text' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'file';
    required: boolean;
    placeholder?: string;
    helpText?: string;
    options?: {
        value: string;
        label: string;
    }[];
    validation?: {
        pattern?: string;
        minLength?: number;
        maxLength?: number;
        min?: string;
        max?: string;
    };
}
export interface CountryConfig {
    code: string;
    name: string;
    flag: string;
    visaTypes: string[];
    formSections: string[];
    detailedSections?: FormSection[];
    validationRules: ValidationRules;
    requiredDocuments: string[];
    interviewRequired: boolean;
    processingTimeline: string;
    paymentPricing: PaymentPricing;
    helpText: HelpText;
    embassyRequirements: string;
    localizedTerms: LocalizedTerms;
}
export type CountryCode = 'USA' | 'KOREA' | 'SCHENGEN' | 'CANADA' | 'JAPAN' | 'IRELAND' | 'UK' | 'AUSTRALIA' | 'NEW_ZEALAND';
export interface CountryStore {
    selectedCountry: CountryCode | null;
    selectedVisaType: string | null;
    setCountry: (country: CountryCode) => void;
    setVisaType: (visaType: string) => void;
    getConfig: () => CountryConfig | null;
    clearSelection: () => void;
}
