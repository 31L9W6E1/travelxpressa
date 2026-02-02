import api, { type ApiResponse, type PaginatedResponse, handleApiError } from './client';

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

export interface FamilyInfo {
  fatherSurnames: string;
  fatherGivenNames: string;
  fatherDateOfBirth?: string;
  isFatherInUS: boolean;
  fatherUSStatus?: string;
  motherSurnames: string;
  motherGivenNames: string;
  motherDateOfBirth?: string;
  isMotherInUS: boolean;
  motherUSStatus?: string;
  hasSpouse: boolean;
  spouseFullName?: string;
  spouseDateOfBirth?: string;
  spouseNationality?: string;
  spouseCityOfBirth?: string;
  spouseCountryOfBirth?: string;
  spouseAddress?: string;
  spouseAddressSameAsApplicant?: boolean;
  hasChildren: boolean;
  children?: Array<{
    fullName: string;
    dateOfBirth: string;
    relationship: string;
  }>;
  hasImmediateRelativesInUS: boolean;
  immediateRelativesInUS?: Array<{
    fullName: string;
    relationship: string;
    status: string;
  }>;
  hasOtherRelativesInUS: boolean;
  otherRelativesInUS?: Array<{
    fullName: string;
    relationship: string;
    status: string;
  }>;
}

export interface WorkEducationInfo {
  primaryOccupation: string;
  presentEmployerName?: string;
  presentEmployerAddress?: string;
  presentEmployerCity?: string;
  presentEmployerState?: string;
  presentEmployerPostalCode?: string;
  presentEmployerCountry?: string;
  presentEmployerPhone?: string;
  monthlySalary?: string;
  jobDuties?: string;
  startDate?: string;
  wasPreviouslyEmployed: boolean;
  previousEmployment?: Array<{
    employerName: string;
    employerAddress?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
    jobTitle: string;
    supervisorSurname?: string;
    supervisorGivenName?: string;
    startDate: string;
    endDate: string;
    duties?: string;
  }>;
  hasAttendedEducation: boolean;
  education?: Array<{
    institutionName: string;
    institutionAddress?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    courseOfStudy: string;
    startDate: string;
    endDate: string;
  }>;
  belongsToClanOrTribe: boolean;
  clanOrTribeName?: string;
  languages: string[];
  hasVisitedCountriesLastFiveYears: boolean;
  countriesVisited?: string[];
  belongsToProfessionalOrg: boolean;
  professionalOrgs?: string[];
  hasSpecializedSkills: boolean;
  specializedSkillsDescription?: string;
  hasServedInMilitary: boolean;
  militaryService?: {
    country: string;
    branch: string;
    rank?: string;
    specialty?: string;
    startDate: string;
    endDate: string;
  };
}

export interface SecurityInfo {
  hasCommunicableDisease: boolean;
  hasMentalOrPhysicalDisorder: boolean;
  isDrugAbuser: boolean;
  hasBeenArrested: boolean;
  arrestDetails?: string;
  hasViolatedControlledSubstancesLaw: boolean;
  isEngagedInProstitution: boolean;
  isInvolvedInMoneyLaundering: boolean;
  hasCommittedHumanTrafficking: boolean;
  hasBenefitedFromTrafficking: boolean;
  hasAidedHumanTrafficking: boolean;
  seeksEspionage: boolean;
  seeksToEngageInTerrorism: boolean;
  hasProvidedTerroristSupport: boolean;
  isTerroristOrganizationMember: boolean;
  isRelatedToTerrorist: boolean;
  hasParticipatedInGenocide: boolean;
  hasParticipatedInTorture: boolean;
  hasParticipatedInExtrajudicialKillings: boolean;
  hasRecruitedChildSoldiers: boolean;
  hasViolatedReligiousFreedom: boolean;
  hasEnforcedPopulationControls: boolean;
  hasInvolvedInOrganTrafficking: boolean;
  hasSoughtVisaByFraud: boolean;
  hasBeenRemovedOrDeported: boolean;
  hasWithheldCustodyOfUSCitizen: boolean;
  hasVotedInUSIllegally: boolean;
  hasRenouncedUSCitizenshipToAvoidTax: boolean;
  hasBeenInUS: boolean;
  usVisitDetails?: string;
  hasBeenIssuedUSVisa: boolean;
  lastVisaDetails?: string;
  hasBeenRefusedUSVisa: boolean;
  refusalDetails?: string;
  hasImmigrantPetitionFiled: boolean;
  petitionDetails?: string;
}

export interface DocumentInfo {
  photo?: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: string;
  };
  invitationLetter?: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: string;
  };
  additionalDocuments?: Array<{
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: string;
    documentType: string;
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
  familyInfo?: FamilyInfo;
  workEducation?: WorkEducationInfo;
  securityInfo?: SecurityInfo;
  documents?: DocumentInfo;
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
  familyInfo?: FamilyInfo;
  workEducation?: WorkEducationInfo;
  securityInfo?: SecurityInfo;
  documents?: DocumentInfo;
}

// Applications API
export const applicationsApi = {
  async create(data: CreateApplicationInput): Promise<Application> {
    try {
      const response = await api.post<ApiResponse<Application>>('/api/applications', data);
      return response.data.data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getAll(page = 1, limit = 20): Promise<PaginatedResponse<Application>> {
    try {
      const response = await api.get<PaginatedResponse<Application>>('/api/applications', {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getById(id: string): Promise<Application> {
    try {
      const response = await api.get<ApiResponse<Application>>(`/api/applications/${id}`);
      return response.data.data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async update(id: string, data: UpdateApplicationInput): Promise<Application> {
    try {
      const response = await api.patch<ApiResponse<Application>>(`/api/applications/${id}`, data);
      return response.data.data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async submit(id: string): Promise<Application> {
    try {
      const response = await api.post<ApiResponse<Application>>(`/api/applications/${id}/submit`);
      return response.data.data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/api/applications/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

export default applicationsApi;
