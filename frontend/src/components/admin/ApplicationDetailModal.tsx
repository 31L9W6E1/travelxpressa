import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Phone,
  BookOpen,
  Plane,
  Users,
  Briefcase,
  Shield,
  FileText,
  Calendar,
  MapPin,
  Mail,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/api/client';

// Type definitions for form data sections
interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  zipCode?: string;
  country?: string;
}

interface PersonalInfo {
  surnames?: string;
  givenNames?: string;
  fullNameNative?: string;
  dateOfBirth?: string;
  sex?: string;
  maritalStatus?: string;
  nationality?: string;
  countryOfBirth?: string;
  cityOfBirth?: string;
  stateOfBirth?: string;
  otherNamesUsed?: boolean;
  otherNames?: string[];
}

interface ContactInfo {
  email?: string;
  phone?: string;
  secondaryPhone?: string;
  workPhone?: string;
  homeAddress?: Address;
  mailingAddress?: Address;
}

interface PassportInfo {
  passportType?: string;
  passportNumber?: string;
  passportBookNumber?: string;
  countryOfIssuance?: string;
  cityOfIssuance?: string;
  stateOfIssuance?: string;
  issuanceDate?: string;
  expirationDate?: string;
  hasOtherPassport?: boolean;
  otherPassportInfo?: {
    number?: string;
    country?: string;
  };
}

interface Companion {
  name?: string;
  relationship?: string;
}

interface TravelInfo {
  purposeOfTrip?: string;
  specificPurpose?: string;
  intendedArrivalDate?: string;
  intendedLengthOfStay?: string;
  noUSAddressYet?: boolean;
  destinationCountry?: string;
  supportServices?: {
    hotelBooking?: boolean;
    preFlightBooking?: boolean;
    travelItinerary?: boolean;
    declarationFormAssistance?: boolean;
  };
  supportNotes?: string;
  payingForTrip?: string;
  travelingWithOthers?: boolean;
  addressWhileInUS?: Address;
  companions?: Companion[];
}

interface Child {
  fullName?: string;
  dateOfBirth?: string;
  relationship?: string;
}

interface Relative {
  fullName?: string;
  relationship?: string;
  status?: string;
}

interface FamilyInfo {
  fatherGivenNames?: string;
  fatherSurnames?: string;
  fatherDateOfBirth?: string;
  isFatherInUS?: boolean;
  fatherUSStatus?: string;
  motherGivenNames?: string;
  motherSurnames?: string;
  motherDateOfBirth?: string;
  isMotherInUS?: boolean;
  motherUSStatus?: string;
  hasSpouse?: boolean;
  spouseFullName?: string;
  spouseDateOfBirth?: string;
  spouseNationality?: string;
  spouseCityOfBirth?: string;
  spouseCountryOfBirth?: string;
  children?: Child[];
  immediateRelativesInUS?: Relative[];
  hasOtherRelativesInUS?: boolean;
  otherRelativesInUS?: Relative[];
}

interface Education {
  institutionName?: string;
  courseOfStudy?: string;
  startDate?: string;
  endDate?: string;
}

interface MilitaryService {
  country?: string;
  branch?: string;
  rank?: string;
  specialty?: string;
}

interface WorkEducation {
  primaryOccupation?: string;
  presentEmployerName?: string;
  monthlySalary?: string;
  startDate?: string;
  jobDuties?: string;
  presentEmployerPhone?: string;
  education?: Education[];
  languages?: string[];
  wasPreviouslyEmployed?: boolean;
  previousEmployment?: Array<{
    employerName?: string;
    employerAddress?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
    jobTitle?: string;
    supervisorSurname?: string;
    supervisorGivenName?: string;
    startDate?: string;
    endDate?: string;
    duties?: string;
  }>;
  hasAttendedEducation?: boolean;
  belongsToClanOrTribe?: boolean;
  clanOrTribeName?: string;
  hasVisitedCountriesLastFiveYears?: boolean;
  countriesVisited?: string[];
  belongsToProfessionalOrg?: boolean;
  professionalOrgs?: string[];
  hasSpecializedSkills?: boolean;
  specializedSkillsDescription?: string;
  hasServedInMilitary?: boolean;
  militaryService?: MilitaryService;
}

interface SecurityInfo {
  hasCommunicableDisease?: boolean;
  hasMentalOrPhysicalDisorder?: boolean;
  isDrugAbuser?: boolean;
  hasBeenArrested?: boolean;
  hasViolatedControlledSubstancesLaw?: boolean;
  seeksEspionage?: boolean;
  seeksToEngageInTerrorism?: boolean;
  hasProvidedTerroristSupport?: boolean;
  isTerroristOrganizationMember?: boolean;
  hasBeenInUS?: boolean;
  hasBeenIssuedUSVisa?: boolean;
  hasBeenRefusedUSVisa?: boolean;
  isEngagedInProstitution?: boolean;
  isInvolvedInMoneyLaundering?: boolean;
  hasCommittedHumanTrafficking?: boolean;
  hasBenefitedFromTrafficking?: boolean;
  hasAidedHumanTrafficking?: boolean;
  isRelatedToTerrorist?: boolean;
  hasParticipatedInGenocide?: boolean;
  hasParticipatedInTorture?: boolean;
  hasParticipatedInExtrajudicialKillings?: boolean;
  hasRecruitedChildSoldiers?: boolean;
  hasViolatedReligiousFreedom?: boolean;
  hasEnforcedPopulationControls?: boolean;
  hasInvolvedInOrganTrafficking?: boolean;
  hasSoughtVisaByFraud?: boolean;
  hasBeenRemovedOrDeported?: boolean;
  hasWithheldCustodyOfUSCitizen?: boolean;
  hasVotedInUSIllegally?: boolean;
  hasRenouncedUSCitizenshipToAvoidTax?: boolean;
  hasImmigrantPetitionFiled?: boolean;
  arrestDetails?: string;
  refusalDetails?: string;
  lastVisaDetails?: string;
  petitionDetails?: string;
  usVisitDetails?: string;
  [key: string]: unknown;
}

