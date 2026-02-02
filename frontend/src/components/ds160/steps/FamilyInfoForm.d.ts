export interface FamilyInfo {
    fatherSurnames?: string;
    fatherGivenNames?: string;
    fatherDateOfBirth?: string;
    isFatherInUS?: boolean;
    fatherUSStatus?: string;
    motherSurnames?: string;
    motherGivenNames?: string;
    motherDateOfBirth?: string;
    isMotherInUS?: boolean;
    motherUSStatus?: string;
    hasSpouse?: boolean;
    spouseFullName?: string;
    spouseDateOfBirth?: string;
    spouseNationality?: string;
    spouseCityOfBirth?: string;
    spouseCountryOfBirth?: string;
    spouseAddress?: string;
    spouseAddressSameAsApplicant?: boolean;
    hasChildren?: boolean;
    children?: Array<{
        fullName?: string;
        dateOfBirth?: string;
        relationship?: string;
    }>;
    hasImmediateRelativesInUS?: boolean;
    immediateRelativesInUS?: Array<{
        fullName?: string;
        relationship?: string;
        status?: string;
    }>;
    hasOtherRelativesInUS?: boolean;
    otherRelativesInUS?: Array<{
        fullName?: string;
        relationship?: string;
        status?: string;
    }>;
}
interface FamilyInfoFormProps {
    data?: FamilyInfo;
    onSave: (data: FamilyInfo) => Promise<void>;
    onNext: () => void;
    onPrev: () => void;
}
export default function FamilyInfoForm({ data, onSave, onNext, onPrev }: FamilyInfoFormProps): import("react/jsx-runtime").JSX.Element;
export {};
