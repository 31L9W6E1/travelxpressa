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
interface SecurityQuestionsFormProps {
    data?: SecurityInfo;
    onSave: (data: SecurityInfo) => Promise<void>;
    onNext: () => void;
    onPrev: () => void;
}
export default function SecurityQuestionsForm({ data, onSave, onNext, onPrev }: SecurityQuestionsFormProps): import("react/jsx-runtime").JSX.Element;
export {};
