import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ChevronRight, ChevronLeft, Plus, Trash2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
export default function FamilyInfoForm({ data, onSave, onNext, onPrev }) {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        fatherSurnames: data?.fatherSurnames || '',
        fatherGivenNames: data?.fatherGivenNames || '',
        fatherDateOfBirth: data?.fatherDateOfBirth || '',
        isFatherInUS: data?.isFatherInUS || false,
        fatherUSStatus: data?.fatherUSStatus || '',
        motherSurnames: data?.motherSurnames || '',
        motherGivenNames: data?.motherGivenNames || '',
        motherDateOfBirth: data?.motherDateOfBirth || '',
        isMotherInUS: data?.isMotherInUS || false,
        motherUSStatus: data?.motherUSStatus || '',
        hasSpouse: data?.hasSpouse || false,
        spouseFullName: data?.spouseFullName || '',
        spouseDateOfBirth: data?.spouseDateOfBirth || '',
        spouseNationality: data?.spouseNationality || '',
        spouseCityOfBirth: data?.spouseCityOfBirth || '',
        spouseCountryOfBirth: data?.spouseCountryOfBirth || '',
        spouseAddress: data?.spouseAddress || '',
        spouseAddressSameAsApplicant: data?.spouseAddressSameAsApplicant || false,
        hasChildren: data?.hasChildren || false,
        children: data?.children || [],
        hasImmediateRelativesInUS: data?.hasImmediateRelativesInUS || false,
        immediateRelativesInUS: data?.immediateRelativesInUS || [],
        hasOtherRelativesInUS: data?.hasOtherRelativesInUS || false,
        otherRelativesInUS: data?.otherRelativesInUS || [],
    });
    const [errors, setErrors] = useState({});
    const validateForm = () => {
        const newErrors = {};
        if (!formData.fatherSurnames)
            newErrors.fatherSurnames = 'Father\'s surname is required';
        if (!formData.fatherGivenNames)
            newErrors.fatherGivenNames = 'Father\'s given name is required';
        if (!formData.motherSurnames)
            newErrors.motherSurnames = 'Mother\'s surname is required';
        if (!formData.motherGivenNames)
            newErrors.motherGivenNames = 'Mother\'s given name is required';
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
    const addChild = () => {
        const currentChildren = formData.children || [];
        handleChange('children', [...currentChildren, { fullName: '', dateOfBirth: '', relationship: 'CHILD' }]);
    };
    const removeChild = (index) => {
        const currentChildren = formData.children || [];
        handleChange('children', currentChildren.filter((_, i) => i !== index));
    };
    const updateChild = (index, field, value) => {
        const currentChildren = [...(formData.children || [])];
        currentChildren[index] = { ...currentChildren[index], [field]: value };
        handleChange('children', currentChildren);
    };
    const addRelative = (type) => {
        const field = type === 'immediate' ? 'immediateRelativesInUS' : 'otherRelativesInUS';
        const current = formData[field] || [];
        handleChange(field, [...current, { fullName: '', relationship: '', status: '' }]);
    };
    const removeRelative = (type, index) => {
        const field = type === 'immediate' ? 'immediateRelativesInUS' : 'otherRelativesInUS';
        const current = formData[field] || [];
        handleChange(field, current.filter((_, i) => i !== index));
    };
    const updateRelative = (type, index, field, value) => {
        const arrayField = type === 'immediate' ? 'immediateRelativesInUS' : 'otherRelativesInUS';
        const current = [...(formData[arrayField] || [])];
        current[index] = { ...current[index], [field]: value };
        handleChange(arrayField, current);
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-8", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: ["Father's Information", _jsx(Tooltip, { text: "Enter your father's information exactly as it appears on official documents" })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Father's Surnames *" }), _jsx(Input, { value: formData.fatherSurnames || '', onChange: (e) => handleChange('fatherSurnames', e.target.value.toUpperCase()), placeholder: "SMITH", className: "uppercase" }), errors.fatherSurnames && _jsx("p", { className: "text-sm text-red-600 mt-1", children: errors.fatherSurnames })] }), _jsxs("div", { children: [_jsx(Label, { children: "Father's Given Names *" }), _jsx(Input, { value: formData.fatherGivenNames || '', onChange: (e) => handleChange('fatherGivenNames', e.target.value.toUpperCase()), placeholder: "JOHN", className: "uppercase" }), errors.fatherGivenNames && _jsx("p", { className: "text-sm text-red-600 mt-1", children: errors.fatherGivenNames })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Date of Birth" }), _jsx(Input, { type: "date", value: formData.fatherDateOfBirth || '', onChange: (e) => handleChange('fatherDateOfBirth', e.target.value) })] }), _jsxs("div", { className: "flex items-center justify-between p-4 bg-muted/50 rounded-lg", children: [_jsxs("div", { children: [_jsx(Label, { children: "Is your father in the U.S.?" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Currently residing in the United States" })] }), _jsx(Switch, { checked: formData.isFatherInUS || false, onCheckedChange: (checked) => handleChange('isFatherInUS', checked) })] })] }), formData.isFatherInUS && (_jsxs("div", { children: [_jsx(Label, { children: "Father's U.S. Status" }), _jsxs(Select, { value: formData.fatherUSStatus || '', onValueChange: (value) => handleChange('fatherUSStatus', value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "US_CITIZEN", children: "U.S. Citizen" }), _jsx(SelectItem, { value: "LAWFUL_PERMANENT_RESIDENT", children: "Lawful Permanent Resident" }), _jsx(SelectItem, { value: "NONIMMIGRANT", children: "Nonimmigrant" }), _jsx(SelectItem, { value: "OTHER", children: "Other" })] })] })] }))] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Mother's Information" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Mother's Surnames *" }), _jsx(Input, { value: formData.motherSurnames || '', onChange: (e) => handleChange('motherSurnames', e.target.value.toUpperCase()), placeholder: "JOHNSON", className: "uppercase" }), errors.motherSurnames && _jsx("p", { className: "text-sm text-red-600 mt-1", children: errors.motherSurnames })] }), _jsxs("div", { children: [_jsx(Label, { children: "Mother's Given Names *" }), _jsx(Input, { value: formData.motherGivenNames || '', onChange: (e) => handleChange('motherGivenNames', e.target.value.toUpperCase()), placeholder: "MARY", className: "uppercase" }), errors.motherGivenNames && _jsx("p", { className: "text-sm text-red-600 mt-1", children: errors.motherGivenNames })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Date of Birth" }), _jsx(Input, { type: "date", value: formData.motherDateOfBirth || '', onChange: (e) => handleChange('motherDateOfBirth', e.target.value) })] }), _jsxs("div", { className: "flex items-center justify-between p-4 bg-muted/50 rounded-lg", children: [_jsxs("div", { children: [_jsx(Label, { children: "Is your mother in the U.S.?" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Currently residing in the United States" })] }), _jsx(Switch, { checked: formData.isMotherInUS || false, onCheckedChange: (checked) => handleChange('isMotherInUS', checked) })] })] }), formData.isMotherInUS && (_jsxs("div", { children: [_jsx(Label, { children: "Mother's U.S. Status" }), _jsxs(Select, { value: formData.motherUSStatus || '', onValueChange: (value) => handleChange('motherUSStatus', value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "US_CITIZEN", children: "U.S. Citizen" }), _jsx(SelectItem, { value: "LAWFUL_PERMANENT_RESIDENT", children: "Lawful Permanent Resident" }), _jsx(SelectItem, { value: "NONIMMIGRANT", children: "Nonimmigrant" }), _jsx(SelectItem, { value: "OTHER", children: "Other" })] })] })] }))] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-lg", children: "Spouse Information" }), _jsx(Switch, { checked: formData.hasSpouse || false, onCheckedChange: (checked) => handleChange('hasSpouse', checked) })] }), _jsx(CardDescription, { children: "Do you have a spouse?" })] }), formData.hasSpouse && (_jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Spouse's Full Name" }), _jsx(Input, { value: formData.spouseFullName || '', onChange: (e) => handleChange('spouseFullName', e.target.value.toUpperCase()), placeholder: "LAST NAME, FIRST NAME", className: "uppercase" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Spouse's Date of Birth" }), _jsx(Input, { type: "date", value: formData.spouseDateOfBirth || '', onChange: (e) => handleChange('spouseDateOfBirth', e.target.value) })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Spouse's Nationality" }), _jsx(Input, { value: formData.spouseNationality || '', onChange: (e) => handleChange('spouseNationality', e.target.value), placeholder: "Country of citizenship" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Spouse's City of Birth" }), _jsx(Input, { value: formData.spouseCityOfBirth || '', onChange: (e) => handleChange('spouseCityOfBirth', e.target.value), placeholder: "City" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Spouse's Country of Birth" }), _jsx(Input, { value: formData.spouseCountryOfBirth || '', onChange: (e) => handleChange('spouseCountryOfBirth', e.target.value), placeholder: "Country" })] }), _jsxs("div", { className: "flex items-center justify-between p-4 bg-muted/50 rounded-lg", children: [_jsxs("div", { children: [_jsx(Label, { children: "Same address as you?" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Spouse lives at your home address" })] }), _jsx(Switch, { checked: formData.spouseAddressSameAsApplicant || false, onCheckedChange: (checked) => handleChange('spouseAddressSameAsApplicant', checked) })] })] }), !formData.spouseAddressSameAsApplicant && (_jsxs("div", { children: [_jsx(Label, { children: "Spouse's Address" }), _jsx(Input, { value: formData.spouseAddress || '', onChange: (e) => handleChange('spouseAddress', e.target.value), placeholder: "Full address" })] }))] }))] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-lg", children: "Children" }), _jsx(Switch, { checked: formData.hasChildren || false, onCheckedChange: (checked) => handleChange('hasChildren', checked) })] }), _jsx(CardDescription, { children: "Do you have any children?" })] }), formData.hasChildren && (_jsxs(CardContent, { className: "space-y-4", children: [(formData.children || []).map((child, index) => (_jsxs("div", { className: "p-4 border rounded-lg space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h4", { className: "font-medium", children: ["Child ", index + 1] }), _jsx(Button, { type: "button", variant: "ghost", size: "icon", onClick: () => removeChild(index), className: "text-destructive", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Full Name" }), _jsx(Input, { value: child.fullName, onChange: (e) => updateChild(index, 'fullName', e.target.value.toUpperCase()), placeholder: "LAST NAME, FIRST NAME", className: "uppercase" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Date of Birth" }), _jsx(Input, { type: "date", value: child.dateOfBirth, onChange: (e) => updateChild(index, 'dateOfBirth', e.target.value) })] })] })] }, index))), _jsxs(Button, { type: "button", variant: "outline", onClick: addChild, className: "w-full", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Child"] })] }))] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-lg", children: "Immediate Relatives in the U.S." }), _jsx(Switch, { checked: formData.hasImmediateRelativesInUS || false, onCheckedChange: (checked) => handleChange('hasImmediateRelativesInUS', checked) })] }), _jsx(CardDescription, { children: "Do you have any immediate relatives (not including parents) in the United States?" })] }), formData.hasImmediateRelativesInUS && (_jsxs(CardContent, { className: "space-y-4", children: [(formData.immediateRelativesInUS || []).map((relative, index) => (_jsxs("div", { className: "p-4 border rounded-lg space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h4", { className: "font-medium", children: ["Relative ", index + 1] }), _jsx(Button, { type: "button", variant: "ghost", size: "icon", onClick: () => removeRelative('immediate', index), className: "text-destructive", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Full Name" }), _jsx(Input, { value: relative.fullName, onChange: (e) => updateRelative('immediate', index, 'fullName', e.target.value), placeholder: "Full name" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Relationship" }), _jsxs(Select, { value: relative.relationship, onValueChange: (value) => updateRelative('immediate', index, 'relationship', value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "SPOUSE", children: "Spouse" }), _jsx(SelectItem, { value: "CHILD", children: "Child" }), _jsx(SelectItem, { value: "SIBLING", children: "Sibling" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "U.S. Status" }), _jsxs(Select, { value: relative.status, onValueChange: (value) => updateRelative('immediate', index, 'status', value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "US_CITIZEN", children: "U.S. Citizen" }), _jsx(SelectItem, { value: "LPR", children: "Lawful Permanent Resident" }), _jsx(SelectItem, { value: "NONIMMIGRANT", children: "Nonimmigrant" }), _jsx(SelectItem, { value: "OTHER", children: "Other" })] })] })] })] })] }, index))), _jsxs(Button, { type: "button", variant: "outline", onClick: () => addRelative('immediate'), className: "w-full", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Relative"] })] }))] }), _jsxs("div", { className: "flex justify-between pt-4 border-t", children: [_jsxs(Button, { type: "button", variant: "outline", onClick: onPrev, children: [_jsx(ChevronLeft, { className: "w-4 h-4 mr-2" }), "Previous"] }), _jsxs(Button, { type: "submit", disabled: isSaving, children: ["Save & Continue", _jsx(ChevronRight, { className: "w-4 h-4 ml-2" })] })] })] }));
}
function Tooltip({ text }) {
    return (_jsxs("span", { className: "relative group", children: [_jsx(HelpCircle, { className: "w-4 h-4 text-muted-foreground cursor-help" }), _jsx("span", { className: "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg border", children: text })] }));
}
