import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { ChevronLeft, ChevronRight } from 'lucide-react';
export default function ContactInfoForm({ data, onSave, onNext, onPrev }) {
    const [isSaving, setIsSaving] = useState(false);
    const [sameAsHome, setSameAsHome] = useState(true);
    const form = useForm({
        defaultValues: {
            homeAddress: {
                street: data?.homeAddress?.street || '',
                city: data?.homeAddress?.city || '',
                state: data?.homeAddress?.state || '',
                postalCode: data?.homeAddress?.postalCode || '',
                country: data?.homeAddress?.country || '',
            },
            mailingAddress: {
                street: data?.mailingAddress?.street || '',
                city: data?.mailingAddress?.city || '',
                state: data?.mailingAddress?.state || '',
                postalCode: data?.mailingAddress?.postalCode || '',
                country: data?.mailingAddress?.country || '',
            },
            phone: data?.phone || '',
            secondaryPhone: data?.secondaryPhone || '',
            workPhone: data?.workPhone || '',
            email: data?.email || '',
        },
        onSubmit: async ({ value }) => {
            setIsSaving(true);
            try {
                const submitData = {
                    ...value,
                    mailingAddress: sameAsHome ? undefined : value.mailingAddress,
                };
                await onSave(submitData);
                onNext();
            }
            finally {
                setIsSaving(false);
            }
        },
    });
    return (_jsxs("form", { onSubmit: (e) => {
            e.preventDefault();
            form.handleSubmit();
        }, className: "space-y-6", children: [_jsxs("div", { className: "border-b pb-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Home Address" }), _jsxs("div", { className: "space-y-4", children: [_jsx(form.Field, { name: "homeAddress.street", children: (field) => (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Street Address *" }), _jsx("input", { type: "text", value: field.state.value, onChange: (e) => field.handleChange(e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "123 Main Street, Apt 4B" })] })) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(form.Field, { name: "homeAddress.city", children: (field) => (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "City *" }), _jsx("input", { type: "text", value: field.state.value, onChange: (e) => field.handleChange(e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "Ulaanbaatar" })] })) }), _jsx(form.Field, { name: "homeAddress.state", children: (field) => (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "State/Province" }), _jsx("input", { type: "text", value: field.state.value, onChange: (e) => field.handleChange(e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "State/Province" })] })) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(form.Field, { name: "homeAddress.postalCode", children: (field) => (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Postal Code" }), _jsx("input", { type: "text", value: field.state.value, onChange: (e) => field.handleChange(e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "14200" })] })) }), _jsx(form.Field, { name: "homeAddress.country", children: (field) => (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Country *" }), _jsx("input", { type: "text", value: field.state.value, onChange: (e) => field.handleChange(e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "Mongolia" })] })) })] })] })] }), _jsxs("div", { className: "border-b pb-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Mailing Address" }), _jsxs("label", { className: "flex items-center gap-2 text-sm", children: [_jsx("input", { type: "checkbox", checked: sameAsHome, onChange: (e) => setSameAsHome(e.target.checked), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), "Same as home address"] })] }), !sameAsHome && (_jsxs("div", { className: "space-y-4", children: [_jsx(form.Field, { name: "mailingAddress.street", children: (field) => (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Street Address *" }), _jsx("input", { type: "text", value: field.state.value, onChange: (e) => field.handleChange(e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" })] })) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(form.Field, { name: "mailingAddress.city", children: (field) => (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "City *" }), _jsx("input", { type: "text", value: field.state.value, onChange: (e) => field.handleChange(e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" })] })) }), _jsx(form.Field, { name: "mailingAddress.country", children: (field) => (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Country *" }), _jsx("input", { type: "text", value: field.state.value, onChange: (e) => field.handleChange(e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" })] })) })] })] }))] }), _jsxs("div", { className: "pb-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Contact Information" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(form.Field, { name: "phone", children: (field) => (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Primary Phone Number *" }), _jsx("input", { type: "tel", value: field.state.value, onChange: (e) => field.handleChange(e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "+976 9999 9999" })] })) }), _jsx(form.Field, { name: "secondaryPhone", children: (field) => (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Secondary Phone Number" }), _jsx("input", { type: "tel", value: field.state.value, onChange: (e) => field.handleChange(e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "+976 8888 8888" })] })) }), _jsx(form.Field, { name: "workPhone", children: (field) => (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Work Phone Number" }), _jsx("input", { type: "tel", value: field.state.value, onChange: (e) => field.handleChange(e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "+976 7777 7777" })] })) }), _jsx(form.Field, { name: "email", children: (field) => (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email Address *" }), _jsx("input", { type: "email", value: field.state.value, onChange: (e) => field.handleChange(e.target.value), className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "your.email@example.com" })] })) })] })] }), _jsxs("div", { className: "flex justify-between pt-4 border-t", children: [_jsxs("button", { type: "button", onClick: onPrev, className: "flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200", children: [_jsx(ChevronLeft, { className: "w-4 h-4" }), "Previous"] }), _jsxs("button", { type: "submit", disabled: isSaving, className: "flex items-center gap-2 px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50", children: ["Save & Continue", _jsx(ChevronRight, { className: "w-4 h-4" })] })] })] }));
}
