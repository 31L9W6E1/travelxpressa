import { useState } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Passport,
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

const parseFormData = (jsonString?: string) => {
  if (!jsonString) return null;
  try {
    return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
  } catch {
    return jsonString;
  }
};

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
      <p className="text-sm font-medium truncate">{value || '-'}</p>
    </div>
  </div>
);

export default function ApplicationDetailModal({
  application,
  open,
  onOpenChange,
  onStatusUpdate,
}: ApplicationDetailModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(application?.status || 'DRAFT');
  const [adminNotes, setAdminNotes] = useState(application?.adminNotes || '');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!application) return null;

  const personalInfo = parseFormData(application.personalInfo);
  const contactInfo = parseFormData(application.contactInfo);
  const passportInfo = parseFormData(application.passportInfo);
  const travelInfo = parseFormData(application.travelInfo);
  const familyInfo = parseFormData(application.familyInfo);
  const workEducation = parseFormData(application.workEducation);
  const securityInfo = parseFormData(application.securityInfo);
  const documents = parseFormData(application.documents);

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
        <title>Application ${application.id} - ${application.user?.name}</title>
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
        <p><strong>Application ID:</strong> ${application.id}</p>
        <p><strong>Status:</strong> <span class="status status-${application.status?.toLowerCase()}">${application.status}</span></p>
        <p><strong>Visa Type:</strong> ${application.visaType}</p>
        <p><strong>Submitted:</strong> ${formatDate(application.submittedAt || application.createdAt)}</p>

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
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Application Details</DialogTitle>
              <DialogDescription className="mt-1">
                Application ID: {application.id}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusBadge(application.status)}>
                {application.status}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[60vh]">
          <div className="p-6 pt-4">
            {/* Applicant Info Header */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">
                      {personalInfo?.givenNames} {personalInfo?.surnames}
                    </h3>
                    <p className="text-muted-foreground">{application.user?.email}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        {application.visaType} Visa
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Created {formatDate(application.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for different sections */}
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid grid-cols-4 lg:grid-cols-8 mb-4">
                <TabsTrigger value="personal" className="text-xs">
                  <User className="w-3 h-3 mr-1" />
                  Personal
                </TabsTrigger>
                <TabsTrigger value="contact" className="text-xs">
                  <Phone className="w-3 h-3 mr-1" />
                  Contact
                </TabsTrigger>
                <TabsTrigger value="passport" className="text-xs">
                  <Passport className="w-3 h-3 mr-1" />
                  Passport
                </TabsTrigger>
                <TabsTrigger value="travel" className="text-xs">
                  <Plane className="w-3 h-3 mr-1" />
                  Travel
                </TabsTrigger>
                <TabsTrigger value="family" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  Family
                </TabsTrigger>
                <TabsTrigger value="work" className="text-xs">
                  <Briefcase className="w-3 h-3 mr-1" />
                  Work
                </TabsTrigger>
                <TabsTrigger value="security" className="text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="docs" className="text-xs">
                  <FileText className="w-3 h-3 mr-1" />
                  Docs
                </TabsTrigger>
              </TabsList>

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
                      <div className="grid grid-cols-2 gap-4">
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
                        {personalInfo.otherNames?.length > 0 && (
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
                        <div className="grid grid-cols-2 gap-4">
                          <InfoRow label="Email" value={contactInfo.email} icon={Mail} />
                          <InfoRow label="Phone" value={contactInfo.phone} icon={Phone} />
                          <InfoRow label="Secondary Phone" value={contactInfo.secondaryPhone} icon={Phone} />
                          <InfoRow label="Work Phone" value={contactInfo.workPhone} icon={Phone} />
                        </div>
                        <Separator />
                        <div>
                          <h4 className="font-medium mb-3">Home Address</h4>
                          {contactInfo.homeAddress && (
                            <div className="grid grid-cols-2 gap-4 pl-4">
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
                              <div className="grid grid-cols-2 gap-4 pl-4">
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
                      <Passport className="w-4 h-4" />
                      Passport Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {passportInfo ? (
                      <div className="grid grid-cols-2 gap-4">
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
                        <div className="grid grid-cols-2 gap-4">
                          <InfoRow label="Purpose of Trip" value={travelInfo.purposeOfTrip} />
                          <InfoRow label="Specific Purpose" value={travelInfo.specificPurpose} />
                          <InfoRow label="Intended Arrival" value={formatDate(travelInfo.intendedArrivalDate)} icon={Calendar} />
                          <InfoRow label="Length of Stay" value={travelInfo.intendedLengthOfStay} />
                          <InfoRow label="Paying for Trip" value={travelInfo.payingForTrip} />
                          <InfoRow label="Traveling with Others" value={travelInfo.travelingWithOthers ? 'Yes' : 'No'} />
                        </div>
                        {travelInfo.addressWhileInUS && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium mb-3">Address While in US</h4>
                              <div className="grid grid-cols-2 gap-4 pl-4">
                                <InfoRow label="Street" value={travelInfo.addressWhileInUS.street} icon={MapPin} />
                                <InfoRow label="City" value={travelInfo.addressWhileInUS.city} />
                                <InfoRow label="State" value={travelInfo.addressWhileInUS.state} />
                                <InfoRow label="ZIP Code" value={travelInfo.addressWhileInUS.zipCode} />
                              </div>
                            </div>
                          </>
                        )}
                        {travelInfo.companions?.length > 0 && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium mb-3">Travel Companions</h4>
                              <div className="space-y-2 pl-4">
                                {travelInfo.companions.map((c: any, i: number) => (
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
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-medium mb-3">Father</h4>
                          <div className="grid grid-cols-2 gap-4 pl-4">
                            <InfoRow label="Name" value={`${familyInfo.fatherGivenNames || ''} ${familyInfo.fatherSurnames || ''}`} icon={User} />
                            <InfoRow label="Date of Birth" value={formatDate(familyInfo.fatherDateOfBirth)} icon={Calendar} />
                            <InfoRow label="In US" value={familyInfo.isFatherInUS ? 'Yes' : 'No'} />
                            {familyInfo.isFatherInUS && <InfoRow label="US Status" value={familyInfo.fatherUSStatus} />}
                          </div>
                        </div>
                        <Separator />
                        <div>
                          <h4 className="font-medium mb-3">Mother</h4>
                          <div className="grid grid-cols-2 gap-4 pl-4">
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
                              <div className="grid grid-cols-2 gap-4 pl-4">
                                <InfoRow label="Full Name" value={familyInfo.spouseFullName} icon={User} />
                                <InfoRow label="Date of Birth" value={formatDate(familyInfo.spouseDateOfBirth)} icon={Calendar} />
                                <InfoRow label="Nationality" value={familyInfo.spouseNationality} icon={Globe} />
                                <InfoRow label="Place of Birth" value={`${familyInfo.spouseCityOfBirth || ''}, ${familyInfo.spouseCountryOfBirth || ''}`} icon={MapPin} />
                              </div>
                            </div>
                          </>
                        )}
                        {familyInfo.children?.length > 0 && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium mb-3">Children</h4>
                              <div className="space-y-2 pl-4">
                                {familyInfo.children.map((child: any, i: number) => (
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
                        {familyInfo.immediateRelativesInUS?.length > 0 && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium mb-3">Immediate Relatives in US</h4>
                              <div className="space-y-2 pl-4">
                                {familyInfo.immediateRelativesInUS.map((rel: any, i: number) => (
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
                      <p className="text-muted-foreground text-center py-8">No family information provided</p>
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
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-medium mb-3">Current Employment</h4>
                          <div className="grid grid-cols-2 gap-4 pl-4">
                            <InfoRow label="Occupation" value={workEducation.primaryOccupation} icon={Briefcase} />
                            <InfoRow label="Employer" value={workEducation.presentEmployerName} />
                            <InfoRow label="Monthly Salary" value={workEducation.monthlySalary} />
                            <InfoRow label="Start Date" value={formatDate(workEducation.startDate)} icon={Calendar} />
                            <InfoRow label="Job Duties" value={workEducation.jobDuties} />
                            <InfoRow label="Employer Phone" value={workEducation.presentEmployerPhone} icon={Phone} />
                          </div>
                        </div>
                        {workEducation.education?.length > 0 && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium mb-3">Education</h4>
                              <div className="space-y-2 pl-4">
                                {workEducation.education.map((edu: any, i: number) => (
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
                        {workEducation.languages?.length > 0 && (
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
                        {workEducation.hasServedInMilitary && workEducation.militaryService && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium mb-3">Military Service</h4>
                              <div className="grid grid-cols-2 gap-4 pl-4">
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
                      <p className="text-muted-foreground text-center py-8">No work/education information provided</p>
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
                      <div className="space-y-4">
                        {[
                          { key: 'hasCommunicableDisease', label: 'Has communicable disease' },
                          { key: 'hasMentalOrPhysicalDisorder', label: 'Has mental/physical disorder' },
                          { key: 'isDrugAbuser', label: 'Drug abuser' },
                          { key: 'hasBeenArrested', label: 'Has been arrested' },
                          { key: 'hasViolatedControlledSubstancesLaw', label: 'Violated controlled substances law' },
                          { key: 'seeksEspionage', label: 'Seeks to engage in espionage' },
                          { key: 'seeksToEngageInTerrorism', label: 'Seeks to engage in terrorism' },
                          { key: 'hasProvidedTerroristSupport', label: 'Has provided terrorist support' },
                          { key: 'isTerroristOrganizationMember', label: 'Terrorist organization member' },
                          { key: 'hasBeenInUS', label: 'Has been in US before' },
                          { key: 'hasBeenIssuedUSVisa', label: 'Has been issued US visa' },
                          { key: 'hasBeenRefusedUSVisa', label: 'Has been refused US visa' },
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
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No security information provided</p>
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
                        {documents.additionalDocuments?.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-medium mb-3">Additional Documents</h4>
                            <div className="space-y-2">
                              {documents.additionalDocuments.map((doc: any, i: number) => (
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
                          <p className="text-muted-foreground text-center py-8">No documents uploaded</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No documents uploaded</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-0 border-t">
          <div className="flex items-end gap-4 w-full">
            <div className="flex-1 space-y-2">
              <Label>Admin Notes</Label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes about this application..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Update Status</Label>
              <div className="flex items-center gap-2">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[180px]">
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
