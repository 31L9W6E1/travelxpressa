import type { ContactInfo } from '../../../api/applications';
interface ContactInfoFormProps {
    data?: ContactInfo;
    onSave: (data: ContactInfo) => Promise<void>;
    onNext: () => void;
    onPrev: () => void;
}
export default function ContactInfoForm({ data, onSave, onNext, onPrev }: ContactInfoFormProps): import("react/jsx-runtime").JSX.Element;
export {};
