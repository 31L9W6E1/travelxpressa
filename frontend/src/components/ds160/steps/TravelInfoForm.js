import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
// US States for dropdown
const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];
export default function TravelInfoForm({ data, onSave, onNext, onPrev }) {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        purposeOfTrip: data?.purposeOfTrip || '',
        specificPurpose: data?.specificPurpose || '',
        intendedArrivalDate: data?.intendedArrivalDate || '',
        intendedLengthOfStay: data?.intendedLengthOfStay || '',
        addressWhileInUS: {
            street: data?.addressWhileInUS?.street || '',
            city: data?.addressWhileInUS?.city || '',
            state: data?.addressWhileInUS?.state || '',
            zipCode: data?.addressWhileInUS?.zipCode || '',
        },
        payingForTrip: data?.payingForTrip || '',
        travelingWithOthers: data?.travelingWithOthers || false,
        companions: data?.companions || [],
    });
    const handleChange = (field, value) => {
        if (field.startsWith('addressWhileInUS.')) {
            const subField = field.replace('addressWhileInUS.', '');
            setFormData(prev => ({
                ...prev,
                addressWhileInUS: {
                    ...prev.addressWhileInUS,
                    [subField]: value,
                },
            }));
        }
        else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };
    const addCompanion = () => {
        setFormData(prev => ({
            ...prev,
            companions: [...prev.companions, { name: '', relationship: '' }],
        }));
    };
    const removeCompanion = (index) => {
        setFormData(prev => ({
            ...prev,
            companions: prev.companions.filter((_, i) => i !== index),
        }));
    };
    const updateCompanion = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            companions: prev.companions.map((c, i) => i === index ? { ...c, [field]: value } : c),
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave(formData);
            onNext();
        }
        finally {
            setIsSaving(false);
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "border-b pb-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Purpose of Trip" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Purpose of Trip to the U.S. *" }), _jsxs("select", { value: formData.purposeOfTrip, onChange: (e) => handleChange('purposeOfTrip', e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", children: [_jsx("option", { value: "", children: "Select purpose" }), _jsx("option", { value: "TOURISM", children: "Tourism/Vacation" }), _jsx("option", { value: "BUSINESS", children: "Business" }), _jsx("option", { value: "STUDY", children: "Study" }), _jsx("option", { value: "WORK", children: "Work" }), _jsx("option", { value: "MEDICAL", children: "Medical Treatment" }), _jsx("option", { value: "CONFERENCE", children: "Conference/Convention" }), _jsx("option", { value: "FAMILY", children: "Visit Family/Friends" }), _jsx("option", { value: "TRANSIT", children: "Transit" }), _jsx("option", { value: "OTHER", children: "Other" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Specific Travel Plans" }), _jsx("textarea", { value: formData.specificPurpose, onChange: (e) => handleChange('specificPurpose', e.target.value), rows: 3, className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "Describe your specific travel plans, places you intend to visit, etc." })] })] })] }), _jsxs("div", { className: "border-b pb-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Travel Dates" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Intended Date of Arrival *" }), _jsx("input", { type: "date", value: formData.intendedArrivalDate, onChange: (e) => handleChange('intendedArrivalDate', e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Intended Length of Stay *" }), _jsx("input", { type: "text", value: formData.intendedLengthOfStay, onChange: (e) => handleChange('intendedLengthOfStay', e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "e.g., 2 weeks, 3 months" })] })] })] }), _jsxs("div", { className: "border-b pb-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Address in the United States" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Street Address *" }), _jsx("input", { type: "text", value: formData.addressWhileInUS.street, onChange: (e) => handleChange('addressWhileInUS.street', e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "123 Main Street" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "City *" }), _jsx("input", { type: "text", value: formData.addressWhileInUS.city, onChange: (e) => handleChange('addressWhileInUS.city', e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "New York" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "State *" }), _jsxs("select", { value: formData.addressWhileInUS.state, onChange: (e) => handleChange('addressWhileInUS.state', e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", children: [_jsx("option", { value: "", children: "Select state" }), US_STATES.map((state) => (_jsx("option", { value: state, children: state }, state)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "ZIP Code" }), _jsx("input", { type: "text", value: formData.addressWhileInUS.zipCode, onChange: (e) => handleChange('addressWhileInUS.zipCode', e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "10001" })] })] })] })] }), _jsxs("div", { className: "border-b pb-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Trip Funding" }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Who is paying for your trip? *" }), _jsxs("select", { value: formData.payingForTrip, onChange: (e) => handleChange('payingForTrip', e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", children: [_jsx("option", { value: "", children: "Select" }), _jsx("option", { value: "SELF", children: "Self" }), _jsx("option", { value: "EMPLOYER", children: "Employer" }), _jsx("option", { value: "FAMILY", children: "Family Member" }), _jsx("option", { value: "SPONSOR", children: "Sponsor/Organization" }), _jsx("option", { value: "OTHER", children: "Other" })] })] })] }), _jsxs("div", { className: "pb-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Travel Companions" }), _jsx("div", { className: "mb-4", children: _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: formData.travelingWithOthers, onChange: (e) => handleChange('travelingWithOthers', e.target.checked), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "text-sm font-medium text-gray-700", children: "Are you traveling with other persons?" })] }) }), formData.travelingWithOthers && (_jsxs("div", { className: "space-y-4 pl-6 border-l-2 border-blue-200", children: [formData.companions.map((companion, index) => (_jsxs("div", { className: "flex items-start gap-4 p-4 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "flex-1 grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Name" }), _jsx("input", { type: "text", value: companion.name, onChange: (e) => updateCompanion(index, 'name', e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "Full name" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Relationship" }), _jsx("input", { type: "text", value: companion.relationship, onChange: (e) => updateCompanion(index, 'relationship', e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "e.g., Spouse, Child, Friend" })] })] }), _jsx("button", { type: "button", onClick: () => removeCompanion(index), className: "p-2 text-red-600 hover:bg-red-50 rounded-lg", children: _jsx(X, { className: "w-4 h-4" }) })] }, index))), _jsxs("button", { type: "button", onClick: addCompanion, className: "flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50", children: [_jsx(Plus, { className: "w-4 h-4" }), "Add Companion"] })] }))] }), _jsxs("div", { className: "flex justify-between pt-4 border-t", children: [_jsxs("button", { type: "button", onClick: onPrev, className: "flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200", children: [_jsx(ChevronLeft, { className: "w-4 h-4" }), "Previous"] }), _jsxs("button", { type: "submit", disabled: isSaving, className: "flex items-center gap-2 px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50", children: ["Save & Continue", _jsx(ChevronRight, { className: "w-4 h-4" })] })] })] }));
}
