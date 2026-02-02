interface ApplicationDetailModalProps {
    application: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onStatusUpdate?: (application: any) => void;
}
export default function ApplicationDetailModal({ application, open, onOpenChange, onStatusUpdate, }: ApplicationDetailModalProps): import("react/jsx-runtime").JSX.Element | null;
export {};
