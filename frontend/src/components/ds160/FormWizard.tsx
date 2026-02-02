import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, ChevronLeft, Save, Send, AlertCircle, Loader2, User, Phone, Passport, Plane, Users, Briefcase, Shield, FileText, CheckSquare } from 'lucide-react';
import { applicationsApi, type Application, type UpdateApplicationInput } from '../../api/applications';
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
  { id: 3, title: 'Passport', description: 'Passport and travel documents', icon: Passport },
  { id: 4, title: 'Travel Plans', description: 'Trip details and itinerary', icon: Plane },
  { id: 5, title: 'Family', description: 'Family information', icon: Users },
  { id: 6, title: 'Work & Education', description: 'Employment and education', icon: Briefcase },
  { id: 7, title: 'Security', description: 'Security questions', icon: Shield },
  { id: 8, title: 'Documents', description: 'Upload required documents', icon: FileText },
  { id: 9, title: 'Review', description: 'Review and submit', icon: CheckSquare },
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

  // Calculate progress
  const progressPercentage = Math.round((currentStep / FORM_STEPS.length) * 100);

  // Render step content
  const renderStepContent = () => {
    if (!application && currentStep !== FORM_STEPS.length) {
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
          <FamilyInfoForm
            data={application?.familyInfo}
            onSave={(data) => saveProgress({ familyInfo: data })}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 6:
        return (
          <WorkEducationForm
            data={application?.workEducation}
            onSave={(data) => saveProgress({ workEducation: data })}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 7:
        return (
          <SecurityQuestionsForm
            data={application?.securityInfo}
            onSave={(data) => saveProgress({ securityInfo: data })}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 8:
        return (
          <DocumentUploadForm
            data={application?.documents}
            onSave={(data) => saveProgress({ documents: data })}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 9:
        return (
          <ReviewStep
            application={application}
            onPrev={prevStep}
            onSubmit={handleSubmit}
            isSubmitting={isSaving}
            onGoToStep={goToStep}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-muted-foreground">Application Progress</span>
          <span className="text-sm font-medium">{progressPercentage}% Complete</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Step Indicators - Horizontal scrollable on mobile */}
      <div className="mb-8 overflow-x-auto pb-4">
        <nav aria-label="Progress" className="min-w-max">
          <ol className="flex items-center gap-2">
            {FORM_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;
              const isAccessible = step.id <= (application?.currentStep || 1) + 1;

              return (
                <li key={step.id} className="flex items-center">
                  <button
                    onClick={() => isAccessible && goToStep(step.id)}
                    disabled={!isAccessible}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg transition-all
                      ${isCurrent ? 'bg-primary text-primary-foreground shadow-lg scale-105' : ''}
                      ${isCompleted ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''}
                      ${!isCompleted && !isCurrent ? 'bg-muted text-muted-foreground' : ''}
                      ${isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
                    `}
                  >
                    <div className={`
                      flex items-center justify-center w-8 h-8 rounded-full
                      ${isCurrent ? 'bg-primary-foreground/20' : ''}
                      ${isCompleted ? 'bg-primary/20' : 'bg-muted-foreground/20'}
                    `}>
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-xs font-medium hidden md:inline">{step.title}</span>
                  </button>
                  {index < FORM_STEPS.length - 1 && (
                    <div className={`w-8 h-0.5 mx-1 ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Current Step Info */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          {(() => {
            const Icon = FORM_STEPS[currentStep - 1].icon;
            return <Icon className="w-6 h-6 text-primary" />;
          })()}
          <h2 className="text-2xl font-bold text-foreground">{FORM_STEPS[currentStep - 1].title}</h2>
        </div>
        <p className="text-muted-foreground">{FORM_STEPS[currentStep - 1].description}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <p className="text-destructive">{error}</p>
        </div>
      )}

      {/* Save Status */}
      {(isSaving || lastSaved) && (
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
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
      <div className="bg-card rounded-xl shadow-lg border p-6 md:p-8">
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
  onGoToStep,
}: {
  application: Application | null;
  onPrev: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  onGoToStep: (step: number) => void;
}) {
  if (!application) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No application data to review.</p>
      </div>
    );
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

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Important Notice</h3>
        <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
          Please review all information carefully before submitting. Once submitted, you cannot make changes.
          You have completed {completedSections} of {sections.length} sections.
        </p>
      </div>

      {/* Summary Sections */}
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <ReviewSection
            key={section.id}
            title={section.title}
            isComplete={!!section.data}
            data={section.data}
            onEdit={() => onGoToStep(section.step)}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button type="button" variant="outline" onClick={onPrev}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={!isComplete || isSubmitting}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit Application
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function ReviewSection({
  title,
  isComplete,
  data,
  onEdit,
}: {
  title: string;
  isComplete: boolean;
  data: any;
  onEdit: () => void;
}) {
  const getSummary = () => {
    if (!data) return null;

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

  return (
    <div className={`border rounded-lg p-4 transition-colors ${isComplete ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20' : 'border-muted'}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-foreground">{title}</h4>
        <div className="flex items-center gap-2">
          {isComplete ? (
            <span className="flex items-center gap-1 text-green-600 text-sm">
              <Check className="w-4 h-4" />
              Complete
            </span>
          ) : (
            <span className="flex items-center gap-1 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              Incomplete
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Edit
          </Button>
        </div>
      </div>
      {getSummary() && (
        <p className="text-sm text-muted-foreground truncate">{getSummary()}</p>
      )}
    </div>
  );
}