interface DocumentFile {
  fileName?: string;
  fileUrl?: string;
  documentType?: string;
}

interface Documents {
  photo?: DocumentFile;
  invitationLetter?: DocumentFile;
  additionalDocuments?: DocumentFile[];
}

interface ApplicationDetailModalProps {
  application: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate?: (application: any) => void;
}

const statusOptions = [
  { value: 'DRAFT', label: 'Draft', color: 'bg-gray-500' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-500' },
  { value: 'SUBMITTED', label: 'Submitted', color: 'bg-indigo-500' },
  { value: 'UNDER_REVIEW', label: 'Under Review', color: 'bg-purple-500' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-green-500' },
  { value: 'REJECTED', label: 'Rejected', color: 'bg-red-500' },
];

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    DRAFT: 'bg-gray-500/20 text-gray-600 dark:text-gray-300 border-gray-500/30',
    IN_PROGRESS: 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/30',
    SUBMITTED: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border-indigo-500/30',
    UNDER_REVIEW: 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30',
    COMPLETED: 'bg-green-500/20 text-green-600 dark:text-green-300 border-green-500/30',
    REJECTED: 'bg-red-500/20 text-red-600 dark:text-red-300 border-red-500/30',
  };
  return styles[status] || styles.DRAFT;
};

const sectionTabs = [
  { value: 'personal', label: 'Personal', icon: User, hint: 'Identity & profile' },
  { value: 'contact', label: 'Contact', icon: Phone, hint: 'Email, phone, address' },
  { value: 'passport', label: 'Passport', icon: BookOpen, hint: 'Document identity' },
  { value: 'travel', label: 'Travel', icon: Plane, hint: 'Trip plan & support' },
  { value: 'family', label: 'Family', icon: Users, hint: 'Parents, spouse, children' },
  { value: 'work', label: 'Work', icon: Briefcase, hint: 'Work & education history' },
  { value: 'security', label: 'Security', icon: Shield, hint: 'Security answers' },
  { value: 'docs', label: 'Documents', icon: FileText, hint: 'Uploaded files' },
] as const;

