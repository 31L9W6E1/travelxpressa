import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, ChevronLeft, Save, Send, AlertCircle, Loader2, User, Phone, BookOpen, Plane, Users, Briefcase, Shield, FileText, CheckSquare } from 'lucide-react';
import { applicationsApi } from '../../api/applications';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import PersonalInfoForm from './steps/PersonalInfoForm';
import ContactInfoForm from './steps/ContactInfoForm';
import PassportInfoForm from './steps/PassportInfoForm';
import TravelInfoForm from './steps/TravelInfoForm';
import FamilyInfoForm from './steps/FamilyInfoForm';
import WorkEducationForm from './steps/WorkEducationForm';
import SecurityQuestionsForm from './steps/SecurityQuestionsForm';
import DocumentUploadForm from './steps/DocumentUploadForm';
// Form steps configuration with icons
const FORM_STEPS = [
    { id: 1, title: 'Personal Info', description: 'Basic personal details', icon: User },
    { id: 2, title: 'Contact Info', description: 'Address and contact details', icon: Phone },
    { id: 3, title: 'Passport', description: 'Passport and travel documents', icon: BookOpen },
    { id: 4, title: 'Travel Plans', description: 'Trip details and itinerary', icon: Plane },
    { id: 5, title: 'Family', description: 'Family information', icon: Users },
    { id: 6, title: 'Work & Education', description: 'Employment and education', icon: Briefcase },
    { id: 7, title: 'Security', description: 'Security questions', icon: Shield },
    { id: 8, title: 'Documents', description: 'Upload required documents', icon: FileText },
    { id: 9, title: 'Review', description: 'Review and submit', icon: CheckSquare },
];
export default function FormWizard({ applicationId: propId }) {
    const navigate = useNavigate();
    const { id: paramId } = useParams();
    const applicationId = propId || paramId;
    const [application, setApplication] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [lastSaved, setLastSaved] = useState(null);
    // Load application data
    useEffect(() => {
        const loadApplication = async () => {
            if (!applicationId) {
                setIsLoading(false);
                return;
            }
            try {
                const app = await applicationsApi.getById(applicationId);
                setApplication(app);
                setCurrentStep(app.currentStep || 1);
            }
            catch (err) {
                setError('Failed to load application');
                console.error(err);
            }
            finally {
                setIsLoading(false);
            }
        };
        loadApplication();
    }, [applicationId]);
    // Auto-save functionality
    const saveProgress = useCallback(async (data) => {
        if (!applicationId || !application)
            return;
        setIsSaving(true);
        setError(null);
        try {
            const updated = await applicationsApi.update(applicationId, {
                ...data,
                currentStep,
            });
            setApplication(updated);
            setLastSaved(new Date());
        }
        catch (err) {
            setError('Failed to save progress');
            console.error(err);
        }
        finally {
            setIsSaving(false);
        }
    }, [applicationId, application, currentStep]);
    // Handle step navigation
    const goToStep = (step) => {
        if (step >= 1 && step <= FORM_STEPS.length) {
            setCurrentStep(step);
            if (applicationId) {
                applicationsApi.update(applicationId, { currentStep: step }).catch(console.error);
            }
        }
    };
    const nextStep = () => goToStep(currentStep + 1);
    const prevStep = () => goToStep(currentStep - 1);
    // Handle form submission
    const handleSubmit = async () => {
        if (!applicationId)
            return;
        setIsSaving(true);
        setError(null);
        try {
            await applicationsApi.submit(applicationId);
            navigate('/dashboard', { state: { message: 'Application submitted successfully!' } });
        }
        catch (err) {
            setError(err.message || 'Failed to submit application');
        }
        finally {
            setIsSaving(false);
        }
    };
    // Calculate progress
    const progressPercentage = Math.round((currentStep / FORM_STEPS.length) * 100);
    // Render step content
    const renderStepContent = () => {
        if (!application && currentStep !== FORM_STEPS.length) {
            return (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-gray-500", children: "Please save your application first to continue." }) }));
        }
        switch (currentStep) {
            case 1:
                return (_jsx(PersonalInfoForm, { data: application?.personalInfo, onSave: (data) => saveProgress({ personalInfo: data }), onNext: nextStep }));
            case 2:
                return (_jsx(ContactInfoForm, { data: application?.contactInfo, onSave: (data) => saveProgress({ contactInfo: data }), onNext: nextStep, onPrev: prevStep }));
            case 3:
                return (_jsx(PassportInfoForm, { data: application?.passportInfo, onSave: (data) => saveProgress({ passportInfo: data }), onNext: nextStep, onPrev: prevStep }));
            case 4:
                return (_jsx(TravelInfoForm, { data: application?.travelInfo, onSave: (data) => saveProgress({ travelInfo: data }), onNext: nextStep, onPrev: prevStep }));
            case 5:
                return (_jsx(FamilyInfoForm, { data: application?.familyInfo, onSave: (data) => saveProgress({ familyInfo: data }), onNext: nextStep, onPrev: prevStep }));
            case 6:
                return (_jsx(WorkEducationForm, { data: application?.workEducation, onSave: (data) => saveProgress({ workEducation: data }), onNext: nextStep, onPrev: prevStep }));
            case 7:
                return (_jsx(SecurityQuestionsForm, { data: application?.securityInfo, onSave: (data) => saveProgress({ securityInfo: data }), onNext: nextStep, onPrev: prevStep }));
            case 8:
                return (_jsx(DocumentUploadForm, { data: application?.documents, onSave: (data) => saveProgress({ documents: data }), onNext: nextStep, onPrev: prevStep }));
            case 9:
                return (_jsx(ReviewStep, { application: application, onPrev: prevStep, onSubmit: handleSubmit, isSubmitting: isSaving, onGoToStep: goToStep }));
            default:
                return null;
        }
    };
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-[400px]", children: _jsx(Loader2, { className: "w-8 h-8 animate-spin text-primary" }) }));
    }
    return (_jsxs("div", { className: "max-w-5xl mx-auto px-4", children: [_jsxs("div", { className: "mb-8", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("span", { className: "text-sm font-medium text-muted-foreground", children: "Application Progress" }), _jsxs("span", { className: "text-sm font-medium", children: [progressPercentage, "% Complete"] })] }), _jsx(Progress, { value: progressPercentage, className: "h-2" })] }), _jsx("div", { className: "mb-8 overflow-x-auto pb-4", children: _jsx("nav", { "aria-label": "Progress", className: "min-w-max", children: _jsx("ol", { className: "flex items-center gap-2", children: FORM_STEPS.map((step, index) => {
                            const Icon = step.icon;
                            const isCompleted = step.id < currentStep;
                            const isCurrent = step.id === currentStep;
                            const isAccessible = step.id <= (application?.currentStep || 1) + 1;
                            return (_jsxs("li", { className: "flex items-center", children: [_jsxs("button", { onClick: () => isAccessible && goToStep(step.id), disabled: !isAccessible, className: `
                      flex items-center gap-2 px-3 py-2 rounded-lg transition-all
                      ${isCurrent ? 'bg-primary text-primary-foreground shadow-lg scale-105' : ''}
                      ${isCompleted ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''}
                      ${!isCompleted && !isCurrent ? 'bg-muted text-muted-foreground' : ''}
                      ${isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
                    `, children: [_jsx("div", { className: `
                      flex items-center justify-center w-8 h-8 rounded-full
                      ${isCurrent ? 'bg-primary-foreground/20' : ''}
                      ${isCompleted ? 'bg-primary/20' : 'bg-muted-foreground/20'}
                    `, children: isCompleted ? (_jsx(Check, { className: "w-4 h-4" })) : (_jsx(Icon, { className: "w-4 h-4" })) }), _jsx("span", { className: "text-xs font-medium hidden md:inline", children: step.title })] }), index < FORM_STEPS.length - 1 && (_jsx("div", { className: `w-8 h-0.5 mx-1 ${isCompleted ? 'bg-primary' : 'bg-muted'}` }))] }, step.id));
                        }) }) }) }), _jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [(() => {
                                const Icon = FORM_STEPS[currentStep - 1].icon;
                                return _jsx(Icon, { className: "w-6 h-6 text-primary" });
                            })(), _jsx("h2", { className: "text-2xl font-bold text-foreground", children: FORM_STEPS[currentStep - 1].title })] }), _jsx("p", { className: "text-muted-foreground", children: FORM_STEPS[currentStep - 1].description })] }), error && (_jsxs("div", { className: "mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-destructive" }), _jsx("p", { className: "text-destructive", children: error })] })), (isSaving || lastSaved) && (_jsx("div", { className: "mb-4 flex items-center gap-2 text-sm text-muted-foreground", children: isSaving ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 animate-spin" }), _jsx("span", { children: "Saving..." })] })) : lastSaved ? (_jsxs(_Fragment, { children: [_jsx(Save, { className: "w-4 h-4" }), _jsxs("span", { children: ["Last saved: ", lastSaved.toLocaleTimeString()] })] })) : null })), _jsx("div", { className: "bg-card rounded-xl shadow-lg border p-6 md:p-8", children: renderStepContent() })] }));
}
// Review Step Component
function ReviewStep({ application, onPrev, onSubmit, isSubmitting, onGoToStep, }) {
    if (!application) {
        return (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-muted-foreground", children: "No application data to review." }) }));
    }
    const sections = [
        { id: 1, title: 'Personal Information', data: application.personalInfo, step: 1 },
        { id: 2, title: 'Contact Information', data: application.contactInfo, step: 2 },
        { id: 3, title: 'Passport Information', data: application.passportInfo, step: 3 },
        { id: 4, title: 'Travel Information', data: application.travelInfo, step: 4 },
        { id: 5, title: 'Family Information', data: application.familyInfo, step: 5 },
        { id: 6, title: 'Work & Education', data: application.workEducation, step: 6 },
        { id: 7, title: 'Security Questions', data: application.securityInfo, step: 7 },
        { id: 8, title: 'Documents', data: application.documents, step: 8 },
    ];
    const completedSections = sections.filter(s => s.data).length;
    const isComplete = completedSections >= 4; // Minimum required sections
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold text-yellow-800 dark:text-yellow-200", children: "Important Notice" }), _jsxs("p", { className: "text-yellow-700 dark:text-yellow-300 text-sm mt-1", children: ["Please review all information carefully before submitting. Once submitted, you cannot make changes. You have completed ", completedSections, " of ", sections.length, " sections."] })] }), _jsx("div", { className: "grid gap-4 md:grid-cols-2", children: sections.map((section) => (_jsx(ReviewSection, { title: section.title, isComplete: !!section.data, data: section.data, onEdit: () => onGoToStep(section.step) }, section.id))) }), _jsxs("div", { className: "flex justify-between pt-6 border-t", children: [_jsxs(Button, { type: "button", variant: "outline", onClick: onPrev, children: [_jsx(ChevronLeft, { className: "w-4 h-4 mr-2" }), "Previous"] }), _jsx(Button, { type: "button", onClick: onSubmit, disabled: !isComplete || isSubmitting, className: "bg-green-600 hover:bg-green-700", children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Submitting..."] })) : (_jsxs(_Fragment, { children: [_jsx(Send, { className: "w-4 h-4 mr-2" }), "Submit Application"] })) })] })] }));
}
function ReviewSection({ title, isComplete, data, onEdit, }) {
    const getSummary = () => {
        if (!data)
            return null;
        switch (title) {
            case 'Personal Information':
                return data.givenNames ? `${data.givenNames} ${data.surnames}` : null;
            case 'Contact Information':
                return data.email || null;
            case 'Passport Information':
                return data.passportNumber || null;
            case 'Travel Information':
                return data.purposeOfTrip || null;
            case 'Family Information':
                return data.fatherGivenNames ? `Father: ${data.fatherGivenNames} ${data.fatherSurnames}` : null;
            case 'Work & Education':
                return data.primaryOccupation || null;
            case 'Security Questions':
                return 'Completed';
            case 'Documents':
                return data.photo ? 'Photo uploaded' : null;
            default:
                return null;
        }
    };
    return (_jsxs("div", { className: `border rounded-lg p-4 transition-colors ${isComplete ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20' : 'border-muted'}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "font-medium text-foreground", children: title }), _jsxs("div", { className: "flex items-center gap-2", children: [isComplete ? (_jsxs("span", { className: "flex items-center gap-1 text-green-600 text-sm", children: [_jsx(Check, { className: "w-4 h-4" }), "Complete"] })) : (_jsxs("span", { className: "flex items-center gap-1 text-destructive text-sm", children: [_jsx(AlertCircle, { className: "w-4 h-4" }), "Incomplete"] })), _jsx(Button, { variant: "ghost", size: "sm", onClick: onEdit, children: "Edit" })] })] }), getSummary() && (_jsx("p", { className: "text-sm text-muted-foreground truncate", children: getSummary() }))] }));
}
