import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, ChevronLeft, Save, Send, AlertCircle, Loader2 } from 'lucide-react';
import { applicationsApi, type Application, type UpdateApplicationInput } from '../../api/applications';
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

interface FormWizardProps {
  applicationId?: string;
}

export default function FormWizard({ applicationId: propId }: FormWizardProps) {
  const navigate = useNavigate();
  const { id: paramId } = useParams<{ id: string }>();
  const applicationId = propId || paramId;

  const [application, setApplication] = useState<Application | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

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
      } catch (err) {
        setError('Failed to load application');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadApplication();
  }, [applicationId]);

  // Auto-save functionality
  const saveProgress = useCallback(async (data: UpdateApplicationInput) => {
    if (!applicationId || !application) return;

    setIsSaving(true);
    setError(null);

    try {
      const updated = await applicationsApi.update(applicationId, {
        ...data,
        currentStep,
      });
      setApplication(updated);
      setLastSaved(new Date());
    } catch (err) {
      setError('Failed to save progress');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }, [applicationId, application, currentStep]);

  // Handle step navigation
  const goToStep = (step: number) => {
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
    if (!applicationId) return;

    setIsSaving(true);
    setError(null);

    try {
      await applicationsApi.submit(applicationId);
      navigate('/dashboard', { state: { message: 'Application submitted successfully!' } });
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setIsSaving(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    if (!application && currentStep !== 5) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">Please save your application first to continue.</p>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoForm
            data={application?.personalInfo}
            onSave={(data) => saveProgress({ personalInfo: data })}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <ContactInfoForm
            data={application?.contactInfo}
            onSave={(data) => saveProgress({ contactInfo: data })}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 3:
        return (
          <PassportInfoForm
            data={application?.passportInfo}
            onSave={(data) => saveProgress({ passportInfo: data })}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 4:
        return (
          <TravelInfoForm
            data={application?.travelInfo}
            onSave={(data) => saveProgress({ travelInfo: data })}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 5:
        return (
          <ReviewStep
            application={application}
            onPrev={prevStep}
            onSubmit={handleSubmit}
            isSubmitting={isSaving}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {FORM_STEPS.map((step, index) => (
              <li key={step.id} className={`relative ${index !== FORM_STEPS.length - 1 ? 'pr-8 sm:pr-20 flex-1' : ''}`}>
                <div className="flex items-center">
                  <button
                    onClick={() => step.id <= (application?.currentStep || 1) && goToStep(step.id)}
                    disabled={step.id > (application?.currentStep || 1) + 1}
                    className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                      step.id < currentStep
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : step.id === currentStep
                        ? 'bg-blue-600'
                        : 'bg-gray-200'
                    } ${step.id <= (application?.currentStep || 1) ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  >
                    {step.id < currentStep ? (
                      <Check className="h-5 w-5 text-white" />
                    ) : (
                      <span className={`text-sm font-medium ${step.id === currentStep ? 'text-white' : 'text-gray-500'}`}>
                        {step.id}
                      </span>
                    )}
                  </button>
                  {index !== FORM_STEPS.length - 1 && (
                    <div className={`absolute top-4 left-8 -ml-px h-0.5 w-full sm:w-20 ${
                      step.id < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
                <div className="mt-2 hidden sm:block">
                  <span className={`text-xs font-medium ${step.id === currentStep ? 'text-blue-600' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Current Step Info */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{FORM_STEPS[currentStep - 1].title}</h2>
        <p className="text-gray-600">{FORM_STEPS[currentStep - 1].description}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Save Status */}
      {(isSaving || lastSaved) && (
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : lastSaved ? (
            <>
              <Save className="w-4 h-4" />
              <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
            </>
          ) : null}
        </div>
      )}

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {renderStepContent()}
      </div>
    </div>
  );
}

// Review Step Component
function ReviewStep({
  application,
  onPrev,
  onSubmit,
  isSubmitting,
}: {
  application: Application | null;
  onPrev: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  if (!application) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No application data to review.</p>
      </div>
    );
  }

  const isComplete = application.personalInfo && application.contactInfo &&
                     application.passportInfo && application.travelInfo;

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800">Important Notice</h3>
        <p className="text-yellow-700 text-sm mt-1">
          Please review all information carefully before submitting. Once submitted, you cannot make changes.
        </p>
      </div>

      {/* Summary Sections */}
      <div className="space-y-4">
        <ReviewSection
          title="Personal Information"
          isComplete={!!application.personalInfo}
          data={application.personalInfo}
        />
        <ReviewSection
          title="Contact Information"
          isComplete={!!application.contactInfo}
          data={application.contactInfo}
        />
        <ReviewSection
          title="Passport Information"
          isComplete={!!application.passportInfo}
          data={application.passportInfo}
        />
        <ReviewSection
          title="Travel Information"
          isComplete={!!application.travelInfo}
          data={application.travelInfo}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <button
          type="button"
          onClick={onPrev}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!isComplete || isSubmitting}
          className="flex items-center gap-2 px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Application
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function ReviewSection({
  title,
  isComplete,
  data,
}: {
  title: string;
  isComplete: boolean;
  data: any;
}) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900">{title}</h4>
        {isComplete ? (
          <span className="flex items-center gap-1 text-green-600 text-sm">
            <Check className="w-4 h-4" />
            Complete
          </span>
        ) : (
          <span className="flex items-center gap-1 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            Incomplete
          </span>
        )}
      </div>
      {data && (
        <div className="text-sm text-gray-600">
          {/* Show a brief summary based on the section */}
          {title === 'Personal Information' && data.givenNames && (
            <p>Name: {data.givenNames} {data.surnames}</p>
          )}
          {title === 'Contact Information' && data.email && (
            <p>Email: {data.email}</p>
          )}
          {title === 'Passport Information' && data.passportNumber && (
            <p>Passport: {data.passportNumber}</p>
          )}
          {title === 'Travel Information' && data.purposeOfTrip && (
            <p>Purpose: {data.purposeOfTrip}</p>
          )}
        </div>
      )}
    </div>
  );
}
