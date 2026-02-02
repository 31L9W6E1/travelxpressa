import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { ChevronRight, ChevronLeft, Upload, X, FileText, Image, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
function DropZone({ title, description, accept, maxSize, file, onUpload, onRemove, isUploading, uploadProgress, requirements, icon }) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState(null);
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);
    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);
    const handleDrop = useCallback(async (e) => {
        e.preventDefault();
        setIsDragging(false);
        setError(null);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            if (droppedFile.size > maxSize) {
                setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
                return;
            }
            await onUpload(droppedFile);
        }
    }, [maxSize, onUpload]);
    const handleFileSelect = useCallback(async (e) => {
        setError(null);
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > maxSize) {
                setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
                return;
            }
            await onUpload(selectedFile);
        }
    }, [maxSize, onUpload]);
    const formatFileSize = (bytes) => {
        if (bytes < 1024)
            return bytes + ' B';
        if (bytes < 1024 * 1024)
            return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    };
    if (file) {
        return (_jsx(Card, { className: "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20", children: _jsxs(CardContent, { className: "pt-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "p-3 bg-green-100 dark:bg-green-900/50 rounded-lg", children: _jsx(Check, { className: "w-6 h-6 text-green-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: file.fileName }), _jsx("p", { className: "text-sm text-muted-foreground", children: formatFileSize(file.fileSize) })] })] }), _jsx(Button, { variant: "ghost", size: "icon", onClick: onRemove, className: "text-destructive", children: _jsx(X, { className: "w-5 h-5" }) })] }), file.fileUrl && (_jsx("div", { className: "mt-4", children: accept.includes('image') ? (_jsx("img", { src: file.fileUrl, alt: title, className: "max-h-48 rounded-lg object-contain mx-auto" })) : (_jsx("a", { href: file.fileUrl, target: "_blank", rel: "noopener noreferrer", className: "text-primary hover:underline text-sm", children: "View uploaded file" })) }))] }) }));
    }
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [icon, title] }), _jsx(CardDescription, { children: description })] }), _jsxs(CardContent, { children: [requirements && requirements.length > 0 && (_jsxs(Alert, { className: "mb-4", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: [_jsx("strong", { children: "Requirements:" }), _jsx("ul", { className: "list-disc list-inside mt-1 text-xs space-y-1", children: requirements.map((req, idx) => (_jsx("li", { children: req }, idx))) })] })] })), _jsxs("div", { onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop, className: `
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
            ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          `, children: [_jsx("input", { type: "file", accept: accept, onChange: handleFileSelect, className: "absolute inset-0 w-full h-full opacity-0 cursor-pointer", disabled: isUploading }), isUploading ? (_jsxs("div", { className: "space-y-4", children: [_jsx(Loader2, { className: "w-10 h-10 mx-auto text-primary animate-spin" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Uploading..." }), _jsx(Progress, { value: uploadProgress, className: "w-48 mx-auto" })] })) : (_jsxs(_Fragment, { children: [_jsx(Upload, { className: "w-10 h-10 mx-auto text-muted-foreground mb-4" }), _jsx("p", { className: "text-sm font-medium mb-1", children: "Drag and drop your file here, or click to browse" }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["Maximum file size: ", Math.round(maxSize / 1024 / 1024), "MB"] })] }))] }), error && (_jsxs(Alert, { variant: "destructive", className: "mt-4", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: error })] }))] })] }));
}
export default function DocumentUploadForm({ data, onSave, onNext, onPrev }) {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        photo: data?.photo,
        invitationLetter: data?.invitationLetter,
        additionalDocuments: data?.additionalDocuments || [],
    });
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [uploadingInvitation, setUploadingInvitation] = useState(false);
    const [uploadingAdditional, setUploadingAdditional] = useState(false);
    const [photoProgress, setPhotoProgress] = useState(0);
    const [invitationProgress, setInvitationProgress] = useState(0);
    const [additionalProgress, setAdditionalProgress] = useState(0);
    // Simulate file upload (in production, this would upload to a server)
    const simulateUpload = async (file, onProgress) => {
        return new Promise((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                onProgress(progress);
                if (progress >= 100) {
                    clearInterval(interval);
                    // In production, return the actual URL from the server
                    const url = URL.createObjectURL(file);
                    resolve(url);
                }
            }, 100);
        });
    };
    const handlePhotoUpload = async (file) => {
        setUploadingPhoto(true);
        setPhotoProgress(0);
        try {
            const fileUrl = await simulateUpload(file, setPhotoProgress);
            setFormData(prev => ({
                ...prev,
                photo: {
                    fileName: file.name,
                    fileUrl,
                    fileSize: file.size,
                    uploadedAt: new Date().toISOString(),
                }
            }));
        }
        finally {
            setUploadingPhoto(false);
        }
    };
    const handleInvitationUpload = async (file) => {
        setUploadingInvitation(true);
        setInvitationProgress(0);
        try {
            const fileUrl = await simulateUpload(file, setInvitationProgress);
            setFormData(prev => ({
                ...prev,
                invitationLetter: {
                    fileName: file.name,
                    fileUrl,
                    fileSize: file.size,
                    uploadedAt: new Date().toISOString(),
                }
            }));
        }
        finally {
            setUploadingInvitation(false);
        }
    };
    const handleAdditionalUpload = async (file) => {
        setUploadingAdditional(true);
        setAdditionalProgress(0);
        try {
            const fileUrl = await simulateUpload(file, setAdditionalProgress);
            setFormData(prev => ({
                ...prev,
                additionalDocuments: [
                    ...(prev.additionalDocuments || []),
                    {
                        fileName: file.name,
                        fileUrl,
                        fileSize: file.size,
                        uploadedAt: new Date().toISOString(),
                        documentType: 'other',
                    }
                ]
            }));
        }
        finally {
            setUploadingAdditional(false);
        }
    };
    const removePhoto = () => {
        if (formData.photo?.fileUrl) {
            URL.revokeObjectURL(formData.photo.fileUrl);
        }
        setFormData(prev => ({ ...prev, photo: undefined }));
    };
    const removeInvitation = () => {
        if (formData.invitationLetter?.fileUrl) {
            URL.revokeObjectURL(formData.invitationLetter.fileUrl);
        }
        setFormData(prev => ({ ...prev, invitationLetter: undefined }));
    };
    const removeAdditionalDocument = (index) => {
        const doc = formData.additionalDocuments?.[index];
        if (doc?.fileUrl) {
            URL.revokeObjectURL(doc.fileUrl);
        }
        setFormData(prev => ({
            ...prev,
            additionalDocuments: prev.additionalDocuments?.filter((_, i) => i !== index)
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave(formData);
            onNext();
        }
        finally {
            setIsSaving(false);
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-8", children: [_jsxs(Alert, { children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "Upload your required documents below. All documents must be clear, legible, and meet the specified requirements. Your photo must meet U.S. visa photo standards." })] }), _jsx(DropZone, { title: "Passport Photo", description: "Upload a recent passport-style photo for your visa application", accept: "image/jpeg,image/png", maxSize: 5 * 1024 * 1024, file: formData.photo, onUpload: handlePhotoUpload, onRemove: removePhoto, isUploading: uploadingPhoto, uploadProgress: photoProgress, icon: _jsx(Image, { className: "w-5 h-5" }), requirements: [
                    'Recent photo taken within the last 6 months',
                    'Color photo with white or off-white background',
                    'Size: 2x2 inches (51x51 mm)',
                    'Head must be centered and take up 50-69% of the frame',
                    'Neutral facial expression with both eyes open',
                    'No glasses, hats, or head coverings (unless for religious purposes)',
                    'Format: JPEG or PNG, max 5MB'
                ] }), _jsx(DropZone, { title: "Invitation Letter (if applicable)", description: "Upload an invitation letter from your host or sponsoring organization in the U.S.", accept: ".pdf,.doc,.docx,image/jpeg,image/png", maxSize: 10 * 1024 * 1024, file: formData.invitationLetter, onUpload: handleInvitationUpload, onRemove: removeInvitation, isUploading: uploadingInvitation, uploadProgress: invitationProgress, icon: _jsx(FileText, { className: "w-5 h-5" }), requirements: [
                    'Letter from U.S. host or sponsoring organization',
                    'Should include: purpose of visit, dates, relationship to applicant',
                    'Host\'s contact information and U.S. address',
                    'Format: PDF, DOC, DOCX, or image, max 10MB'
                ] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [_jsx(FileText, { className: "w-5 h-5" }), "Additional Supporting Documents"] }), _jsx(CardDescription, { children: "Upload any additional documents that support your visa application (bank statements, employment letters, travel itinerary, etc.)" })] }), _jsxs(CardContent, { className: "space-y-4", children: [(formData.additionalDocuments || []).length > 0 && (_jsx("div", { className: "space-y-2", children: formData.additionalDocuments.map((doc, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-muted/50 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(FileText, { className: "w-5 h-5 text-muted-foreground" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: doc.fileName }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [(doc.fileSize / 1024 / 1024).toFixed(1), " MB"] })] })] }), _jsx(Button, { type: "button", variant: "ghost", size: "icon", onClick: () => removeAdditionalDocument(index), className: "text-destructive", children: _jsx(X, { className: "w-4 h-4" }) })] }, index))) })), _jsxs("div", { className: `
              relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
              ${uploadingAdditional ? 'pointer-events-none opacity-50' : 'hover:border-primary/50 cursor-pointer'}
              border-muted-foreground/25
            `, children: [_jsx("input", { type: "file", accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png", onChange: (e) => {
                                            const file = e.target.files?.[0];
                                            if (file && file.size <= 10 * 1024 * 1024) {
                                                handleAdditionalUpload(file);
                                            }
                                            e.target.value = '';
                                        }, className: "absolute inset-0 w-full h-full opacity-0 cursor-pointer", disabled: uploadingAdditional }), uploadingAdditional ? (_jsxs("div", { className: "space-y-2", children: [_jsx(Loader2, { className: "w-8 h-8 mx-auto text-primary animate-spin" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Uploading..." }), _jsx(Progress, { value: additionalProgress, className: "w-32 mx-auto" })] })) : (_jsxs(_Fragment, { children: [_jsx(Upload, { className: "w-8 h-8 mx-auto text-muted-foreground mb-2" }), _jsx("p", { className: "text-sm font-medium", children: "Click or drag to add more documents" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "PDF, DOC, DOCX, or images up to 10MB each" })] }))] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-lg", children: "Document Checklist" }), _jsx(CardDescription, { children: "Recommended documents for your visa application" })] }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
                                { name: 'Passport Photo', uploaded: !!formData.photo },
                                { name: 'Invitation Letter', uploaded: !!formData.invitationLetter },
                                { name: 'Bank Statements', uploaded: formData.additionalDocuments?.some(d => d.fileName.toLowerCase().includes('bank')) },
                                { name: 'Employment Letter', uploaded: formData.additionalDocuments?.some(d => d.fileName.toLowerCase().includes('employ')) },
                                { name: 'Travel Itinerary', uploaded: formData.additionalDocuments?.some(d => d.fileName.toLowerCase().includes('travel') || d.fileName.toLowerCase().includes('itinerary')) },
                                { name: 'Hotel Reservations', uploaded: formData.additionalDocuments?.some(d => d.fileName.toLowerCase().includes('hotel') || d.fileName.toLowerCase().includes('reservation')) },
                            ].map((item, index) => (_jsxs("div", { className: "flex items-center gap-3 p-3 border rounded-lg", children: [item.uploaded ? (_jsx(Check, { className: "w-5 h-5 text-green-600" })) : (_jsx("div", { className: "w-5 h-5 border-2 border-muted-foreground/30 rounded-full" })), _jsx("span", { className: item.uploaded ? 'text-foreground' : 'text-muted-foreground', children: item.name })] }, index))) }) })] }), _jsxs("div", { className: "flex justify-between pt-4 border-t", children: [_jsxs(Button, { type: "button", variant: "outline", onClick: onPrev, children: [_jsx(ChevronLeft, { className: "w-4 h-4 mr-2" }), "Previous"] }), _jsx(Button, { type: "submit", disabled: isSaving, children: isSaving ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Saving..."] })) : (_jsxs(_Fragment, { children: ["Save & Continue", _jsx(ChevronRight, { className: "w-4 h-4 ml-2" })] })) })] })] }));
}
