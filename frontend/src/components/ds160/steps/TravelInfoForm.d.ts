import type { TravelInfo } from '../../../api/applications';
interface TravelInfoFormProps {
    data?: TravelInfo;
    onSave: (data: TravelInfo) => Promise<void>;
    onNext: () => void;
    onPrev: () => void;
}
export default function TravelInfoForm({ data, onSave, onNext, onPrev }: TravelInfoFormProps): import("react/jsx-runtime").JSX.Element;
export {};
