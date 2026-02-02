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
interface DocumentUploadFormProps {
    data?: DocumentInfo;
    onSave: (data: DocumentInfo) => Promise<void>;
    onNext: () => void;
    onPrev: () => void;
}
export default function DocumentUploadForm({ data, onSave, onNext, onPrev }: DocumentUploadFormProps): import("react/jsx-runtime").JSX.Element;
export {};