function parseFormData<T>(value?: unknown): T | null {
  if (!value) return null;
  if (typeof value === 'object') return value as T;
  if (typeof value !== 'string') return null;

  try {
    const parsed = JSON.parse(value);
    return typeof parsed === 'object' && parsed !== null
      ? (parsed as T)
      : null;
  } catch {
    // Admin list endpoints return encrypted strings for sensitive sections.
    // Never return the raw string here, because downstream UI assumes an object.
    return null;
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

const InfoRow = ({ label, value, icon: Icon }: { label: string; value?: string | null; icon?: any }) => (
  <div className="flex items-start gap-3 py-2">
    {Icon && <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />}
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium whitespace-pre-wrap break-words">{value || '-'}</p>
    </div>
  </div>
);

const JsonFallback = ({ data }: { data: unknown }) => (
  <div className="rounded-lg border border-border bg-muted/40 p-3">
    <p className="text-xs text-muted-foreground mb-2">
      Showing raw section data (schema differs from current template)
    </p>
    <pre className="text-xs overflow-auto whitespace-pre-wrap break-all">
      {JSON.stringify(data, null, 2)}
    </pre>
  </div>
);

export default function ApplicationDetailModal({
  application,
  open,
  onOpenChange,
  onStatusUpdate,
}: ApplicationDetailModalProps) {
  const [activeTab, setActiveTab] = useState('personal');
  const [selectedStatus, setSelectedStatus] = useState(application?.status || 'DRAFT');
  const [adminNotes, setAdminNotes] = useState(application?.adminNotes || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [details, setDetails] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedStatus(application?.status || 'DRAFT');
    setAdminNotes(application?.adminNotes || '');
    setActiveTab('personal');
  }, [application]);

  useEffect(() => {
    let cancelled = false;

    const loadDetails = async () => {
      if (!open || !application?.id) {
        setDetails(null);
        setDetailsError(null);
        return;
      }

      setDetailsLoading(true);
      setDetailsError(null);
      try {
        // Fetch decrypted details via the admin endpoint (includes related user info).
        const res = await api.get(`/api/admin/applications/${application.id}`);
        const payload = res.data?.data ?? res.data;
        if (!cancelled) setDetails(payload);
      } catch (error: any) {
        if (!cancelled) {
          setDetails(null);
          setDetailsError(
            error?.message ||
              'Failed to load application details. Check your API configuration and try again.',
          );
        }
      } finally {
        if (!cancelled) setDetailsLoading(false);
      }
    };

    void loadDetails();
    return () => {
      cancelled = true;
    };
  }, [open, application?.id]);

  if (!application) return null;

  const app = details || application;
  const safeStatus = typeof app?.status === 'string' && app.status ? app.status : 'DRAFT';

  const personalInfo = parseFormData<PersonalInfo>(app.personalInfo);
  const contactInfo = parseFormData<ContactInfo>(app.contactInfo);
  const passportInfo = parseFormData<PassportInfo>(app.passportInfo);
  const travelInfo = parseFormData<TravelInfo>(app.travelInfo);
  const familyInfo = parseFormData<FamilyInfo>(app.familyInfo);
  const workEducation = parseFormData<WorkEducation>(app.workEducation);
  const securityInfo = parseFormData<SecurityInfo>(app.securityInfo);
  const documents = parseFormData<Documents>(app.documents);
  const hasFamilyStructuredData = Boolean(
    familyInfo &&
      (familyInfo.fatherGivenNames ||
        familyInfo.fatherSurnames ||
        familyInfo.motherGivenNames ||
        familyInfo.motherSurnames ||
        familyInfo.hasSpouse ||
        (familyInfo.children && familyInfo.children.length > 0) ||
        (familyInfo.immediateRelativesInUS && familyInfo.immediateRelativesInUS.length > 0) ||
        (familyInfo.otherRelativesInUS && familyInfo.otherRelativesInUS.length > 0)),
  );
  const hasWorkStructuredData = Boolean(
    workEducation &&
      (workEducation.primaryOccupation ||
        workEducation.presentEmployerName ||
        (workEducation.previousEmployment && workEducation.previousEmployment.length > 0) ||
        (workEducation.education && workEducation.education.length > 0) ||
        (workEducation.languages && workEducation.languages.length > 0) ||
        (workEducation.countriesVisited && workEducation.countriesVisited.length > 0) ||
        (workEducation.professionalOrgs && workEducation.professionalOrgs.length > 0) ||
        workEducation.specializedSkillsDescription ||
        workEducation.hasServedInMilitary),
  );
  const hasSecurityStructuredData = Boolean(
    securityInfo &&
      Object.values(securityInfo).some((value) => typeof value === 'boolean'),
  );
  const hasDocumentsStructuredData = Boolean(
    documents &&
      (documents.photo ||
        documents.invitationLetter ||
        (documents.additionalDocuments && documents.additionalDocuments.length > 0)),
  );
  const hasPhotoOnlyDocument = Boolean(!hasDocumentsStructuredData && app.photoUrl);
  const hasEncryptedSections =
    typeof application?.personalInfo === 'string' ||
    typeof application?.contactInfo === 'string' ||
    typeof application?.passportInfo === 'string' ||
    typeof application?.travelInfo === 'string' ||
    typeof application?.familyInfo === 'string' ||
    typeof application?.workEducation === 'string' ||
    typeof application?.securityInfo === 'string';
  const hasAnyDecryptedSection =
    Boolean(personalInfo) ||
    Boolean(contactInfo) ||
    Boolean(passportInfo) ||
    Boolean(travelInfo) ||
    Boolean(familyInfo) ||
    Boolean(workEducation) ||
    Boolean(securityInfo) ||
    Boolean(documents);

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    try {
      const response = await api.put(`/api/admin/applications/${application.id}/status`, {
        status: selectedStatus,
        adminNotes,
      });
      toast.success('Application status updated successfully');
      if (onStatusUpdate) {
        onStatusUpdate(response.data.data);
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportPDF = () => {
    // Create a printable version of the application
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to export PDF');
      return;
    }

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Application ${app.id} - ${app.user?.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
          h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
          .info-row { display: flex; margin: 8px 0; }
          .label { font-weight: 600; width: 200px; color: #6b7280; }
          .value { flex: 1; }
          .status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; }
          .status-completed { background: #dcfce7; color: #166534; }
          .status-pending { background: #fef3c7; color: #92400e; }
          .status-rejected { background: #fee2e2; color: #991b1b; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>DS-160 Visa Application</h1>
        <p><strong>Application ID:</strong> ${app.id}</p>
        <p><strong>Status:</strong> <span class="status status-${String(safeStatus).toLowerCase()}">${safeStatus}</span></p>
        <p><strong>Visa Type:</strong> ${app.visaType}</p>
        <p><strong>Submitted:</strong> ${formatDate(app.submittedAt || app.createdAt)}</p>

        ${personalInfo ? `
          <h2>Personal Information</h2>
          <div class="info-row"><span class="label">Full Name:</span><span class="value">${personalInfo.givenNames || ''} ${personalInfo.surnames || ''}</span></div>
          <div class="info-row"><span class="label">Date of Birth:</span><span class="value">${formatDate(personalInfo.dateOfBirth)}</span></div>
          <div class="info-row"><span class="label">Gender:</span><span class="value">${personalInfo.sex === 'M' ? 'Male' : 'Female'}</span></div>
          <div class="info-row"><span class="label">Nationality:</span><span class="value">${personalInfo.nationality || '-'}</span></div>
          <div class="info-row"><span class="label">Place of Birth:</span><span class="value">${personalInfo.cityOfBirth || ''}, ${personalInfo.countryOfBirth || ''}</span></div>
          <div class="info-row"><span class="label">Marital Status:</span><span class="value">${personalInfo.maritalStatus || '-'}</span></div>
        ` : ''}

        ${contactInfo ? `
          <h2>Contact Information</h2>
          <div class="info-row"><span class="label">Email:</span><span class="value">${contactInfo.email || '-'}</span></div>
          <div class="info-row"><span class="label">Phone:</span><span class="value">${contactInfo.phone || '-'}</span></div>
          <div class="info-row"><span class="label">Address:</span><span class="value">${contactInfo.homeAddress?.street || ''}, ${contactInfo.homeAddress?.city || ''}, ${contactInfo.homeAddress?.country || ''}</span></div>
        ` : ''}

        ${passportInfo ? `
          <h2>Passport Information</h2>
          <div class="info-row"><span class="label">Passport Number:</span><span class="value">${passportInfo.passportNumber || '-'}</span></div>
          <div class="info-row"><span class="label">Type:</span><span class="value">${passportInfo.passportType || '-'}</span></div>
          <div class="info-row"><span class="label">Country of Issuance:</span><span class="value">${passportInfo.countryOfIssuance || '-'}</span></div>
          <div class="info-row"><span class="label">Issue Date:</span><span class="value">${formatDate(passportInfo.issuanceDate)}</span></div>
          <div class="info-row"><span class="label">Expiry Date:</span><span class="value">${formatDate(passportInfo.expirationDate)}</span></div>
        ` : ''}

        ${travelInfo ? `
          <h2>Travel Information</h2>
          <div class="info-row"><span class="label">Purpose of Trip:</span><span class="value">${travelInfo.purposeOfTrip || '-'}</span></div>
          <div class="info-row"><span class="label">Intended Arrival:</span><span class="value">${formatDate(travelInfo.intendedArrivalDate)}</span></div>
          <div class="info-row"><span class="label">Length of Stay:</span><span class="value">${travelInfo.intendedLengthOfStay || '-'}</span></div>
          <div class="info-row"><span class="label">US Address:</span><span class="value">${travelInfo.addressWhileInUS?.street || ''}, ${travelInfo.addressWhileInUS?.city || ''}, ${travelInfo.addressWhileInUS?.state || ''}</span></div>
        ` : ''}

        ${workEducation ? `
          <h2>Work & Education</h2>
          <div class="info-row"><span class="label">Occupation:</span><span class="value">${workEducation.primaryOccupation || '-'}</span></div>
          <div class="info-row"><span class="label">Employer:</span><span class="value">${workEducation.presentEmployerName || '-'}</span></div>
        ` : ''}

        <p style="margin-top: 40px; color: #9ca3af; font-size: 12px;">Generated on ${new Date().toLocaleString()}</p>
      </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[100vw] sm:w-[94vw] max-w-[1200px] h-[100dvh] sm:h-[92vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="p-4 sm:p-6 pb-4 border-b bg-gradient-to-r from-primary/10 via-background to-background">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <DialogTitle className="text-xl sm:text-2xl">Application Details</DialogTitle>
              <DialogDescription className="mt-1 font-mono text-xs break-all">
                Application ID: {app.id}
              </DialogDescription>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1">
                  <Globe className="w-3 h-3" />
                  {app.visaType} Visa
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1">
                  <Calendar className="w-3 h-3" />
                  Created {formatDate(app.createdAt)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1">
                  <Clock className="w-3 h-3" />
                  Step {app.currentStep || 1}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2">
              <Badge className={getStatusBadge(safeStatus)}>{safeStatus}</Badge>
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-4 sm:p-6 pt-3 sm:pt-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="grid grid-cols-1 xl:grid-cols-[250px_minmax(0,1fr)] gap-4 xl:gap-6">
                <div className="space-y-4 self-start">
                  <Card className="border-dashed">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Applicant Snapshot</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      <InfoRow
                        label="Applicant"
                        value={`${personalInfo?.givenNames || app.user?.name || '-'} ${personalInfo?.surnames || ''}`.trim()}
                        icon={User}
                      />
                      <InfoRow label="Email" value={app.user?.email || '-'} icon={Mail} />
                      <InfoRow label="Visa Type" value={`${app.visaType} Visa`} icon={Globe} />
                      <InfoRow label="Submitted" value={formatDate(app.submittedAt || app.createdAt)} icon={Calendar} />
                      <InfoRow label="Current Step" value={String(app.currentStep || 1)} icon={Clock} />
                    </CardContent>
                  </Card>

                  <Card className="border-dashed">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Sections</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <TabsList className="w-full h-auto grid grid-cols-2 xl:grid-cols-1 gap-2 bg-transparent p-0">
                        {sectionTabs.map((tab) => {
                          const Icon = tab.icon;
                          return (
                            <TabsTrigger
                              key={tab.value}
                              value={tab.value}
                              className="h-auto rounded-lg border border-border bg-background data-[state=active]:bg-primary/10 data-[state=active]:border-primary/30 data-[state=active]:text-primary px-3 py-2.5 text-left justify-start"
                            >
                              <div className="flex items-start gap-2">
                                <Icon className="w-4 h-4 mt-0.5" />
                                <div className="min-w-0">
                                  <div className="text-xs font-semibold">{tab.label}</div>
                                  <div className="text-[11px] text-muted-foreground leading-tight">{tab.hint}</div>
                                </div>
                              </div>
                            </TabsTrigger>
                          );
                        })}
                      </TabsList>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  {detailsError && (
                    <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                      {detailsError}
                    </div>
                  )}
                  {!detailsLoading && !detailsError && hasEncryptedSections && !hasAnyDecryptedSection && (
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
                      Application sections could not be decrypted. This can happen if the server encryption key was
                      changed after the application was saved. Metadata is still available.
                    </div>
                  )}
                  {detailsLoading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground rounded-lg border border-border p-4">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading application details…
                    </div>
                  )}

              {/* Personal Information */}
              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {personalInfo ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoRow label="Surnames" value={personalInfo.surnames} icon={User} />
                        <InfoRow label="Given Names" value={personalInfo.givenNames} icon={User} />
                        <InfoRow label="Full Name (Native)" value={personalInfo.fullNameNative} />
                        <InfoRow label="Date of Birth" value={formatDate(personalInfo.dateOfBirth)} icon={Calendar} />
                        <InfoRow label="Gender" value={personalInfo.sex === 'M' ? 'Male' : 'Female'} />
                        <InfoRow label="Marital Status" value={personalInfo.maritalStatus} />
                        <InfoRow label="Nationality" value={personalInfo.nationality} icon={Globe} />
                        <InfoRow label="Country of Birth" value={personalInfo.countryOfBirth} icon={MapPin} />
                        <InfoRow label="City of Birth" value={personalInfo.cityOfBirth} icon={MapPin} />
                        <InfoRow label="State of Birth" value={personalInfo.stateOfBirth} />
                        <InfoRow label="Other Names Used" value={personalInfo.otherNamesUsed ? 'Yes' : 'No'} />
                        {personalInfo.otherNames && personalInfo.otherNames.length > 0 && (
                          <InfoRow label="Other Names" value={personalInfo.otherNames.join(', ')} />
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No personal information provided</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contact Information */}
              <TabsContent value="contact">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {contactInfo ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoRow label="Email" value={contactInfo.email} icon={Mail} />
                          <InfoRow label="Phone" value={contactInfo.phone} icon={Phone} />
                          <InfoRow label="Secondary Phone" value={contactInfo.secondaryPhone} icon={Phone} />
                          <InfoRow label="Work Phone" value={contactInfo.workPhone} icon={Phone} />
                        </div>
                        <Separator />
                        <div>
                          <h4 className="font-medium mb-3">Home Address</h4>
                          {contactInfo.homeAddress && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                              <InfoRow label="Street" value={contactInfo.homeAddress.street} icon={MapPin} />
                              <InfoRow label="City" value={contactInfo.homeAddress.city} />
                              <InfoRow label="State" value={contactInfo.homeAddress.state} />
                              <InfoRow label="Postal Code" value={contactInfo.homeAddress.postalCode} />
                              <InfoRow label="Country" value={contactInfo.homeAddress.country} icon={Globe} />
                            </div>
                          )}
                        </div>
                        {contactInfo.mailingAddress && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium mb-3">Mailing Address</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                                <InfoRow label="Street" value={contactInfo.mailingAddress.street} icon={MapPin} />
                                <InfoRow label="City" value={contactInfo.mailingAddress.city} />
                                <InfoRow label="State" value={contactInfo.mailingAddress.state} />
                                <InfoRow label="Postal Code" value={contactInfo.mailingAddress.postalCode} />
                                <InfoRow label="Country" value={contactInfo.mailingAddress.country} icon={Globe} />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No contact information provided</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Passport Information */}
              <TabsContent value="passport">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Passport Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {passportInfo ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoRow label="Passport Type" value={passportInfo.passportType} />
                        <InfoRow label="Passport Number" value={passportInfo.passportNumber} />
                        <InfoRow label="Book Number" value={passportInfo.passportBookNumber} />
                        <InfoRow label="Country of Issuance" value={passportInfo.countryOfIssuance} icon={Globe} />
                        <InfoRow label="City of Issuance" value={passportInfo.cityOfIssuance} icon={MapPin} />
                        <InfoRow label="State of Issuance" value={passportInfo.stateOfIssuance} />
                        <InfoRow label="Issue Date" value={formatDate(passportInfo.issuanceDate)} icon={Calendar} />
                        <InfoRow label="Expiry Date" value={formatDate(passportInfo.expirationDate)} icon={Calendar} />
                        <InfoRow label="Has Other Passport" value={passportInfo.hasOtherPassport ? 'Yes' : 'No'} />
                        {passportInfo.otherPassportInfo && (
                          <>
                            <InfoRow label="Other Passport Number" value={passportInfo.otherPassportInfo.number} />
                            <InfoRow label="Other Passport Country" value={passportInfo.otherPassportInfo.country} />
                          </>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No passport information provided</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Travel Information */}
              <TabsContent value="travel">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Plane className="w-4 h-4" />
                      Travel Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {travelInfo ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoRow label="Purpose of Trip" value={travelInfo.purposeOfTrip} />
                          <InfoRow label="Specific Purpose" value={travelInfo.specificPurpose} />
                          <InfoRow label="Intended Arrival" value={formatDate(travelInfo.intendedArrivalDate)} icon={Calendar} />
                          <InfoRow label="Length of Stay" value={travelInfo.intendedLengthOfStay} />
                          <InfoRow label="Destination Country" value={travelInfo.destinationCountry || 'USA'} icon={Globe} />
                          <InfoRow label="No U.S. Address Yet" value={travelInfo.noUSAddressYet ? 'Yes' : 'No'} />
                          <InfoRow label="Paying for Trip" value={travelInfo.payingForTrip} />
                          <InfoRow label="Traveling with Others" value={travelInfo.travelingWithOthers ? 'Yes' : 'No'} />
                        </div>
                        {!travelInfo.noUSAddressYet && travelInfo.addressWhileInUS && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium mb-3">Address While in US</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                                <InfoRow label="Street" value={travelInfo.addressWhileInUS.street} icon={MapPin} />
                                <InfoRow label="City" value={travelInfo.addressWhileInUS.city} />
                                <InfoRow label="State" value={travelInfo.addressWhileInUS.state} />
                                <InfoRow label="ZIP Code" value={travelInfo.addressWhileInUS.zipCode} />
                              </div>
                            </div>
                          </>
                        )}
                        {travelInfo.noUSAddressYet && (
                          <>
                            <Separator />
                            <p className="text-sm text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                              Applicant selected no U.S. address yet. Travel support services may be required.
                            </p>
                          </>
                        )}
                        {travelInfo.supportServices && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium mb-3">Requested Support Services</h4>
                              <div className="flex flex-wrap gap-2 pl-4">
                                {travelInfo.supportServices.hotelBooking && <Badge variant="secondary">Hotel Booking</Badge>}
                                {travelInfo.supportServices.travelItinerary && <Badge variant="secondary">Travel Itinerary</Badge>}
                                {travelInfo.supportServices.preFlightBooking && <Badge variant="secondary">Pre-Flight Booking</Badge>}
                                {travelInfo.supportServices.declarationFormAssistance && (
                                  <Badge variant="secondary">Declaration/VFS Form Assistance</Badge>
                                )}
                                {!travelInfo.supportServices.hotelBooking &&
                                  !travelInfo.supportServices.travelItinerary &&
                                  !travelInfo.supportServices.preFlightBooking &&
                                  !travelInfo.supportServices.declarationFormAssistance && (
                                    <p className="text-sm text-muted-foreground">No support services selected</p>
                                  )}
                              </div>
                            </div>
                          </>
                        )}
                        {travelInfo.supportNotes && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium mb-3">Support Notes</h4>
                              <p className="text-sm text-muted-foreground pl-4">{travelInfo.supportNotes}</p>
                            </div>
                          </>
                        )}
                        {travelInfo.companions && travelInfo.companions.length > 0 && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium mb-3">Travel Companions</h4>
                              <div className="space-y-2 pl-4">
                                {travelInfo.companions.map((c: Companion, i: number) => (
                                  <div key={i} className="flex items-center gap-4 p-2 bg-muted/50 rounded">
                                    <span className="font-medium">{c.name}</span>
                                    <span className="text-muted-foreground">({c.relationship})</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No travel information provided</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Family Information */}
              <TabsContent value="family">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Family Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {familyInfo ? (
                      hasFamilyStructuredData ? (
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-medium mb-3">Father</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                            <InfoRow label="Name" value={`${familyInfo.fatherGivenNames || ''} ${familyInfo.fatherSurnames || ''}`} icon={User} />
                            <InfoRow label="Date of Birth" value={formatDate(familyInfo.fatherDateOfBirth)} icon={Calendar} />
                            <InfoRow label="In US" value={familyInfo.isFatherInUS ? 'Yes' : 'No'} />
                            {familyInfo.isFatherInUS && <InfoRow label="US Status" value={familyInfo.fatherUSStatus} />}
                          </div>
                        </div>
                        <Separator />
                        <div>
                          <h4 className="font-medium mb-3">Mother</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                            <InfoRow label="Name" value={`${familyInfo.motherGivenNames || ''} ${familyInfo.motherSurnames || ''}`} icon={User} />
                            <InfoRow label="Date of Birth" value={formatDate(familyInfo.motherDateOfBirth)} icon={Calendar} />
                            <InfoRow label="In US" value={familyInfo.isMotherInUS ? 'Yes' : 'No'} />
                            {familyInfo.isMotherInUS && <InfoRow label="US Status" value={familyInfo.motherUSStatus} />}
                          </div>
                        </div>
                        {familyInfo.hasSpouse && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium mb-3">Spouse</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                                <InfoRow label="Full Name" value={familyInfo.spouseFullName} icon={User} />
                                <InfoRow label="Date of Birth" value={formatDate(familyInfo.spouseDateOfBirth)} icon={Calendar} />
                                <InfoRow label="Nationality" value={familyInfo.spouseNationality} icon={Globe} />
                                <InfoRow label="Place of Birth" value={`${familyInfo.spouseCityOfBirth || ''}, ${familyInfo.spouseCountryOfBirth || ''}`} icon={MapPin} />
                              </div>
                            </div>
                          </>
                        )}
                        {familyInfo.children && familyInfo.children.length > 0 && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium mb-3">Children</h4>
                              <div className="space-y-2 pl-4">
                                {familyInfo.children.map((child: Child, i: number) => (
                                  <div key={i} className="p-3 bg-muted/50 rounded">
                                    <p className="font-medium">{child.fullName}</p>
                                    <p className="text-sm text-muted-foreground">
                                      DOB: {formatDate(child.dateOfBirth)} | {child.relationship}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                        {familyInfo.immediateRelativesInUS && familyInfo.immediateRelativesInUS.length > 0 && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium mb-3">Immediate Relatives in US</h4>
                              <div className="space-y-2 pl-4">
                                {familyInfo.immediateRelativesInUS.map((rel: Relative, i: number) => (
                                  <div key={i} className="p-3 bg-muted/50 rounded">
                                    <p className="font-medium">{rel.fullName}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {rel.relationship} | Status: {rel.status}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                        {familyInfo.otherRelativesInUS && familyInfo.otherRelativesInUS.length > 0 && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium mb-3">Other Relatives in US</h4>
                              <div className="space-y-2 pl-4">
                                {familyInfo.otherRelativesInUS.map((rel: Relative, i: number) => (
                                  <div key={i} className="p-3 bg-muted/50 rounded">
                                    <p className="font-medium">{rel.fullName}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {rel.relationship} | Status: {rel.status}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      ) : (
                        <JsonFallback data={familyInfo} />
                      )
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        Family section is not completed yet by the applicant.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Work & Education */}
              <TabsContent value="work">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Work & Education
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {workEducation ? (
                      hasWorkStructuredData ? (
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-medium mb-3">Current Employment</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                            <InfoRow label="Occupation" value={workEducation.primaryOccupation} icon={Briefcase} />
                            <InfoRow label="Employer" value={workEducation.presentEmployerName} />
                            <InfoRow label="Monthly Salary" value={workEducation.monthlySalary} />
                            <InfoRow label="Start Date" value={formatDate(workEducation.startDate)} icon={Calendar} />
                            <InfoRow label="Job Duties" value={workEducation.jobDuties} />
                            <InfoRow label="Employer Phone" value={workEducation.presentEmployerPhone} icon={Phone} />
                          </div>
                        </div>
                        {workEducation.education && workEducation.education.length > 0 && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium mb-3">Education</h4>
                              <div className="space-y-2 pl-4">
                                {workEducation.education.map((edu: Education, i: number) => (
                                  <div key={i} className="p-3 bg-muted/50 rounded">
                                    <p className="font-medium">{edu.institutionName}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {edu.courseOfStudy} | {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                        {workEducation.languages && workEducation.languages.length > 0 && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium mb-3">Languages</h4>
                              <div className="flex flex-wrap gap-2 pl-4">
                                {workEducation.languages.map((lang: string, i: number) => (
                                  <Badge key={i} variant="secondary">{lang}</Badge>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                        {workEducation.previousEmployment && workEducation.previousEmployment.length > 0 && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium mb-3">Previous Employment</h4>
                              <div className="space-y-2 pl-4">
                                {workEducation.previousEmployment.map((job, i: number) => (
                                  <div key={i} className="p-3 bg-muted/50 rounded space-y-1">
                                    <p className="font-medium">{job.employerName || 'Employer'}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {job.jobTitle || '-'} | {formatDate(job.startDate)} - {formatDate(job.endDate)}
                                    </p>
                                    {job.duties && (
                                      <p className="text-sm text-muted-foreground">{job.duties}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                        {workEducation.countriesVisited && workEducation.countriesVisited.length > 0 && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium mb-3">Countries Visited (Last 5 Years)</h4>
                              <div className="flex flex-wrap gap-2 pl-4">
                                {workEducation.countriesVisited.map((country: string, i: number) => (
                                  <Badge key={i} variant="secondary">{country}</Badge>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                        {workEducation.professionalOrgs && workEducation.professionalOrgs.length > 0 && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium mb-3">Professional Organizations</h4>
                              <div className="flex flex-wrap gap-2 pl-4">
                                {workEducation.professionalOrgs.map((org: string, i: number) => (
                                  <Badge key={i} variant="secondary">{org}</Badge>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                        {(workEducation.hasSpecializedSkills || workEducation.specializedSkillsDescription) && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium mb-3">Specialized Skills</h4>
                              <div className="pl-4">
                                <InfoRow
                                  label="Has Specialized Skills"
                                  value={workEducation.hasSpecializedSkills ? 'Yes' : 'No'}
                                />
                                {workEducation.specializedSkillsDescription && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {workEducation.specializedSkillsDescription}
                                  </p>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                        {workEducation.belongsToClanOrTribe && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium mb-3">Clan / Tribe</h4>
                              <p className="text-sm text-muted-foreground pl-4">
                                {workEducation.clanOrTribeName || 'Provided'}
                              </p>
                            </div>
                          </>
                        )}
                        {workEducation.hasServedInMilitary && workEducation.militaryService && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium mb-3">Military Service</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                                <InfoRow label="Country" value={workEducation.militaryService.country} icon={Globe} />
                                <InfoRow label="Branch" value={workEducation.militaryService.branch} />
                                <InfoRow label="Rank" value={workEducation.militaryService.rank} />
                                <InfoRow label="Specialty" value={workEducation.militaryService.specialty} />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      ) : (
                        <JsonFallback data={workEducation} />
                      )
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        Work and education section is not completed yet by the applicant.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Questions */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Security Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {securityInfo ? (
                      hasSecurityStructuredData ? (
                      <div className="space-y-4">
                        {[
                          { key: 'hasCommunicableDisease', label: 'Has communicable disease' },
                          { key: 'hasMentalOrPhysicalDisorder', label: 'Has mental/physical disorder' },
                          { key: 'isDrugAbuser', label: 'Drug abuser' },
                          { key: 'hasBeenArrested', label: 'Has been arrested' },
                          { key: 'hasViolatedControlledSubstancesLaw', label: 'Violated controlled substances law' },
                          { key: 'isEngagedInProstitution', label: 'Engaged in prostitution' },
                          { key: 'isInvolvedInMoneyLaundering', label: 'Involved in money laundering' },
                          { key: 'hasCommittedHumanTrafficking', label: 'Committed human trafficking offense' },
                          { key: 'hasBenefitedFromTrafficking', label: 'Benefited from trafficking activities' },
                          { key: 'hasAidedHumanTrafficking', label: 'Aided human trafficking' },
                          { key: 'seeksEspionage', label: 'Seeks to engage in espionage' },
                          { key: 'seeksToEngageInTerrorism', label: 'Seeks to engage in terrorism' },
                          { key: 'hasProvidedTerroristSupport', label: 'Has provided terrorist support' },
                          { key: 'isTerroristOrganizationMember', label: 'Terrorist organization member' },
                          { key: 'isRelatedToTerrorist', label: 'Related to terrorist activity individual' },
                          { key: 'hasParticipatedInGenocide', label: 'Participated in genocide' },
                          { key: 'hasParticipatedInTorture', label: 'Participated in torture' },
                          { key: 'hasParticipatedInExtrajudicialKillings', label: 'Participated in extrajudicial killings' },
                          { key: 'hasRecruitedChildSoldiers', label: 'Recruited child soldiers' },
                          { key: 'hasViolatedReligiousFreedom', label: 'Violated religious freedom' },
                          { key: 'hasEnforcedPopulationControls', label: 'Enforced population controls' },
                          { key: 'hasInvolvedInOrganTrafficking', label: 'Involved in organ trafficking' },
                          { key: 'hasSoughtVisaByFraud', label: 'Sought visa by fraud' },
                          { key: 'hasBeenRemovedOrDeported', label: 'Removed or deported from any country' },
                          { key: 'hasWithheldCustodyOfUSCitizen', label: 'Withheld custody of U.S. citizen child' },
                          { key: 'hasVotedInUSIllegally', label: 'Voted in U.S. illegally' },
                          { key: 'hasRenouncedUSCitizenshipToAvoidTax', label: 'Renounced U.S. citizenship to avoid tax' },
                          { key: 'hasBeenInUS', label: 'Has been in US before' },
                          { key: 'hasBeenIssuedUSVisa', label: 'Has been issued US visa' },
                          { key: 'hasBeenRefusedUSVisa', label: 'Has been refused US visa' },
                          { key: 'hasImmigrantPetitionFiled', label: 'Has immigrant petition filed' },
                        ].map(({ key, label }) => (
                          <div key={key} className="flex items-center justify-between py-2 border-b">
                            <span className="text-sm">{label}</span>
                            {securityInfo[key] ? (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <XCircle className="w-3 h-3" />
                                Yes
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                No
                              </Badge>
                            )}
                          </div>
                        ))}
                        {securityInfo.usVisitDetails && (
                          <div className="mt-4">
                            <Label>US Visit Details</Label>
                            <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted/50 rounded">
                              {securityInfo.usVisitDetails}
                            </p>
                          </div>
                        )}
                        {securityInfo.arrestDetails && (
                          <div className="mt-4">
                            <Label>Arrest Details</Label>
                            <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted/50 rounded">
                              {securityInfo.arrestDetails}
                            </p>
                          </div>
                        )}
                        {securityInfo.lastVisaDetails && (
                          <div className="mt-4">
                            <Label>Last U.S. Visa Details</Label>
                            <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted/50 rounded">
                              {securityInfo.lastVisaDetails}
                            </p>
                          </div>
                        )}
                        {securityInfo.refusalDetails && (
                          <div className="mt-4">
                            <Label>Visa Refusal Details</Label>
                            <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted/50 rounded">
                              {securityInfo.refusalDetails}
                            </p>
                          </div>
                        )}
                        {securityInfo.petitionDetails && (
                          <div className="mt-4">
                            <Label>Immigrant Petition Details</Label>
                            <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted/50 rounded">
                              {securityInfo.petitionDetails}
                            </p>
                          </div>
                        )}
                      </div>
                      ) : (
                        <JsonFallback data={securityInfo} />
                      )
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        Security section is not completed yet by the applicant.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Documents */}
              <TabsContent value="docs">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Uploaded Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {documents ? (
                      hasDocumentsStructuredData ? (
                      <div className="space-y-4">
                        {documents.photo && (
                          <div className="flex items-center justify-between p-3 border rounded">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                                <User className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">Photo</p>
                                <p className="text-xs text-muted-foreground">{documents.photo.fileName}</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <a href={documents.photo.fileUrl} target="_blank" rel="noopener noreferrer">
                                View
                              </a>
                            </Button>
                          </div>
                        )}
                        {documents.invitationLetter && (
                          <div className="flex items-center justify-between p-3 border rounded">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-500/10 rounded flex items-center justify-center">
                                <FileText className="w-5 h-5 text-blue-500" />
                              </div>
                              <div>
                                <p className="font-medium">Invitation Letter</p>
                                <p className="text-xs text-muted-foreground">{documents.invitationLetter.fileName}</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <a href={documents.invitationLetter.fileUrl} target="_blank" rel="noopener noreferrer">
                                View
                              </a>
                            </Button>
                          </div>
                        )}
                        {documents.additionalDocuments && documents.additionalDocuments.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-medium mb-3">Additional Documents</h4>
                            <div className="space-y-2">
                              {documents.additionalDocuments.map((doc: DocumentFile, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 border rounded">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                                      <FileText className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                      <p className="font-medium">{doc.documentType}</p>
                                      <p className="text-xs text-muted-foreground">{doc.fileName}</p>
                                    </div>
                                  </div>
                                  <Button variant="outline" size="sm" asChild>
                                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                      View
                                    </a>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {!documents.photo && !documents.invitationLetter && !documents.additionalDocuments?.length && (
                          <p className="text-muted-foreground text-center py-8">
                            No documents uploaded yet.
                          </p>
                        )}
                      </div>
                      ) : (
                        <JsonFallback data={documents} />
                      )
                    ) : hasPhotoOnlyDocument ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">Photo</p>
                              <p className="text-xs text-muted-foreground">{app.photoUrl}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={app.photoUrl} target="_blank" rel="noopener noreferrer">
                              View
                            </a>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No documents uploaded yet.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
                </div>
              </div>
            </Tabs>
          </div>
        </div>

        <DialogFooter className="p-4 sm:p-6 pt-4 border-t bg-background">
          <div className="w-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-4 items-end">
            <div className="space-y-2">
              <Label>Admin Notes</Label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes about this application..."
                rows={2}
              />
            </div>
            <div className="space-y-2 lg:min-w-[270px]">
              <Label>Update Status</Label>
              <div className="flex items-center gap-2">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full lg:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${opt.color}`} />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleUpdateStatus} disabled={isUpdating}>
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Update'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
