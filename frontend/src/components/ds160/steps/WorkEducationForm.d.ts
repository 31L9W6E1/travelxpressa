export interface WorkEducationInfo {
    primaryOccupation?: string;
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
    wasPreviouslyEmployed?: boolean;
    previousEmployment?: Array<{
        employerName?: string;
        employerAddress?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
        phone?: string;
        jobTitle?: string;
        supervisorSurname?: string;
        supervisorGivenName?: string;
        startDate?: string;
        endDate?: string;
        duties?: string;
    }>;
    hasAttendedEducation?: boolean;
    education?: Array<{
        institutionName?: string;
        institutionAddress?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
        courseOfStudy?: string;
        startDate?: string;
        endDate?: string;
    }>;
    belongsToClanOrTribe?: boolean;
    clanOrTribeName?: string;
    languages?: string[];
    hasVisitedCountriesLastFiveYears?: boolean;
    countriesVisited?: string[];
    belongsToProfessionalOrg?: boolean;
    professionalOrgs?: string[];
    hasSpecializedSkills?: boolean;
    specializedSkillsDescription?: string;
    hasServedInMilitary?: boolean;
    militaryService?: {
        country?: string;
        branch?: string;
        rank?: string;
        specialty?: string;
        startDate?: string;
        endDate?: string;
    };
}
interface WorkEducationFormProps {
    data?: WorkEducationInfo;
    onSave: (data: WorkEducationInfo) => Promise<void>;
    onNext: () => void;
    onPrev: () => void;
}
export default function WorkEducationForm({ data, onSave, onNext, onPrev }: WorkEducationFormProps): import("react/jsx-runtime").JSX.Element;
export {};
