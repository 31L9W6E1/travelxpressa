import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, ChevronLeft, Save, Send, AlertCircle, Loader2 } from 'lucide-react';
import { applicationsApi } from '../../api/applications';
import PersonalInfoForm from './steps/PersonalInfoForm';
import ContactInfoForm from './steps/ContactInfoForm';
import PassportInfoForm from './steps/PassportInfoForm';
import TravelInfoForm from './steps/TravelInfoForm';
// Form steps configuration
const FORM_STEPS = [
    { id: 1, title: 'Personal Information', description: 'Basic personal details' },
    { id: 2, title: 'Contact Information', description: 'Address and contact details' },
    { id: 3, title: 'Passport Information', description: 'Passport and travel document details' },
    { id: 4, title: 'Travel Information', description: 'Trip details and itinerary' },
    { id: 5, title: 'Review & Submit', description: 'Review your application' },
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
    // Render step content
    const renderStepContent = () => {
        if (!application && currentStep !== 5) {
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
                return (_jsx(ReviewStep, { application: application, onPrev: prevStep, onSubmit: handleSubmit, isSubmitting: isSaving }));
            default:
                return null;
        }
    };
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-[400px]", children: _jsx(Loader2, { className: "w-8 h-8 animate-spin text-blue-600" }) }));
    }
    return (_jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsx("div", { className: "mb-8", children: _jsx("nav", { "aria-label": "Progress", children: _jsx("ol", { className: "flex items-center", children: FORM_STEPS.map((step, index) => (_jsxs("li", { className: `relative ${index !== FORM_STEPS.length - 1 ? 'pr-8 sm:pr-20 flex-1' : ''}`, children: [_jsxs("div", { className: "flex items-center", children: [_jsx("button", { onClick: () => step.id <= (application?.currentStep || 1) && goToStep(step.id), disabled: step.id > (application?.currentStep || 1) + 1, className: `relative flex h-8 w-8 items-center justify-center rounded-full ${step.id < currentStep
                                                ? 'bg-blue-600 hover:bg-blue-700'
                                                : step.id === currentStep
                                                    ? 'bg-blue-600'
                                                    : 'bg-gray-200'} ${step.id <= (application?.currentStep || 1) ? 'cursor-pointer' : 'cursor-not-allowed'}`, children: step.id < currentStep ? (_jsx(Check, { className: "h-5 w-5 text-white" })) : (_jsx("span", { className: `text-sm font-medium ${step.id === currentStep ? 'text-white' : 'text-gray-500'}`, children: step.id })) }), index !== FORM_STEPS.length - 1 && (_jsx("div", { className: `absolute top-4 left-8 -ml-px h-0.5 w-full sm:w-20 ${step.id < currentStep ? 'bg-blue-600' : 'bg-gray-200'}` }))] }), _jsx("div", { className: "mt-2 hidden sm:block", children: _jsx("span", { className: `text-xs font-medium ${step.id === currentStep ? 'text-blue-600' : 'text-gray-500'}`, children: step.title }) })] }, step.id))) }) }) }), _jsxs("div", { className: "mb-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: FORM_STEPS[currentStep - 1].title }), _jsx("p", { className: "text-gray-600", children: FORM_STEPS[currentStep - 1].description })] }), error && (_jsxs("div", { className: "mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-red-600" }), _jsx("p", { className: "text-red-700", children: error })] })), (isSaving || lastSaved) && (_jsx("div", { className: "mb-4 flex items-center gap-2 text-sm text-gray-500", children: isSaving ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 animate-spin" }), _jsx("span", { children: "Saving..." })] })) : lastSaved ? (_jsxs(_Fragment, { children: [_jsx(Save, { className: "w-4 h-4" }), _jsxs("span", { children: ["Last saved: ", lastSaved.toLocaleTimeString()] })] })) : null })), _jsx("div", { className: "bg-white rounded-lg shadow-lg p-6", children: renderStepContent() })] }));
}
// Review Step Component
function ReviewStep({ application, onPrev, onSubmit, isSubmitting, }) {
    if (!application) {
        return (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-gray-500", children: "No application data to review." }) }));
    }
    const isComplete = application.personalInfo && application.contactInfo &&
        application.passportInfo && application.travelInfo;
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold text-yellow-800", children: "Important Notice" }), _jsx("p", { className: "text-yellow-700 text-sm mt-1", children: "Please review all information carefully before submitting. Once submitted, you cannot make changes." })] }), _jsxs("div", { className: "space-y-4", children: [_jsx(ReviewSection, { title: "Personal Information", isComplete: !!application.personalInfo, data: application.personalInfo }), _jsx(ReviewSection, { title: "Contact Information", isComplete: !!application.contactInfo, data: application.contactInfo }), _jsx(ReviewSection, { title: "Passport Information", isComplete: !!application.passportInfo, data: application.passportInfo }), _jsx(ReviewSection, { title: "Travel Information", isComplete: !!application.travelInfo, data: application.travelInfo })] }), _jsxs("div", { className: "flex justify-between pt-6 border-t", children: [_jsxs("button", { type: "button", onClick: onPrev, className: "flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200", children: [_jsx(ChevronLeft, { className: "w-4 h-4" }), "Previous"] }), _jsx("button", { type: "button", onClick: onSubmit, disabled: !isComplete || isSubmitting, className: "flex items-center gap-2 px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed", children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 animate-spin" }), "Submitting..."] })) : (_jsxs(_Fragment, { children: [_jsx(Send, { className: "w-4 h-4" }), "Submit Application"] })) })] })] }));
}
function ReviewSection({ title, isComplete, data, }) {
    return (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "font-medium text-gray-900", children: title }), isComplete ? (_jsxs("span", { className: "flex items-center gap-1 text-green-600 text-sm", children: [_jsx(Check, { className: "w-4 h-4" }), "Complete"] })) : (_jsxs("span", { className: "flex items-center gap-1 text-red-600 text-sm", children: [_jsx(AlertCircle, { className: "w-4 h-4" }), "Incomplete"] }))] }), data && (_jsxs("div", { className: "text-sm text-gray-600", children: [title === 'Personal Information' && data.givenNames && (_jsxs("p", { children: ["Name: ", data.givenNames, " ", data.surnames] })), title === 'Contact Information' && data.email && (_jsxs("p", { children: ["Email: ", data.email] })), title === 'Passport Information' && data.passportNumber && (_jsxs("p", { children: ["Passport: ", data.passportNumber] })), title === 'Travel Information' && data.purposeOfTrip && (_jsxs("p", { children: ["Purpose: ", data.purposeOfTrip] }))] }))] }));
}
