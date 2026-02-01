import type { PersonalInfo } from '../../../api/applications';
interface PersonalInfoFormProps {
    data?: PersonalInfo;
    onSave: (data: PersonalInfo) => Promise<void>;
    onNext: () => void;
}
export default function PersonalInfoForm({ data, onSave, onNext }: PersonalInfoFormProps): import("react/jsx-runtime").JSX.Element;
export {};
