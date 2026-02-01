import { type PaginatedResponse } from './client';
export type VisaType = 'B1_B2' | 'F1' | 'J1' | 'H1B' | 'L1' | 'O1' | 'K1' | 'OTHER';
export type ApplicationStatus = 'DRAFT' | 'IN_PROGRESS' | 'SUBMITTED' | 'UNDER_REVIEW' | 'COMPLETED' | 'REJECTED';
export interface PersonalInfo {
    surnames: string;
    givenNames: string;
    fullNameNative?: string;
    otherNamesUsed: boolean;
    otherNames?: string[];
    telCode: string;
    sex: 'M' | 'F';
    maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED';
    dateOfBirth: string;
    cityOfBirth: string;
    stateOfBirth?: string;
    countryOfBirth: string;
    nationality: string;
}
export interface Address {
    street: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
}
export interface ContactInfo {
    homeAddress: Address;
    mailingAddress?: Address;
    phone: string;
    secondaryPhone?: string;
    workPhone?: string;
    email: string;
}
export interface PassportInfo {
    passportType: 'REGULAR' | 'OFFICIAL' | 'DIPLOMATIC' | 'OTHER';
    passportNumber: string;
    passportBookNumber?: string;
    countryOfIssuance: string;
    cityOfIssuance: string;
    stateOfIssuance?: string;
    issuanceDate: string;
    expirationDate: string;
    hasOtherPassport: boolean;
    otherPassportInfo?: {
        number: string;
        country: string;
    };
}
export interface USAddress {
    street: string;
    city: string;
    state: string;
    zipCode?: string;
}
export interface TravelInfo {
    purposeOfTrip: string;
    specificPurpose?: string;
    intendedArrivalDate: string;
    intendedLengthOfStay: string;
    addressWhileInUS: USAddress;
    payingForTrip: string;
    travelingWithOthers: boolean;
    companions?: Array<{
        name: string;
        relationship: string;
    }>;
}
export interface Application {
    id: string;
    userId: string;
    visaType: VisaType;
    status: ApplicationStatus;
    currentStep: number;
    personalInfo?: PersonalInfo;
    contactInfo?: ContactInfo;
    passportInfo?: PassportInfo;
    travelInfo?: TravelInfo;
    photoUrl?: string;
    confirmationNumber?: string;
    adminNotes?: string;
    createdAt: string;
    updatedAt: string;
    submittedAt?: string;
}
export interface CreateApplicationInput {
    visaType: VisaType;
}
export interface UpdateApplicationInput {
    currentStep?: number;
    personalInfo?: PersonalInfo;
    contactInfo?: ContactInfo;
    passportInfo?: PassportInfo;
    travelInfo?: TravelInfo;
}
export declare const applicationsApi: {
    create(data: CreateApplicationInput): Promise<Application>;
    getAll(page?: number, limit?: number): Promise<PaginatedResponse<Application>>;
    getById(id: string): Promise<Application>;
    update(id: string, data: UpdateApplicationInput): Promise<Application>;
    submit(id: string): Promise<Application>;
    delete(id: string): Promise<void>;
};
export default applicationsApi;
