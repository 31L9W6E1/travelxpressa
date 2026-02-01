import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { applicationsApi } from '../api/applications';
import { findCountryByCode } from '../config/countries';
import { ChevronRight, ChevronLeft, Check, Save, Send, User, Phone, FileText, Plane, Shield, AlertCircle, Loader2 } from 'lucide-react';
const initialFormData = {
    personalInfo: {
        surnames: '',
        givenNames: '',
        fullNameNative: '',
        sex: '',
        maritalStatus: '',
        dateOfBirth: '',
        cityOfBirth: '',
        stateOfBirth: '',
        countryOfBirth: '',
        nationality: '',
        nationalId: '',
    },
    contactInfo: {
        email: '',
        phone: '',
        streetAddress: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
    },
    passportInfo: {
        passportNumber: '',
        passportBookNumber: '',
        countryOfIssuance: '',
        cityOfIssuance: '',
        issuanceDate: '',
        expirationDate: '',
    },
    travelInfo: {
        purposeOfTrip: '',
        intendedArrivalDate: '',
        intendedLengthOfStay: '',
        usAddress: '',
        usCity: '',
        usState: '',
        payingForTrip: '',
    },
};
export default function Application() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(initialFormData);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [applicationId, setApplicationId] = useState(null);
    // Get selected country from localStorage (set in CountrySelect page)
    const selectedCountryCode = localStorage.getItem('selectedCountry') || 'USA';
    const countryConfig = findCountryByCode(selectedCountryCode);
    // Map country to visa type
    const getVisaTypeForCountry = (countryCode) => {
        const visaTypeMap = {
            'USA': 'B1_B2',
            'KOREA': 'OTHER',
            'SCHENGEN': 'OTHER',
            'CANADA': 'OTHER',
            'JAPAN': 'OTHER',
            'IRELAND': 'OTHER',
            'UK': 'OTHER',
            'AUSTRALIA': 'OTHER',
            'NEW_ZEALAND': 'OTHER',
        };
        return visaTypeMap[countryCode] || 'OTHER';
    };
    const steps = [
        { id: 1, name: 'Personal Info', icon: _jsx(User, { className: "w-5 h-5" }), status: currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'pending' },
        { id: 2, name: 'Contact Info', icon: _jsx(Phone, { className: "w-5 h-5" }), status: currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : 'pending' },
        { id: 3, name: 'Passport', icon: _jsx(FileText, { className: "w-5 h-5" }), status: currentStep === 3 ? 'current' : currentStep > 3 ? 'completed' : 'pending' },
        { id: 4, name: 'Travel Plans', icon: _jsx(Plane, { className: "w-5 h-5" }), status: currentStep === 4 ? 'current' : currentStep > 4 ? 'completed' : 'pending' },
        { id: 5, name: 'Review', icon: _jsx(Shield, { className: "w-5 h-5" }), status: currentStep === 5 ? 'current' : 'pending' },
    ];
    const updateFormData = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
        // Clear error when user types
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };
    const validateStep = (step) => {
        const newErrors = {};
        if (step === 1) {
            if (!formData.personalInfo.surnames)
                newErrors.surnames = 'Surname is required';
            if (!formData.personalInfo.givenNames)
                newErrors.givenNames = 'Given name is required';
            if (!formData.personalInfo.sex)
                newErrors.sex = 'Please select your sex';
            if (!formData.personalInfo.dateOfBirth)
                newErrors.dateOfBirth = 'Date of birth is required';
            if (!formData.personalInfo.countryOfBirth)
                newErrors.countryOfBirth = 'Country of birth is required';
            if (!formData.personalInfo.nationality)
                newErrors.nationality = 'Nationality is required';
        }
        else if (step === 2) {
            if (!formData.contactInfo.email)
                newErrors.email = 'Email is required';
            if (!formData.contactInfo.phone)
                newErrors.phone = 'Phone is required';
            if (!formData.contactInfo.streetAddress)
                newErrors.streetAddress = 'Address is required';
            if (!formData.contactInfo.city)
                newErrors.city = 'City is required';
            if (!formData.contactInfo.country)
                newErrors.country = 'Country is required';
        }
        else if (step === 3) {
            if (!formData.passportInfo.passportNumber)
                newErrors.passportNumber = 'Passport number is required';
            if (!formData.passportInfo.countryOfIssuance)
                newErrors.countryOfIssuance = 'Country of issuance is required';
            if (!formData.passportInfo.issuanceDate)
                newErrors.issuanceDate = 'Issuance date is required';
            if (!formData.passportInfo.expirationDate)
                newErrors.expirationDate = 'Expiration date is required';
        }
        else if (step === 4) {
            if (!formData.travelInfo.purposeOfTrip)
                newErrors.purposeOfTrip = 'Purpose of trip is required';
            if (!formData.travelInfo.intendedArrivalDate)
                newErrors.intendedArrivalDate = 'Arrival date is required';
            if (!formData.travelInfo.usAddress)
                newErrors.usAddress = 'US address is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 5));
        }
    };
    const handlePrev = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };
    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Transform form data to match API schema
            const apiData = {
                currentStep,
                personalInfo: {
                    surnames: formData.personalInfo.surnames,
                    givenNames: formData.personalInfo.givenNames,
                    fullNameNative: formData.personalInfo.fullNameNative || undefined,
                    otherNamesUsed: false,
                    telCode: '',
                    sex: (formData.personalInfo.sex || 'M'),
                    maritalStatus: (formData.personalInfo.maritalStatus || 'SINGLE'),
                    dateOfBirth: formData.personalInfo.dateOfBirth,
                    cityOfBirth: formData.personalInfo.cityOfBirth,
                    stateOfBirth: formData.personalInfo.stateOfBirth || undefined,
                    countryOfBirth: formData.personalInfo.countryOfBirth,
                    nationality: formData.personalInfo.nationality,
                },
                contactInfo: {
                    homeAddress: {
                        street: formData.contactInfo.streetAddress,
                        city: formData.contactInfo.city,
                        state: formData.contactInfo.state || undefined,
                        postalCode: formData.contactInfo.postalCode || undefined,
                        country: formData.contactInfo.country,
                    },
                    phone: formData.contactInfo.phone,
                    email: formData.contactInfo.email,
                },
                passportInfo: {
                    passportType: 'REGULAR',
                    passportNumber: formData.passportInfo.passportNumber,
                    passportBookNumber: formData.passportInfo.passportBookNumber || undefined,
                    countryOfIssuance: formData.passportInfo.countryOfIssuance,
                    cityOfIssuance: formData.passportInfo.cityOfIssuance,
                    issuanceDate: formData.passportInfo.issuanceDate,
                    expirationDate: formData.passportInfo.expirationDate,
                    hasOtherPassport: false,
                },
                travelInfo: {
                    purposeOfTrip: formData.travelInfo.purposeOfTrip,
                    intendedArrivalDate: formData.travelInfo.intendedArrivalDate,
                    intendedLengthOfStay: formData.travelInfo.intendedLengthOfStay,
                    addressWhileInUS: {
                        street: formData.travelInfo.usAddress,
                        city: formData.travelInfo.usCity,
                        state: formData.travelInfo.usState,
                    },
                    payingForTrip: formData.travelInfo.payingForTrip,
                    travelingWithOthers: false,
                },
            };
            if (applicationId) {
                // Update existing application
                await applicationsApi.update(applicationId, apiData);
            }
            else {
                // Create new application first
                const newApp = await applicationsApi.create({ visaType: getVisaTypeForCountry(selectedCountryCode) });
                setApplicationId(newApp.id);
                await applicationsApi.update(newApp.id, apiData);
            }
            alert('Application saved successfully!');
        }
        catch (error) {
            console.error('Save error:', error);
            alert('Failed to save application. Please try again.');
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleSubmit = async () => {
        if (!validateStep(currentStep))
            return;
        setIsSubmitting(true);
        try {
            // Transform form data to match API schema
            const apiData = {
                currentStep: 5,
                personalInfo: {
                    surnames: formData.personalInfo.surnames,
                    givenNames: formData.personalInfo.givenNames,
                    fullNameNative: formData.personalInfo.fullNameNative || undefined,
                    otherNamesUsed: false,
                    telCode: '',
                    sex: (formData.personalInfo.sex || 'M'),
                    maritalStatus: (formData.personalInfo.maritalStatus || 'SINGLE'),
                    dateOfBirth: formData.personalInfo.dateOfBirth,
                    cityOfBirth: formData.personalInfo.cityOfBirth,
                    stateOfBirth: formData.personalInfo.stateOfBirth || undefined,
                    countryOfBirth: formData.personalInfo.countryOfBirth,
                    nationality: formData.personalInfo.nationality,
                },
                contactInfo: {
                    homeAddress: {
                        street: formData.contactInfo.streetAddress,
                        city: formData.contactInfo.city,
                        state: formData.contactInfo.state || undefined,
                        postalCode: formData.contactInfo.postalCode || undefined,
                        country: formData.contactInfo.country,
                    },
                    phone: formData.contactInfo.phone,
                    email: formData.contactInfo.email,
                },
                passportInfo: {
                    passportType: 'REGULAR',
                    passportNumber: formData.passportInfo.passportNumber,
                    passportBookNumber: formData.passportInfo.passportBookNumber || undefined,
                    countryOfIssuance: formData.passportInfo.countryOfIssuance,
                    cityOfIssuance: formData.passportInfo.cityOfIssuance,
                    issuanceDate: formData.passportInfo.issuanceDate,
                    expirationDate: formData.passportInfo.expirationDate,
                    hasOtherPassport: false,
                },
                travelInfo: {
                    purposeOfTrip: formData.travelInfo.purposeOfTrip,
                    intendedArrivalDate: formData.travelInfo.intendedArrivalDate,
                    intendedLengthOfStay: formData.travelInfo.intendedLengthOfStay,
                    addressWhileInUS: {
                        street: formData.travelInfo.usAddress,
                        city: formData.travelInfo.usCity,
                        state: formData.travelInfo.usState,
                    },
                    payingForTrip: formData.travelInfo.payingForTrip,
                    travelingWithOthers: false,
                },
            };
            let appId = applicationId;
            if (!appId) {
                // Create new application first
                const newApp = await applicationsApi.create({ visaType: getVisaTypeForCountry(selectedCountryCode) });
                appId = newApp.id;
                setApplicationId(appId);
            }
            // Save all form data
            await applicationsApi.update(appId, apiData);
            // Submit the application
            await applicationsApi.submit(appId);
            alert('Application submitted successfully! You will receive a confirmation email.');
            navigate('/profile');
        }
        catch (error) {
            console.error('Submit error:', error);
            alert('Failed to submit application. Please try again.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (_jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "text-xl font-semibold text-white mb-6", children: "Personal Information" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Surname(s) / Family Name(s) *" }), _jsx("input", { type: "text", value: formData.personalInfo.surnames, onChange: (e) => updateFormData('personalInfo', 'surnames', e.target.value.toUpperCase()), className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase", placeholder: "SMITH" }), errors.surnames && _jsx("p", { className: "mt-1 text-sm text-red-400", children: errors.surnames })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Given Name(s) *" }), _jsx("input", { type: "text", value: formData.personalInfo.givenNames, onChange: (e) => updateFormData('personalInfo', 'givenNames', e.target.value.toUpperCase()), className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase", placeholder: "JOHN MICHAEL" }), errors.givenNames && _jsx("p", { className: "mt-1 text-sm text-red-400", children: errors.givenNames })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Full Name in Native Alphabet" }), _jsx("input", { type: "text", value: formData.personalInfo.fullNameNative, onChange: (e) => updateFormData('personalInfo', 'fullNameNative', e.target.value), className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "Enter in your native script" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Sex *" }), _jsxs("select", { value: formData.personalInfo.sex, onChange: (e) => updateFormData('personalInfo', 'sex', e.target.value), className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "", className: "bg-slate-800", children: "Select" }), _jsx("option", { value: "M", className: "bg-slate-800", children: "Male" }), _jsx("option", { value: "F", className: "bg-slate-800", children: "Female" })] }), errors.sex && _jsx("p", { className: "mt-1 text-sm text-red-400", children: errors.sex })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Marital Status *" }), _jsxs("select", { value: formData.personalInfo.maritalStatus, onChange: (e) => updateFormData('personalInfo', 'maritalStatus', e.target.value), className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "", className: "bg-slate-800", children: "Select" }), _jsx("option", { value: "SINGLE", className: "bg-slate-800", children: "Single" }), _jsx("option", { value: "MARRIED", className: "bg-slate-800", children: "Married" }), _jsx("option", { value: "DIVORCED", className: "bg-slate-800", children: "Divorced" }), _jsx("option", { value: "WIDOWED", className: "bg-slate-800", children: "Widowed" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Date of Birth *" }), _jsx("input", { type: "date", value: formData.personalInfo.dateOfBirth, onChange: (e) => updateFormData('personalInfo', 'dateOfBirth', e.target.value), className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" }), errors.dateOfBirth && _jsx("p", { className: "mt-1 text-sm text-red-400", children: errors.dateOfBirth })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "City of Birth *" }), _jsx("input", { type: "text", value: formData.personalInfo.cityOfBirth, onChange: (e) => updateFormData('personalInfo', 'cityOfBirth', e.target.value), className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "Ulaanbaatar" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Country of Birth *" }), _jsx("input", { type: "text", value: formData.personalInfo.countryOfBirth, onChange: (e) => updateFormData('personalInfo', 'countryOfBirth', e.target.value), className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "Mongolia" }), errors.countryOfBirth && _jsx("p", { className: "mt-1 text-sm text-red-400", children: errors.countryOfBirth })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Nationality *" }), _jsx("input", { type: "text", value: formData.personalInfo.nationality, onChange: (e) => updateFormData('personalInfo', 'nationality', e.target.value), className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "Mongolian" }), errors.nationality && _jsx("p", { className: "mt-1 text-sm text-red-400", children: errors.nationality })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "National ID Number" }), _jsx("input", { type: "text", value: formData.personalInfo.nationalId, onChange: (e) => updateFormData('personalInfo', 'nationalId', e.target.value), className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "ID Number" })] })] })] }));
            case 2:
                return (_jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "text-xl font-semibold text-white mb-6", children: "Contact Information" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Email Address *" }), _jsx("input", { type: "email", value: formData.contactInfo.email, onChange: (e) => updateFormData('contactInfo', 'email', e.target.value), className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "email@example.com" }), errors.email && _jsx("p", { className: "mt-1 text-sm text-red-400", children: errors.email })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Phone Number *" }), _jsx("input", { type: "tel", value: formData.contactInfo.phone, onChange: (e) => updateFormData('contactInfo', 'phone', e.target.value), className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "+976-9999-9999" }), errors.phone && _jsx("p", { className: "mt-1 text-sm text-red-400", children: errors.phone })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Street Address *" }), _jsx("input", { type: "text", value: formData.contactInfo.streetAddress, onChange: (e) => updateFormData('contactInfo', 'streetAddress', e.target.value), className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "123 Main Street, Apt 4B" }), errors.streetAddress && _jsx("p", { className: "mt-1 text-sm text-red-400", children: errors.streetAddress })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "City *" }), _jsx("input", { type: "text", value: formData.contactInfo.city, onChange: (e) => updateFormData('contactInfo', 'city', e.target.value), className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "Ulaanbaatar" }), errors.city && _jsx("p", { className: "mt-1 text-sm text-red-400", children: errors.city })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "State/Province" }), _jsx("input", { type: "text", value: formData.contactInfo.state, onChange: (e) => updateFormData('contactInfo', 'state', e.target.value), className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "State/Province" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Postal Code" }), _jsx("input", { type: "text", value: formData.contactInfo.postalCode, onChange: (e) => updateFormData('contactInfo', 'postalCode', e.target.value), className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "12345" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Country *" }), _jsx("input", { type: "text", value: formData.contactInfo.country, onChange: (e) => updateFormData('contactInfo', 'country', e.target.value), className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "Mongolia" }), errors.country && _jsx("p", { className: "mt-1 text-sm text-red-400", children: errors.country })] })] })] }));
            case 3:
                return (_jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "text-xl font-semibold text-white mb-6", children: "Passport Information" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Passport Number *" }), _jsx("input", { type: "text", value: formData.passportInfo.passportNumber, onChange: (e) => updateFormData('passportInfo', 'passportNumber', e.target.value.toUpperCase()), className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase", placeholder: "E12345678" }), errors.passportNumber && _jsx("p", { className: "mt-1 text-sm text-red-400", children: errors.passportNumber })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Passport Book Number" }), _jsx("input", { type: "text", value: formData.passportInfo.passportBookNumber, onChange: (e) => updateFormData('passportInfo', 'passportBookNumber', e.target.value), className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "Book number (if applicable)" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Country of Issuance *" }), _jsx("input", { type: "text", value: formData.passportInfo.countryOfIssuance, onChange: (e) => updateFormData('passportInfo', 'countryOfIssuance', e.target.value), className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "Mongolia" }), errors.countryOfIssuance && _jsx("p", { className: "mt-1 text-sm text-red-400", children: errors.countryOfIssuance })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "City of Issuance" }), _jsx("input", { type: "text", value: formData.passportInfo.cityOfIssuance, onChange: (e) => updateFormData('passportInfo', 'cityOfIssuance', e.target.value), className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "Ulaanbaatar" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Issuance Date *" }), _jsx("input", { type: "date", value: formData.passportInfo.issuanceDate, onChange: (e) => updateFormData('passportInfo', 'issuanceDate', e.target.value), className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" }), errors.issuanceDate && _jsx("p", { className: "mt-1 text-sm text-red-400", children: errors.issuanceDate })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Expiration Date *" }), _jsx("input", { type: "date", value: formData.passportInfo.expirationDate, onChange: (e) => updateFormData('passportInfo', 'expirationDate', e.target.value), className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" }), errors.expirationDate && _jsx("p", { className: "mt-1 text-sm text-red-400", children: errors.expirationDate }), _jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Must be valid for at least 6 months beyond your intended stay" })] })] })] }));
            case 4:
                return (_jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "text-xl font-semibold text-white mb-6", children: "Travel Information" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Purpose of Trip *" }), _jsxs("select", { value: formData.travelInfo.purposeOfTrip, onChange: (e) => updateFormData('travelInfo', 'purposeOfTrip', e.target.value), className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "", className: "bg-slate-800", children: "Select purpose" }), _jsx("option", { value: "TOURISM", className: "bg-slate-800", children: "Tourism/Vacation" }), _jsx("option", { value: "BUSINESS", className: "bg-slate-800", children: "Business" }), _jsx("option", { value: "STUDY", className: "bg-slate-800", children: "Study" }), _jsx("option", { value: "MEDICAL", className: "bg-slate-800", children: "Medical Treatment" }), _jsx("option", { value: "CONFERENCE", className: "bg-slate-800", children: "Conference" }), _jsx("option", { value: "FAMILY", className: "bg-slate-800", children: "Visit Family/Friends" })] }), errors.purposeOfTrip && _jsx("p", { className: "mt-1 text-sm text-red-400", children: errors.purposeOfTrip })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Intended Arrival Date *" }), _jsx("input", { type: "date", value: formData.travelInfo.intendedArrivalDate, onChange: (e) => updateFormData('travelInfo', 'intendedArrivalDate', e.target.value), className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" }), errors.intendedArrivalDate && _jsx("p", { className: "mt-1 text-sm text-red-400", children: errors.intendedArrivalDate })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Length of Stay" }), _jsx("input", { type: "text", value: formData.travelInfo.intendedLengthOfStay, onChange: (e) => updateFormData('travelInfo', 'intendedLengthOfStay', e.target.value), className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "e.g., 2 weeks" })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "US Address *" }), _jsx("input", { type: "text", value: formData.travelInfo.usAddress, onChange: (e) => updateFormData('travelInfo', 'usAddress', e.target.value), className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "Hotel or residence address in the US" }), errors.usAddress && _jsx("p", { className: "mt-1 text-sm text-red-400", children: errors.usAddress })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "City" }), _jsx("input", { type: "text", value: formData.travelInfo.usCity, onChange: (e) => updateFormData('travelInfo', 'usCity', e.target.value), className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "New York" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "State" }), _jsx("input", { type: "text", value: formData.travelInfo.usState, onChange: (e) => updateFormData('travelInfo', 'usState', e.target.value), className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "NY" })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Who is paying for your trip?" }), _jsxs("select", { value: formData.travelInfo.payingForTrip, onChange: (e) => updateFormData('travelInfo', 'payingForTrip', e.target.value), className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "", className: "bg-slate-800", children: "Select" }), _jsx("option", { value: "SELF", className: "bg-slate-800", children: "Self" }), _jsx("option", { value: "EMPLOYER", className: "bg-slate-800", children: "Employer" }), _jsx("option", { value: "FAMILY", className: "bg-slate-800", children: "Family Member" }), _jsx("option", { value: "SPONSOR", className: "bg-slate-800", children: "Sponsor" })] })] })] })] }));
            case 5:
                return (_jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "text-xl font-semibold text-white mb-6", children: "Review Your Application" }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white/5 border border-white/10 rounded-xl p-6", children: [_jsxs("h4", { className: "text-lg font-medium text-white mb-4 flex items-center gap-2", children: [_jsx(User, { className: "w-5 h-5" }), "Personal Information"] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-400", children: "Name:" }), " ", _jsxs("span", { className: "text-white ml-2", children: [formData.personalInfo.surnames, " ", formData.personalInfo.givenNames] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-400", children: "DOB:" }), " ", _jsx("span", { className: "text-white ml-2", children: formData.personalInfo.dateOfBirth })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-400", children: "Nationality:" }), " ", _jsx("span", { className: "text-white ml-2", children: formData.personalInfo.nationality })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-400", children: "Birth Place:" }), " ", _jsxs("span", { className: "text-white ml-2", children: [formData.personalInfo.cityOfBirth, ", ", formData.personalInfo.countryOfBirth] })] })] })] }), _jsxs("div", { className: "bg-white/5 border border-white/10 rounded-xl p-6", children: [_jsxs("h4", { className: "text-lg font-medium text-white mb-4 flex items-center gap-2", children: [_jsx(Phone, { className: "w-5 h-5" }), "Contact Information"] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-400", children: "Email:" }), " ", _jsx("span", { className: "text-white ml-2", children: formData.contactInfo.email })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-400", children: "Phone:" }), " ", _jsx("span", { className: "text-white ml-2", children: formData.contactInfo.phone })] }), _jsxs("div", { className: "col-span-2", children: [_jsx("span", { className: "text-gray-400", children: "Address:" }), " ", _jsxs("span", { className: "text-white ml-2", children: [formData.contactInfo.streetAddress, ", ", formData.contactInfo.city, ", ", formData.contactInfo.country] })] })] })] }), _jsxs("div", { className: "bg-white/5 border border-white/10 rounded-xl p-6", children: [_jsxs("h4", { className: "text-lg font-medium text-white mb-4 flex items-center gap-2", children: [_jsx(FileText, { className: "w-5 h-5" }), "Passport Information"] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-400", children: "Passport #:" }), " ", _jsx("span", { className: "text-white ml-2", children: formData.passportInfo.passportNumber })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-400", children: "Country:" }), " ", _jsx("span", { className: "text-white ml-2", children: formData.passportInfo.countryOfIssuance })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-400", children: "Issued:" }), " ", _jsx("span", { className: "text-white ml-2", children: formData.passportInfo.issuanceDate })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-400", children: "Expires:" }), " ", _jsx("span", { className: "text-white ml-2", children: formData.passportInfo.expirationDate })] })] })] }), _jsxs("div", { className: "bg-white/5 border border-white/10 rounded-xl p-6", children: [_jsxs("h4", { className: "text-lg font-medium text-white mb-4 flex items-center gap-2", children: [_jsx(Plane, { className: "w-5 h-5" }), "Travel Plans"] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-400", children: "Purpose:" }), " ", _jsx("span", { className: "text-white ml-2", children: formData.travelInfo.purposeOfTrip })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-400", children: "Arrival:" }), " ", _jsx("span", { className: "text-white ml-2", children: formData.travelInfo.intendedArrivalDate })] }), _jsxs("div", { className: "col-span-2", children: [_jsx("span", { className: "text-gray-400", children: "US Address:" }), " ", _jsxs("span", { className: "text-white ml-2", children: [formData.travelInfo.usAddress, ", ", formData.travelInfo.usCity, " ", formData.travelInfo.usState] })] })] })] }), _jsx("div", { className: "bg-white/5 border border-white/20 rounded-xl p-6", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(AlertCircle, { className: "w-6 h-6 text-white flex-shrink-0" }), _jsxs("div", { children: [_jsx("h4", { className: "text-white font-medium mb-1", children: "Important Notice" }), _jsx("p", { className: "text-sm text-gray-400", children: "Please review all information carefully before submitting. Once submitted, you may need to start a new application to make changes. Providing false information may result in visa denial." })] })] }) })] })] }));
            default:
                return null;
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-black", children: _jsxs("div", { className: "max-w-5xl mx-auto px-4 pt-24 pb-8", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-white mb-2", children: "DS-160 Visa Application" }), _jsx("p", { className: "text-gray-400", children: "Complete your nonimmigrant visa application" })] }), _jsxs("div", { className: "mb-8", children: [_jsx("div", { className: "flex items-center justify-between", children: steps.map((step, index) => (_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: `flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${step.status === 'completed'
                                            ? 'bg-white border-white text-black'
                                            : step.status === 'current'
                                                ? 'bg-white/20 border-white text-white'
                                                : 'bg-white/5 border-white/20 text-gray-400'}`, children: step.status === 'completed' ? _jsx(Check, { className: "w-6 h-6" }) : step.icon }), index < steps.length - 1 && (_jsx("div", { className: `hidden md:block w-24 h-1 mx-2 rounded ${step.status === 'completed' ? 'bg-white' : 'bg-white/10'}` }))] }, step.id))) }), _jsx("div", { className: "flex justify-between mt-2", children: steps.map((step) => (_jsx("span", { className: `text-xs font-medium ${step.status === 'current' ? 'text-white' : 'text-gray-500'}`, children: step.name }, step.id))) })] }), _jsxs("div", { className: "bg-white/5 border border-white/10 rounded-2xl p-8", children: [renderStepContent(), _jsxs("div", { className: "flex justify-between items-center mt-8 pt-6 border-t border-white/10", children: [_jsxs("button", { onClick: handlePrev, disabled: currentStep === 1, className: "flex items-center gap-2 px-6 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx(ChevronLeft, { className: "w-5 h-5" }), "Previous"] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("button", { onClick: handleSave, disabled: isSaving, className: "flex items-center gap-2 px-6 py-3 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all", children: [isSaving ? _jsx(Loader2, { className: "w-5 h-5 animate-spin" }) : _jsx(Save, { className: "w-5 h-5" }), "Save Draft"] }), currentStep < 5 ? (_jsxs("button", { onClick: handleNext, className: "flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-all", children: ["Next", _jsx(ChevronRight, { className: "w-5 h-5" })] })) : (_jsxs("button", { onClick: handleSubmit, disabled: isSubmitting, className: "flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-all disabled:opacity-50", children: [isSubmitting ? _jsx(Loader2, { className: "w-5 h-5 animate-spin" }) : _jsx(Send, { className: "w-5 h-5" }), "Submit Application"] }))] })] })] })] }) }));
}
