import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ChevronRight, HelpCircle } from 'lucide-react';
export default function PersonalInfoForm({ data, onSave, onNext }) {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        surnames: data?.surnames || '',
        givenNames: data?.givenNames || '',
        fullNameNative: data?.fullNameNative || '',
        otherNamesUsed: data?.otherNamesUsed || false,
        otherNames: data?.otherNames || [],
        telCode: data?.telCode || '',
        sex: data?.sex || undefined,
        maritalStatus: data?.maritalStatus || undefined,
        dateOfBirth: data?.dateOfBirth || '',
        cityOfBirth: data?.cityOfBirth || '',
        stateOfBirth: data?.stateOfBirth || '',
        countryOfBirth: data?.countryOfBirth || '',
        nationality: data?.nationality || '',
    });
    const [errors, setErrors] = useState({});
    const validateForm = () => {
        const newErrors = {};
        if (!formData.surnames)
            newErrors.surnames = 'Surname is required';
        if (!formData.givenNames)
            newErrors.givenNames = 'Given name is required';
        if (!formData.telCode)
            newErrors.telCode = 'National ID is required';
        if (!formData.sex)
            newErrors.sex = 'Please select your sex';
        if (!formData.maritalStatus)
            newErrors.maritalStatus = 'Please select marital status';
        if (!formData.dateOfBirth)
            newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.cityOfBirth)
            newErrors.cityOfBirth = 'City of birth is required';
        if (!formData.countryOfBirth)
            newErrors.countryOfBirth = 'Country of birth is required';
        if (!formData.nationality)
            newErrors.nationality = 'Nationality is required';
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
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "border-b pb-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Full Name" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Surname(s) / Family Name(s) *", _jsx(Tooltip, { text: "Enter your surname exactly as it appears on your passport" })] }), _jsx("input", { type: "text", value: formData.surnames || '', onChange: (e) => handleChange('surnames', e.target.value.toUpperCase()), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase", placeholder: "SMITH" }), errors.surnames && _jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.surnames })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Given Name(s) *", _jsx(Tooltip, { text: "Enter all your given names as they appear on your passport" })] }), _jsx("input", { type: "text", value: formData.givenNames || '', onChange: (e) => handleChange('givenNames', e.target.value.toUpperCase()), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase", placeholder: "JOHN MICHAEL" }), errors.givenNames && _jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.givenNames })] })] }), _jsxs("div", { className: "mt-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Full Name in Native Alphabet (if applicable)" }), _jsx("input", { type: "text", value: formData.fullNameNative || '', onChange: (e) => handleChange('fullNameNative', e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "Enter your name in your native script" })] })] }), _jsxs("div", { className: "border-b pb-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Personal Details" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Sex *" }), _jsxs("select", { value: formData.sex || '', onChange: (e) => handleChange('sex', e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", children: [_jsx("option", { value: "", children: "Select" }), _jsx("option", { value: "M", children: "Male" }), _jsx("option", { value: "F", children: "Female" })] }), errors.sex && _jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.sex })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Marital Status *" }), _jsxs("select", { value: formData.maritalStatus || '', onChange: (e) => handleChange('maritalStatus', e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", children: [_jsx("option", { value: "", children: "Select" }), _jsx("option", { value: "SINGLE", children: "Single" }), _jsx("option", { value: "MARRIED", children: "Married" }), _jsx("option", { value: "DIVORCED", children: "Divorced" }), _jsx("option", { value: "WIDOWED", children: "Widowed" }), _jsx("option", { value: "SEPARATED", children: "Separated" })] }), errors.maritalStatus && _jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.maritalStatus })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Date of Birth *" }), _jsx("input", { type: "date", value: formData.dateOfBirth || '', onChange: (e) => handleChange('dateOfBirth', e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" }), errors.dateOfBirth && _jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.dateOfBirth })] })] })] }), _jsxs("div", { className: "border-b pb-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Place of Birth" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "City *" }), _jsx("input", { type: "text", value: formData.cityOfBirth || '', onChange: (e) => handleChange('cityOfBirth', e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "New York" }), errors.cityOfBirth && _jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.cityOfBirth })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "State/Province" }), _jsx("input", { type: "text", value: formData.stateOfBirth || '', onChange: (e) => handleChange('stateOfBirth', e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "New York" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Country *" }), _jsx("input", { type: "text", value: formData.countryOfBirth || '', onChange: (e) => handleChange('countryOfBirth', e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "United States" }), errors.countryOfBirth && _jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.countryOfBirth })] })] })] }), _jsxs("div", { className: "pb-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Nationality" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Country/Region of Origin (Nationality) *" }), _jsx("input", { type: "text", value: formData.nationality || '', onChange: (e) => handleChange('nationality', e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "Mongolia" }), errors.nationality && _jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.nationality })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "National ID Number (if any) *" }), _jsx("input", { type: "text", value: formData.telCode || '', onChange: (e) => handleChange('telCode', e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "Enter ID number" }), errors.telCode && _jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.telCode })] })] })] }), _jsx("div", { className: "flex justify-end pt-4 border-t", children: _jsxs("button", { type: "submit", disabled: isSaving, className: "flex items-center gap-2 px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50", children: ["Save & Continue", _jsx(ChevronRight, { className: "w-4 h-4" })] }) })] }));
}
function Tooltip({ text }) {
    return (_jsxs("span", { className: "relative group ml-1", children: [_jsx(HelpCircle, { className: "w-4 h-4 inline text-gray-400 cursor-help" }), _jsx("span", { className: "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10", children: text })] }));
}
