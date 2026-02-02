import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { User, Phone, BookOpen, Plane, Users, Briefcase, Shield, FileText, Calendar, MapPin, Mail, Globe, CheckCircle, XCircle, Download, Loader2, } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/api/client';
const statusOptions = [
    { value: 'DRAFT', label: 'Draft', color: 'bg-gray-500' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-500' },
    { value: 'SUBMITTED', label: 'Submitted', color: 'bg-indigo-500' },
    { value: 'UNDER_REVIEW', label: 'Under Review', color: 'bg-purple-500' },
    { value: 'COMPLETED', label: 'Completed', color: 'bg-green-500' },
    { value: 'REJECTED', label: 'Rejected', color: 'bg-red-500' },
];
const getStatusBadge = (status) => {
    const styles = {
        DRAFT: 'bg-gray-500/20 text-gray-600 dark:text-gray-300 border-gray-500/30',
        IN_PROGRESS: 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/30',
        SUBMITTED: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border-indigo-500/30',
        UNDER_REVIEW: 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30',
        COMPLETED: 'bg-green-500/20 text-green-600 dark:text-green-300 border-green-500/30',
        REJECTED: 'bg-red-500/20 text-red-600 dark:text-red-300 border-red-500/30',
    };
    return styles[status] || styles.DRAFT;
};
const parseFormData = (jsonString) => {
    if (!jsonString)
        return null;
    try {
        return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
    }
    catch {
        return jsonString;
    }
};
const formatDate = (dateString) => {
    if (!dateString)
        return '-';
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }
    catch {
        return dateString;
    }
};
const InfoRow = ({ label, value, icon: Icon }) => (_jsxs("div", { className: "flex items-start gap-3 py-2", children: [Icon && _jsx(Icon, { className: "w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: label }), _jsx("p", { className: "text-sm font-medium truncate", children: value || '-' })] })] }));
export default function ApplicationDetailModal({ application, open, onOpenChange, onStatusUpdate, }) {
    const [selectedStatus, setSelectedStatus] = useState(application?.status || 'DRAFT');
    const [adminNotes, setAdminNotes] = useState(application?.adminNotes || '');
    const [isUpdating, setIsUpdating] = useState(false);
    if (!application)
        return null;
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
        }
        catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
        finally {
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
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] p-0", children: [_jsx(DialogHeader, { className: "p-6 pb-0", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(DialogTitle, { className: "text-xl", children: "Application Details" }), _jsxs(DialogDescription, { className: "mt-1", children: ["Application ID: ", application.id] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { className: getStatusBadge(application.status), children: application.status }), _jsxs(Button, { variant: "outline", size: "sm", onClick: handleExportPDF, children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export PDF"] })] })] }) }), _jsx(ScrollArea, { className: "h-[60vh]", children: _jsxs("div", { className: "p-6 pt-4", children: [_jsx(Card, { className: "mb-6", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center", children: _jsx(User, { className: "w-8 h-8 text-primary" }) }), _jsxs("div", { className: "flex-1", children: [_jsxs("h3", { className: "text-lg font-semibold", children: [personalInfo?.givenNames, " ", personalInfo?.surnames] }), _jsx("p", { className: "text-muted-foreground", children: application.user?.email }), _jsxs("div", { className: "flex items-center gap-4 mt-2 text-sm text-muted-foreground", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Globe, { className: "w-4 h-4" }), application.visaType, " Visa"] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Calendar, { className: "w-4 h-4" }), "Created ", formatDate(application.createdAt)] })] })] })] }) }) }), _jsxs(Tabs, { defaultValue: "personal", className: "w-full", children: [_jsxs(TabsList, { className: "grid grid-cols-4 lg:grid-cols-8 mb-4", children: [_jsxs(TabsTrigger, { value: "personal", className: "text-xs", children: [_jsx(User, { className: "w-3 h-3 mr-1" }), "Personal"] }), _jsxs(TabsTrigger, { value: "contact", className: "text-xs", children: [_jsx(Phone, { className: "w-3 h-3 mr-1" }), "Contact"] }), _jsxs(TabsTrigger, { value: "passport", className: "text-xs", children: [_jsx(BookOpen, { className: "w-3 h-3 mr-1" }), "Passport"] }), _jsxs(TabsTrigger, { value: "travel", className: "text-xs", children: [_jsx(Plane, { className: "w-3 h-3 mr-1" }), "Travel"] }), _jsxs(TabsTrigger, { value: "family", className: "text-xs", children: [_jsx(Users, { className: "w-3 h-3 mr-1" }), "Family"] }), _jsxs(TabsTrigger, { value: "work", className: "text-xs", children: [_jsx(Briefcase, { className: "w-3 h-3 mr-1" }), "Work"] }), _jsxs(TabsTrigger, { value: "security", className: "text-xs", children: [_jsx(Shield, { className: "w-3 h-3 mr-1" }), "Security"] }), _jsxs(TabsTrigger, { value: "docs", className: "text-xs", children: [_jsx(FileText, { className: "w-3 h-3 mr-1" }), "Docs"] })] }), _jsx(TabsContent, { value: "personal", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [_jsx(User, { className: "w-4 h-4" }), "Personal Information"] }) }), _jsx(CardContent, { children: personalInfo ? (_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(InfoRow, { label: "Surnames", value: personalInfo.surnames, icon: User }), _jsx(InfoRow, { label: "Given Names", value: personalInfo.givenNames, icon: User }), _jsx(InfoRow, { label: "Full Name (Native)", value: personalInfo.fullNameNative }), _jsx(InfoRow, { label: "Date of Birth", value: formatDate(personalInfo.dateOfBirth), icon: Calendar }), _jsx(InfoRow, { label: "Gender", value: personalInfo.sex === 'M' ? 'Male' : 'Female' }), _jsx(InfoRow, { label: "Marital Status", value: personalInfo.maritalStatus }), _jsx(InfoRow, { label: "Nationality", value: personalInfo.nationality, icon: Globe }), _jsx(InfoRow, { label: "Country of Birth", value: personalInfo.countryOfBirth, icon: MapPin }), _jsx(InfoRow, { label: "City of Birth", value: personalInfo.cityOfBirth, icon: MapPin }), _jsx(InfoRow, { label: "State of Birth", value: personalInfo.stateOfBirth }), _jsx(InfoRow, { label: "Other Names Used", value: personalInfo.otherNamesUsed ? 'Yes' : 'No' }), personalInfo.otherNames?.length > 0 && (_jsx(InfoRow, { label: "Other Names", value: personalInfo.otherNames.join(', ') }))] })) : (_jsx("p", { className: "text-muted-foreground text-center py-8", children: "No personal information provided" })) })] }) }), _jsx(TabsContent, { value: "contact", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [_jsx(Phone, { className: "w-4 h-4" }), "Contact Information"] }) }), _jsx(CardContent, { children: contactInfo ? (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(InfoRow, { label: "Email", value: contactInfo.email, icon: Mail }), _jsx(InfoRow, { label: "Phone", value: contactInfo.phone, icon: Phone }), _jsx(InfoRow, { label: "Secondary Phone", value: contactInfo.secondaryPhone, icon: Phone }), _jsx(InfoRow, { label: "Work Phone", value: contactInfo.workPhone, icon: Phone })] }), _jsx(Separator, {}), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-3", children: "Home Address" }), contactInfo.homeAddress && (_jsxs("div", { className: "grid grid-cols-2 gap-4 pl-4", children: [_jsx(InfoRow, { label: "Street", value: contactInfo.homeAddress.street, icon: MapPin }), _jsx(InfoRow, { label: "City", value: contactInfo.homeAddress.city }), _jsx(InfoRow, { label: "State", value: contactInfo.homeAddress.state }), _jsx(InfoRow, { label: "Postal Code", value: contactInfo.homeAddress.postalCode }), _jsx(InfoRow, { label: "Country", value: contactInfo.homeAddress.country, icon: Globe })] }))] }), contactInfo.mailingAddress && (_jsxs(_Fragment, { children: [_jsx(Separator, {}), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-3", children: "Mailing Address" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 pl-4", children: [_jsx(InfoRow, { label: "Street", value: contactInfo.mailingAddress.street, icon: MapPin }), _jsx(InfoRow, { label: "City", value: contactInfo.mailingAddress.city }), _jsx(InfoRow, { label: "State", value: contactInfo.mailingAddress.state }), _jsx(InfoRow, { label: "Postal Code", value: contactInfo.mailingAddress.postalCode }), _jsx(InfoRow, { label: "Country", value: contactInfo.mailingAddress.country, icon: Globe })] })] })] }))] })) : (_jsx("p", { className: "text-muted-foreground text-center py-8", children: "No contact information provided" })) })] }) }), _jsx(TabsContent, { value: "passport", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [_jsx(BookOpen, { className: "w-4 h-4" }), "Passport Information"] }) }), _jsx(CardContent, { children: passportInfo ? (_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(InfoRow, { label: "Passport Type", value: passportInfo.passportType }), _jsx(InfoRow, { label: "Passport Number", value: passportInfo.passportNumber }), _jsx(InfoRow, { label: "Book Number", value: passportInfo.passportBookNumber }), _jsx(InfoRow, { label: "Country of Issuance", value: passportInfo.countryOfIssuance, icon: Globe }), _jsx(InfoRow, { label: "City of Issuance", value: passportInfo.cityOfIssuance, icon: MapPin }), _jsx(InfoRow, { label: "State of Issuance", value: passportInfo.stateOfIssuance }), _jsx(InfoRow, { label: "Issue Date", value: formatDate(passportInfo.issuanceDate), icon: Calendar }), _jsx(InfoRow, { label: "Expiry Date", value: formatDate(passportInfo.expirationDate), icon: Calendar }), _jsx(InfoRow, { label: "Has Other Passport", value: passportInfo.hasOtherPassport ? 'Yes' : 'No' }), passportInfo.otherPassportInfo && (_jsxs(_Fragment, { children: [_jsx(InfoRow, { label: "Other Passport Number", value: passportInfo.otherPassportInfo.number }), _jsx(InfoRow, { label: "Other Passport Country", value: passportInfo.otherPassportInfo.country })] }))] })) : (_jsx("p", { className: "text-muted-foreground text-center py-8", children: "No passport information provided" })) })] }) }), _jsx(TabsContent, { value: "travel", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [_jsx(Plane, { className: "w-4 h-4" }), "Travel Information"] }) }), _jsx(CardContent, { children: travelInfo ? (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(InfoRow, { label: "Purpose of Trip", value: travelInfo.purposeOfTrip }), _jsx(InfoRow, { label: "Specific Purpose", value: travelInfo.specificPurpose }), _jsx(InfoRow, { label: "Intended Arrival", value: formatDate(travelInfo.intendedArrivalDate), icon: Calendar }), _jsx(InfoRow, { label: "Length of Stay", value: travelInfo.intendedLengthOfStay }), _jsx(InfoRow, { label: "Paying for Trip", value: travelInfo.payingForTrip }), _jsx(InfoRow, { label: "Traveling with Others", value: travelInfo.travelingWithOthers ? 'Yes' : 'No' })] }), travelInfo.addressWhileInUS && (_jsxs(_Fragment, { children: [_jsx(Separator, {}), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-3", children: "Address While in US" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 pl-4", children: [_jsx(InfoRow, { label: "Street", value: travelInfo.addressWhileInUS.street, icon: MapPin }), _jsx(InfoRow, { label: "City", value: travelInfo.addressWhileInUS.city }), _jsx(InfoRow, { label: "State", value: travelInfo.addressWhileInUS.state }), _jsx(InfoRow, { label: "ZIP Code", value: travelInfo.addressWhileInUS.zipCode })] })] })] })), travelInfo.companions?.length > 0 && (_jsxs(_Fragment, { children: [_jsx(Separator, {}), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-3", children: "Travel Companions" }), _jsx("div", { className: "space-y-2 pl-4", children: travelInfo.companions.map((c, i) => (_jsxs("div", { className: "flex items-center gap-4 p-2 bg-muted/50 rounded", children: [_jsx("span", { className: "font-medium", children: c.name }), _jsxs("span", { className: "text-muted-foreground", children: ["(", c.relationship, ")"] })] }, i))) })] })] }))] })) : (_jsx("p", { className: "text-muted-foreground text-center py-8", children: "No travel information provided" })) })] }) }), _jsx(TabsContent, { value: "family", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [_jsx(Users, { className: "w-4 h-4" }), "Family Information"] }) }), _jsx(CardContent, { children: familyInfo ? (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-3", children: "Father" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 pl-4", children: [_jsx(InfoRow, { label: "Name", value: `${familyInfo.fatherGivenNames || ''} ${familyInfo.fatherSurnames || ''}`, icon: User }), _jsx(InfoRow, { label: "Date of Birth", value: formatDate(familyInfo.fatherDateOfBirth), icon: Calendar }), _jsx(InfoRow, { label: "In US", value: familyInfo.isFatherInUS ? 'Yes' : 'No' }), familyInfo.isFatherInUS && _jsx(InfoRow, { label: "US Status", value: familyInfo.fatherUSStatus })] })] }), _jsx(Separator, {}), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-3", children: "Mother" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 pl-4", children: [_jsx(InfoRow, { label: "Name", value: `${familyInfo.motherGivenNames || ''} ${familyInfo.motherSurnames || ''}`, icon: User }), _jsx(InfoRow, { label: "Date of Birth", value: formatDate(familyInfo.motherDateOfBirth), icon: Calendar }), _jsx(InfoRow, { label: "In US", value: familyInfo.isMotherInUS ? 'Yes' : 'No' }), familyInfo.isMotherInUS && _jsx(InfoRow, { label: "US Status", value: familyInfo.motherUSStatus })] })] }), familyInfo.hasSpouse && (_jsxs(_Fragment, { children: [_jsx(Separator, {}), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-3", children: "Spouse" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 pl-4", children: [_jsx(InfoRow, { label: "Full Name", value: familyInfo.spouseFullName, icon: User }), _jsx(InfoRow, { label: "Date of Birth", value: formatDate(familyInfo.spouseDateOfBirth), icon: Calendar }), _jsx(InfoRow, { label: "Nationality", value: familyInfo.spouseNationality, icon: Globe }), _jsx(InfoRow, { label: "Place of Birth", value: `${familyInfo.spouseCityOfBirth || ''}, ${familyInfo.spouseCountryOfBirth || ''}`, icon: MapPin })] })] })] })), familyInfo.children?.length > 0 && (_jsxs(_Fragment, { children: [_jsx(Separator, {}), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-3", children: "Children" }), _jsx("div", { className: "space-y-2 pl-4", children: familyInfo.children.map((child, i) => (_jsxs("div", { className: "p-3 bg-muted/50 rounded", children: [_jsx("p", { className: "font-medium", children: child.fullName }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["DOB: ", formatDate(child.dateOfBirth), " | ", child.relationship] })] }, i))) })] })] })), familyInfo.immediateRelativesInUS?.length > 0 && (_jsxs(_Fragment, { children: [_jsx(Separator, {}), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-3", children: "Immediate Relatives in US" }), _jsx("div", { className: "space-y-2 pl-4", children: familyInfo.immediateRelativesInUS.map((rel, i) => (_jsxs("div", { className: "p-3 bg-muted/50 rounded", children: [_jsx("p", { className: "font-medium", children: rel.fullName }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [rel.relationship, " | Status: ", rel.status] })] }, i))) })] })] }))] })) : (_jsx("p", { className: "text-muted-foreground text-center py-8", children: "No family information provided" })) })] }) }), _jsx(TabsContent, { value: "work", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [_jsx(Briefcase, { className: "w-4 h-4" }), "Work & Education"] }) }), _jsx(CardContent, { children: workEducation ? (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-3", children: "Current Employment" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 pl-4", children: [_jsx(InfoRow, { label: "Occupation", value: workEducation.primaryOccupation, icon: Briefcase }), _jsx(InfoRow, { label: "Employer", value: workEducation.presentEmployerName }), _jsx(InfoRow, { label: "Monthly Salary", value: workEducation.monthlySalary }), _jsx(InfoRow, { label: "Start Date", value: formatDate(workEducation.startDate), icon: Calendar }), _jsx(InfoRow, { label: "Job Duties", value: workEducation.jobDuties }), _jsx(InfoRow, { label: "Employer Phone", value: workEducation.presentEmployerPhone, icon: Phone })] })] }), workEducation.education?.length > 0 && (_jsxs(_Fragment, { children: [_jsx(Separator, {}), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-3", children: "Education" }), _jsx("div", { className: "space-y-2 pl-4", children: workEducation.education.map((edu, i) => (_jsxs("div", { className: "p-3 bg-muted/50 rounded", children: [_jsx("p", { className: "font-medium", children: edu.institutionName }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [edu.courseOfStudy, " | ", formatDate(edu.startDate), " - ", formatDate(edu.endDate)] })] }, i))) })] })] })), workEducation.languages?.length > 0 && (_jsxs(_Fragment, { children: [_jsx(Separator, {}), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-3", children: "Languages" }), _jsx("div", { className: "flex flex-wrap gap-2 pl-4", children: workEducation.languages.map((lang, i) => (_jsx(Badge, { variant: "secondary", children: lang }, i))) })] })] })), workEducation.hasServedInMilitary && workEducation.militaryService && (_jsxs(_Fragment, { children: [_jsx(Separator, {}), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-3", children: "Military Service" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 pl-4", children: [_jsx(InfoRow, { label: "Country", value: workEducation.militaryService.country, icon: Globe }), _jsx(InfoRow, { label: "Branch", value: workEducation.militaryService.branch }), _jsx(InfoRow, { label: "Rank", value: workEducation.militaryService.rank }), _jsx(InfoRow, { label: "Specialty", value: workEducation.militaryService.specialty })] })] })] }))] })) : (_jsx("p", { className: "text-muted-foreground text-center py-8", children: "No work/education information provided" })) })] }) }), _jsx(TabsContent, { value: "security", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [_jsx(Shield, { className: "w-4 h-4" }), "Security Questions"] }) }), _jsx(CardContent, { children: securityInfo ? (_jsxs("div", { className: "space-y-4", children: [[
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
                                                            ].map(({ key, label }) => (_jsxs("div", { className: "flex items-center justify-between py-2 border-b", children: [_jsx("span", { className: "text-sm", children: label }), securityInfo[key] ? (_jsxs(Badge, { variant: "destructive", className: "flex items-center gap-1", children: [_jsx(XCircle, { className: "w-3 h-3" }), "Yes"] })) : (_jsxs(Badge, { variant: "secondary", className: "flex items-center gap-1", children: [_jsx(CheckCircle, { className: "w-3 h-3" }), "No"] }))] }, key))), securityInfo.usVisitDetails && (_jsxs("div", { className: "mt-4", children: [_jsx(Label, { children: "US Visit Details" }), _jsx("p", { className: "text-sm text-muted-foreground mt-1 p-3 bg-muted/50 rounded", children: securityInfo.usVisitDetails })] }))] })) : (_jsx("p", { className: "text-muted-foreground text-center py-8", children: "No security information provided" })) })] }) }), _jsx(TabsContent, { value: "docs", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [_jsx(FileText, { className: "w-4 h-4" }), "Uploaded Documents"] }) }), _jsx(CardContent, { children: documents ? (_jsxs("div", { className: "space-y-4", children: [documents.photo && (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-primary/10 rounded flex items-center justify-center", children: _jsx(User, { className: "w-5 h-5 text-primary" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Photo" }), _jsx("p", { className: "text-xs text-muted-foreground", children: documents.photo.fileName })] })] }), _jsx(Button, { variant: "outline", size: "sm", asChild: true, children: _jsx("a", { href: documents.photo.fileUrl, target: "_blank", rel: "noopener noreferrer", children: "View" }) })] })), documents.invitationLetter && (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-blue-500/10 rounded flex items-center justify-center", children: _jsx(FileText, { className: "w-5 h-5 text-blue-500" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Invitation Letter" }), _jsx("p", { className: "text-xs text-muted-foreground", children: documents.invitationLetter.fileName })] })] }), _jsx(Button, { variant: "outline", size: "sm", asChild: true, children: _jsx("a", { href: documents.invitationLetter.fileUrl, target: "_blank", rel: "noopener noreferrer", children: "View" }) })] })), documents.additionalDocuments?.length > 0 && (_jsxs("div", { className: "mt-4", children: [_jsx("h4", { className: "font-medium mb-3", children: "Additional Documents" }), _jsx("div", { className: "space-y-2", children: documents.additionalDocuments.map((doc, i) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-muted rounded flex items-center justify-center", children: _jsx(FileText, { className: "w-5 h-5 text-muted-foreground" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: doc.documentType }), _jsx("p", { className: "text-xs text-muted-foreground", children: doc.fileName })] })] }), _jsx(Button, { variant: "outline", size: "sm", asChild: true, children: _jsx("a", { href: doc.fileUrl, target: "_blank", rel: "noopener noreferrer", children: "View" }) })] }, i))) })] })), !documents.photo && !documents.invitationLetter && !documents.additionalDocuments?.length && (_jsx("p", { className: "text-muted-foreground text-center py-8", children: "No documents uploaded" }))] })) : (_jsx("p", { className: "text-muted-foreground text-center py-8", children: "No documents uploaded" })) })] }) })] })] }) }), _jsx(DialogFooter, { className: "p-6 pt-0 border-t", children: _jsxs("div", { className: "flex items-end gap-4 w-full", children: [_jsxs("div", { className: "flex-1 space-y-2", children: [_jsx(Label, { children: "Admin Notes" }), _jsx(Textarea, { value: adminNotes, onChange: (e) => setAdminNotes(e.target.value), placeholder: "Add internal notes about this application...", rows: 2 })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Update Status" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Select, { value: selectedStatus, onValueChange: setSelectedStatus, children: [_jsx(SelectTrigger, { className: "w-[180px]", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: statusOptions.map((opt) => (_jsx(SelectItem, { value: opt.value, children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: `w-2 h-2 rounded-full ${opt.color}` }), opt.label] }) }, opt.value))) })] }), _jsx(Button, { onClick: handleUpdateStatus, disabled: isUpdating, children: isUpdating ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin" })) : ('Update') })] })] })] }) })] }) }));
}
