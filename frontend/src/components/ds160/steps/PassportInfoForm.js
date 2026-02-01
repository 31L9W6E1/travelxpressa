import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
export default function PassportInfoForm({ data, onSave, onNext, onPrev }) {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        passportType: data?.passportType || 'REGULAR',
        passportNumber: data?.passportNumber || '',
        passportBookNumber: data?.passportBookNumber || '',
        countryOfIssuance: data?.countryOfIssuance || '',
        cityOfIssuance: data?.cityOfIssuance || '',
        stateOfIssuance: data?.stateOfIssuance || '',
        issuanceDate: data?.issuanceDate || '',
        expirationDate: data?.expirationDate || '',
        hasOtherPassport: data?.hasOtherPassport || false,
        otherPassportInfo: {
            number: data?.otherPassportInfo?.number || '',
            country: data?.otherPassportInfo?.country || '',
        },
    });
    const handleChange = (field, value) => {
        if (field.startsWith('otherPassportInfo.')) {
            const subField = field.replace('otherPassportInfo.', '');
            setFormData(prev => ({
                ...prev,
                otherPassportInfo: {
                    ...prev.otherPassportInfo,
                    [subField]: value,
                },
            }));
        }
        else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const submitData = {
                ...formData,
                otherPassportInfo: formData.hasOtherPassport ? formData.otherPassportInfo : undefined,
            };
            await onSave(submitData);
            onNext();
        }
        finally {
            setIsSaving(false);
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "border-b pb-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Passport Type" }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Passport/Travel Document Type *" }), _jsxs("select", { value: formData.passportType || '', onChange: (e) => handleChange('passportType', e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", children: [_jsx("option", { value: "REGULAR", children: "Regular" }), _jsx("option", { value: "OFFICIAL", children: "Official" }), _jsx("option", { value: "DIPLOMATIC", children: "Diplomatic" }), _jsx("option", { value: "OTHER", children: "Other" })] })] })] }), _jsxs("div", { className: "border-b pb-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Passport Details" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Passport Number *" }), _jsx("input", { type: "text", value: formData.passportNumber || '', onChange: (e) => handleChange('passportNumber', e.target.value.toUpperCase()), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase", placeholder: "E12345678" }), _jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Enter exactly as shown on your passport" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Passport Book Number (if any)" }), _jsx("input", { type: "text", value: formData.passportBookNumber || '', onChange: (e) => handleChange('passportBookNumber', e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "Book number" })] })] })] }), _jsxs("div", { className: "border-b pb-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Issuance Information" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Country/Authority that Issued Passport *" }), _jsx("input", { type: "text", value: formData.countryOfIssuance || '', onChange: (e) => handleChange('countryOfIssuance', e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "Mongolia" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "City Where Issued *" }), _jsx("input", { type: "text", value: formData.cityOfIssuance || '', onChange: (e) => handleChange('cityOfIssuance', e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "Ulaanbaatar" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "State/Province (if any)" }), _jsx("input", { type: "text", value: formData.stateOfIssuance || '', onChange: (e) => handleChange('stateOfIssuance', e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "State/Province" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mt-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Issuance Date *" }), _jsx("input", { type: "date", value: formData.issuanceDate || '', onChange: (e) => handleChange('issuanceDate', e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Expiration Date *" }), _jsx("input", { type: "date", value: formData.expirationDate || '', onChange: (e) => handleChange('expirationDate', e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" }), _jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Your passport must be valid for at least 6 months beyond your intended stay" })] })] })] }), _jsxs("div", { className: "pb-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Additional Passport Information" }), _jsx("div", { className: "mb-4", children: _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: formData.hasOtherPassport || false, onChange: (e) => handleChange('hasOtherPassport', e.target.checked), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "text-sm font-medium text-gray-700", children: "Do you hold or have you held any nationality other than the one indicated above?" })] }) }), formData.hasOtherPassport && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-blue-200", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Other Country/Authority" }), _jsx("input", { type: "text", value: formData.otherPassportInfo?.country || '', onChange: (e) => handleChange('otherPassportInfo.country', e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "Country" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Other Passport Number" }), _jsx("input", { type: "text", value: formData.otherPassportInfo?.number || '', onChange: (e) => handleChange('otherPassportInfo.number', e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "Passport number" })] })] }))] }), _jsxs("div", { className: "flex justify-between pt-4 border-t", children: [_jsxs("button", { type: "button", onClick: onPrev, className: "flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200", children: [_jsx(ChevronLeft, { className: "w-4 h-4" }), "Previous"] }), _jsxs("button", { type: "submit", disabled: isSaving, className: "flex items-center gap-2 px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50", children: ["Save & Continue", _jsx(ChevronRight, { className: "w-4 h-4" })] })] })] }));
}
