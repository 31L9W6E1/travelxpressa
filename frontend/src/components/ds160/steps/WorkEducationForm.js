import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ChevronRight, ChevronLeft, Plus, Trash2, Briefcase, GraduationCap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
const OCCUPATION_OPTIONS = [
    'BUSINESS', 'STUDENT', 'ENGINEER', 'DOCTOR', 'TEACHER', 'LAWYER',
    'ACCOUNTANT', 'MANAGER', 'RETIRED', 'HOMEMAKER', 'UNEMPLOYED', 'OTHER'
];
export default function WorkEducationForm({ data, onSave, onNext, onPrev }) {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        primaryOccupation: data?.primaryOccupation || '',
        presentEmployerName: data?.presentEmployerName || '',
        presentEmployerAddress: data?.presentEmployerAddress || '',
        presentEmployerCity: data?.presentEmployerCity || '',
        presentEmployerState: data?.presentEmployerState || '',
        presentEmployerPostalCode: data?.presentEmployerPostalCode || '',
        presentEmployerCountry: data?.presentEmployerCountry || '',
        presentEmployerPhone: data?.presentEmployerPhone || '',
        monthlySalary: data?.monthlySalary || '',
        jobDuties: data?.jobDuties || '',
        startDate: data?.startDate || '',
        wasPreviouslyEmployed: data?.wasPreviouslyEmployed || false,
        previousEmployment: data?.previousEmployment || [],
        hasAttendedEducation: data?.hasAttendedEducation || false,
        education: data?.education || [],
        belongsToClanOrTribe: data?.belongsToClanOrTribe || false,
        clanOrTribeName: data?.clanOrTribeName || '',
        languages: data?.languages || [''],
        hasVisitedCountriesLastFiveYears: data?.hasVisitedCountriesLastFiveYears || false,
        countriesVisited: data?.countriesVisited || [],
        belongsToProfessionalOrg: data?.belongsToProfessionalOrg || false,
        professionalOrgs: data?.professionalOrgs || [],
        hasSpecializedSkills: data?.hasSpecializedSkills || false,
        specializedSkillsDescription: data?.specializedSkillsDescription || '',
        hasServedInMilitary: data?.hasServedInMilitary || false,
        militaryService: data?.militaryService || undefined,
    });
    const [errors, setErrors] = useState({});
    const validateForm = () => {
        const newErrors = {};
        if (!formData.primaryOccupation)
            newErrors.primaryOccupation = 'Occupation is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm())
            return;
        setIsSaving(true);
        try {
            await onSave(formData);
            onNext();
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };
    // Previous Employment handlers
    const addPreviousEmployment = () => {
        const current = formData.previousEmployment || [];
        handleChange('previousEmployment', [...current, {
                employerName: '', employerAddress: '', city: '', state: '', postalCode: '',
                country: '', phone: '', jobTitle: '', supervisorSurname: '', supervisorGivenName: '',
                startDate: '', endDate: '', duties: ''
            }]);
    };
    const removePreviousEmployment = (index) => {
        const current = formData.previousEmployment || [];
        handleChange('previousEmployment', current.filter((_, i) => i !== index));
    };
    const updatePreviousEmployment = (index, field, value) => {
        const current = [...(formData.previousEmployment || [])];
        current[index] = { ...current[index], [field]: value };
        handleChange('previousEmployment', current);
    };
    // Education handlers
    const addEducation = () => {
        const current = formData.education || [];
        handleChange('education', [...current, {
                institutionName: '', institutionAddress: '', city: '', state: '',
                postalCode: '', country: '', courseOfStudy: '', startDate: '', endDate: ''
            }]);
    };
    const removeEducation = (index) => {
        const current = formData.education || [];
        handleChange('education', current.filter((_, i) => i !== index));
    };
    const updateEducation = (index, field, value) => {
        const current = [...(formData.education || [])];
        current[index] = { ...current[index], [field]: value };
        handleChange('education', current);
    };
    // Language handlers
    const addLanguage = () => {
        const current = formData.languages || [];
        handleChange('languages', [...current, '']);
    };
    const updateLanguage = (index, value) => {
        const current = [...(formData.languages || [])];
        current[index] = value;
        handleChange('languages', current);
    };
    const removeLanguage = (index) => {
        const current = formData.languages || [];
        if (current.length > 1) {
            handleChange('languages', current.filter((_, i) => i !== index));
        }
    };
    // Countries visited handlers
    const addCountry = () => {
        const current = formData.countriesVisited || [];
        handleChange('countriesVisited', [...current, '']);
    };
    const updateCountry = (index, value) => {
        const current = [...(formData.countriesVisited || [])];
        current[index] = value;
        handleChange('countriesVisited', current);
    };
    const removeCountry = (index) => {
        const current = formData.countriesVisited || [];
        handleChange('countriesVisited', current.filter((_, i) => i !== index));
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-8", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [_jsx(Briefcase, { className: "w-5 h-5" }), "Present Work/Occupation"] }), _jsx(CardDescription, { children: "Enter your current employment information" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Primary Occupation *" }), _jsxs(Select, { value: formData.primaryOccupation || '', onValueChange: (value) => handleChange('primaryOccupation', value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select occupation" }) }), _jsx(SelectContent, { children: OCCUPATION_OPTIONS.map(occ => (_jsx(SelectItem, { value: occ, children: occ }, occ))) })] }), errors.primaryOccupation && _jsx("p", { className: "text-sm text-red-600 mt-1", children: errors.primaryOccupation })] }), _jsxs("div", { children: [_jsx(Label, { children: "Present Employer or School Name" }), _jsx(Input, { value: formData.presentEmployerName || '', onChange: (e) => handleChange('presentEmployerName', e.target.value.toUpperCase()), placeholder: "Company/School name", className: "uppercase" })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Employer Address" }), _jsx(Input, { value: formData.presentEmployerAddress || '', onChange: (e) => handleChange('presentEmployerAddress', e.target.value), placeholder: "Street address" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "City" }), _jsx(Input, { value: formData.presentEmployerCity || '', onChange: (e) => handleChange('presentEmployerCity', e.target.value), placeholder: "City" })] }), _jsxs("div", { children: [_jsx(Label, { children: "State/Province" }), _jsx(Input, { value: formData.presentEmployerState || '', onChange: (e) => handleChange('presentEmployerState', e.target.value), placeholder: "State" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Postal Code" }), _jsx(Input, { value: formData.presentEmployerPostalCode || '', onChange: (e) => handleChange('presentEmployerPostalCode', e.target.value), placeholder: "Postal code" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Country" }), _jsx(Input, { value: formData.presentEmployerCountry || '', onChange: (e) => handleChange('presentEmployerCountry', e.target.value), placeholder: "Country" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Work Phone Number" }), _jsx(Input, { value: formData.presentEmployerPhone || '', onChange: (e) => handleChange('presentEmployerPhone', e.target.value), placeholder: "+1 123-456-7890" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Monthly Salary (Local Currency)" }), _jsx(Input, { value: formData.monthlySalary || '', onChange: (e) => handleChange('monthlySalary', e.target.value), placeholder: "30000000" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Start Date" }), _jsx(Input, { type: "date", value: formData.startDate || '', onChange: (e) => handleChange('startDate', e.target.value) })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Briefly Describe Your Duties" }), _jsx(Textarea, { value: formData.jobDuties || '', onChange: (e) => handleChange('jobDuties', e.target.value.toUpperCase()), placeholder: "Describe your job responsibilities...", rows: 3, className: "uppercase" })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-lg", children: "Previous Employment" }), _jsx(Switch, { checked: formData.wasPreviouslyEmployed || false, onCheckedChange: (checked) => handleChange('wasPreviouslyEmployed', checked) })] }), _jsx(CardDescription, { children: "Were you previously employed?" })] }), formData.wasPreviouslyEmployed && (_jsxs(CardContent, { className: "space-y-4", children: [(formData.previousEmployment || []).map((emp, index) => (_jsxs("div", { className: "p-4 border rounded-lg space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h4", { className: "font-medium", children: ["Previous Employer ", index + 1] }), _jsx(Button, { type: "button", variant: "ghost", size: "icon", onClick: () => removePreviousEmployment(index), className: "text-destructive", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Employer Name" }), _jsx(Input, { value: emp.employerName, onChange: (e) => updatePreviousEmployment(index, 'employerName', e.target.value.toUpperCase()), className: "uppercase" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Job Title" }), _jsx(Input, { value: emp.jobTitle, onChange: (e) => updatePreviousEmployment(index, 'jobTitle', e.target.value.toUpperCase()), className: "uppercase" })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Address" }), _jsx(Input, { value: emp.employerAddress, onChange: (e) => updatePreviousEmployment(index, 'employerAddress', e.target.value) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "City" }), _jsx(Input, { value: emp.city, onChange: (e) => updatePreviousEmployment(index, 'city', e.target.value) })] }), _jsxs("div", { children: [_jsx(Label, { children: "State" }), _jsx(Input, { value: emp.state, onChange: (e) => updatePreviousEmployment(index, 'state', e.target.value) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Postal Code" }), _jsx(Input, { value: emp.postalCode, onChange: (e) => updatePreviousEmployment(index, 'postalCode', e.target.value) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Country" }), _jsx(Input, { value: emp.country, onChange: (e) => updatePreviousEmployment(index, 'country', e.target.value) })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Supervisor's Surname" }), _jsx(Input, { value: emp.supervisorSurname, onChange: (e) => updatePreviousEmployment(index, 'supervisorSurname', e.target.value.toUpperCase()), className: "uppercase" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Supervisor's Given Name" }), _jsx(Input, { value: emp.supervisorGivenName, onChange: (e) => updatePreviousEmployment(index, 'supervisorGivenName', e.target.value.toUpperCase()), className: "uppercase" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Employment Start Date" }), _jsx(Input, { type: "date", value: emp.startDate, onChange: (e) => updatePreviousEmployment(index, 'startDate', e.target.value) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Employment End Date" }), _jsx(Input, { type: "date", value: emp.endDate, onChange: (e) => updatePreviousEmployment(index, 'endDate', e.target.value) })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Briefly Describe Your Duties" }), _jsx(Textarea, { value: emp.duties, onChange: (e) => updatePreviousEmployment(index, 'duties', e.target.value.toUpperCase()), rows: 2, className: "uppercase" })] })] }, index))), _jsxs(Button, { type: "button", variant: "outline", onClick: addPreviousEmployment, className: "w-full", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Previous Employment"] })] }))] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [_jsx(GraduationCap, { className: "w-5 h-5" }), "Education"] }), _jsx(Switch, { checked: formData.hasAttendedEducation || false, onCheckedChange: (checked) => handleChange('hasAttendedEducation', checked) })] }), _jsx(CardDescription, { children: "Have you attended any educational institutions at a secondary level or above?" })] }), formData.hasAttendedEducation && (_jsxs(CardContent, { className: "space-y-4", children: [(formData.education || []).map((edu, index) => (_jsxs("div", { className: "p-4 border rounded-lg space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h4", { className: "font-medium", children: ["Institution ", index + 1] }), _jsx(Button, { type: "button", variant: "ghost", size: "icon", onClick: () => removeEducation(index), className: "text-destructive", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Institution Name" }), _jsx(Input, { value: edu.institutionName, onChange: (e) => updateEducation(index, 'institutionName', e.target.value.toUpperCase()), className: "uppercase" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Course of Study" }), _jsx(Input, { value: edu.courseOfStudy, onChange: (e) => updateEducation(index, 'courseOfStudy', e.target.value.toUpperCase()), className: "uppercase" })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Address" }), _jsx(Input, { value: edu.institutionAddress, onChange: (e) => updateEducation(index, 'institutionAddress', e.target.value) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "City" }), _jsx(Input, { value: edu.city, onChange: (e) => updateEducation(index, 'city', e.target.value) })] }), _jsxs("div", { children: [_jsx(Label, { children: "State" }), _jsx(Input, { value: edu.state, onChange: (e) => updateEducation(index, 'state', e.target.value) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Postal Code" }), _jsx(Input, { value: edu.postalCode, onChange: (e) => updateEducation(index, 'postalCode', e.target.value) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Country" }), _jsx(Input, { value: edu.country, onChange: (e) => updateEducation(index, 'country', e.target.value) })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Date of Attendance From" }), _jsx(Input, { type: "date", value: edu.startDate, onChange: (e) => updateEducation(index, 'startDate', e.target.value) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Date of Attendance To" }), _jsx(Input, { type: "date", value: edu.endDate, onChange: (e) => updateEducation(index, 'endDate', e.target.value) })] })] })] }, index))), _jsxs(Button, { type: "button", variant: "outline", onClick: addEducation, className: "w-full", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Educational Institution"] })] }))] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [_jsx(Globe, { className: "w-5 h-5" }), "Languages"] }), _jsx(CardDescription, { children: "Provide a list of languages you speak" })] }), _jsxs(CardContent, { className: "space-y-4", children: [(formData.languages || ['']).map((lang, index) => (_jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { value: lang, onChange: (e) => updateLanguage(index, e.target.value.toUpperCase()), placeholder: "Language name", className: "uppercase" }), (formData.languages || []).length > 1 && (_jsx(Button, { type: "button", variant: "ghost", size: "icon", onClick: () => removeLanguage(index), className: "text-destructive", children: _jsx(Trash2, { className: "w-4 h-4" }) }))] }, index))), _jsxs(Button, { type: "button", variant: "outline", onClick: addLanguage, className: "w-full", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Language"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-lg", children: "Countries Visited (Last 5 Years)" }), _jsx(Switch, { checked: formData.hasVisitedCountriesLastFiveYears || false, onCheckedChange: (checked) => handleChange('hasVisitedCountriesLastFiveYears', checked) })] }), _jsx(CardDescription, { children: "Have you traveled to any countries/regions within the last five years?" })] }), formData.hasVisitedCountriesLastFiveYears && (_jsxs(CardContent, { className: "space-y-4", children: [(formData.countriesVisited || []).map((country, index) => (_jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { value: country, onChange: (e) => updateCountry(index, e.target.value.toUpperCase()), placeholder: "Country/Region name", className: "uppercase" }), _jsx(Button, { type: "button", variant: "ghost", size: "icon", onClick: () => removeCountry(index), className: "text-destructive", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }, index))), _jsxs(Button, { type: "button", variant: "outline", onClick: addCountry, className: "w-full", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Country"] })] }))] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-lg", children: "Military Service" }), _jsx(Switch, { checked: formData.hasServedInMilitary || false, onCheckedChange: (checked) => handleChange('hasServedInMilitary', checked) })] }), _jsx(CardDescription, { children: "Have you ever served in the military?" })] }), formData.hasServedInMilitary && (_jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Country/Region" }), _jsx(Input, { value: formData.militaryService?.country || '', onChange: (e) => handleChange('militaryService', { ...formData.militaryService, country: e.target.value }), placeholder: "Country" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Branch of Service" }), _jsx(Input, { value: formData.militaryService?.branch || '', onChange: (e) => handleChange('militaryService', { ...formData.militaryService, branch: e.target.value }), placeholder: "Army, Navy, etc." })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Rank/Position" }), _jsx(Input, { value: formData.militaryService?.rank || '', onChange: (e) => handleChange('militaryService', { ...formData.militaryService, rank: e.target.value }), placeholder: "Rank" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Military Specialty" }), _jsx(Input, { value: formData.militaryService?.specialty || '', onChange: (e) => handleChange('militaryService', { ...formData.militaryService, specialty: e.target.value }), placeholder: "Specialty" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Service Start Date" }), _jsx(Input, { type: "date", value: formData.militaryService?.startDate || '', onChange: (e) => handleChange('militaryService', { ...formData.militaryService, startDate: e.target.value }) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Service End Date" }), _jsx(Input, { type: "date", value: formData.militaryService?.endDate || '', onChange: (e) => handleChange('militaryService', { ...formData.militaryService, endDate: e.target.value }) })] })] })] }))] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-lg", children: "Specialized Skills" }), _jsx(Switch, { checked: formData.hasSpecializedSkills || false, onCheckedChange: (checked) => handleChange('hasSpecializedSkills', checked) })] }), _jsx(CardDescription, { children: "Do you have any specialized skills or training, such as firearms, explosives, nuclear, biological, or chemical experience?" })] }), formData.hasSpecializedSkills && (_jsx(CardContent, { children: _jsx(Textarea, { value: formData.specializedSkillsDescription || '', onChange: (e) => handleChange('specializedSkillsDescription', e.target.value), placeholder: "Please describe your specialized skills...", rows: 3 }) }))] }), _jsxs("div", { className: "flex justify-between pt-4 border-t", children: [_jsxs(Button, { type: "button", variant: "outline", onClick: onPrev, children: [_jsx(ChevronLeft, { className: "w-4 h-4 mr-2" }), "Previous"] }), _jsxs(Button, { type: "submit", disabled: isSaving, children: ["Save & Continue", _jsx(ChevronRight, { className: "w-4 h-4 ml-2" })] })] })] }));
}
