import type { PassportInfo } from '../../../api/applications';
interface PassportInfoFormProps {
    data?: PassportInfo;
    onSave: (data: PassportInfo) => Promise<void>;
    onNext: () => void;
    onPrev: () => void;
}
export default function PassportInfoForm({ data, onSave, onNext, onPrev }: PassportInfoFormProps): import("react/jsx-runtime").JSX.Element;
export {};
