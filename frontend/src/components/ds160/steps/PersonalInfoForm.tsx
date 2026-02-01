import { useState } from 'react';
import { ChevronRight, HelpCircle } from 'lucide-react';
import type { PersonalInfo } from '../../../api/applications';

interface PersonalInfoFormProps {
  data?: PersonalInfo;
  onSave: (data: PersonalInfo) => Promise<void>;
  onNext: () => void;
}

export default function PersonalInfoForm({ data, onSave, onNext }: PersonalInfoFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<PersonalInfo>>({
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.surnames) newErrors.surnames = 'Surname is required';
    if (!formData.givenNames) newErrors.givenNames = 'Given name is required';
    if (!formData.telCode) newErrors.telCode = 'National ID is required';
    if (!formData.sex) newErrors.sex = 'Please select your sex';
    if (!formData.maritalStatus) newErrors.maritalStatus = 'Please select marital status';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.cityOfBirth) newErrors.cityOfBirth = 'City of birth is required';
    if (!formData.countryOfBirth) newErrors.countryOfBirth = 'Country of birth is required';
    if (!formData.nationality) newErrors.nationality = 'Nationality is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await onSave(formData as PersonalInfo);
      onNext();
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof PersonalInfo, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Section */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Full Name</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Surname(s) / Family Name(s) *
              <Tooltip text="Enter your surname exactly as it appears on your passport" />
            </label>
            <input
              type="text"
              value={formData.surnames || ''}
              onChange={(e) => handleChange('surnames', e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
              placeholder="SMITH"
            />
            {errors.surnames && <p className="mt-1 text-sm text-red-600">{errors.surnames}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Given Name(s) *
              <Tooltip text="Enter all your given names as they appear on your passport" />
            </label>
            <input
              type="text"
              value={formData.givenNames || ''}
              onChange={(e) => handleChange('givenNames', e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
              placeholder="JOHN MICHAEL"
            />
            {errors.givenNames && <p className="mt-1 text-sm text-red-600">{errors.givenNames}</p>}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name in Native Alphabet (if applicable)
          </label>
          <input
            type="text"
            value={formData.fullNameNative || ''}
            onChange={(e) => handleChange('fullNameNative', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your name in your native script"
          />
        </div>
      </div>

      {/* Personal Details Section */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sex *</label>
            <select
              value={formData.sex || ''}
              onChange={(e) => handleChange('sex', e.target.value as 'M' | 'F')}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
            {errors.sex && <p className="mt-1 text-sm text-red-600">{errors.sex}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status *</label>
            <select
              value={formData.maritalStatus || ''}
              onChange={(e) => handleChange('maritalStatus', e.target.value as PersonalInfo['maritalStatus'])}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select</option>
              <option value="SINGLE">Single</option>
              <option value="MARRIED">Married</option>
              <option value="DIVORCED">Divorced</option>
              <option value="WIDOWED">Widowed</option>
              <option value="SEPARATED">Separated</option>
            </select>
            {errors.maritalStatus && <p className="mt-1 text-sm text-red-600">{errors.maritalStatus}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
            <input
              type="date"
              value={formData.dateOfBirth || ''}
              onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>}
          </div>
        </div>
      </div>

      {/* Birth Information Section */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Place of Birth</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input
              type="text"
              value={formData.cityOfBirth || ''}
              onChange={(e) => handleChange('cityOfBirth', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="New York"
            />
            {errors.cityOfBirth && <p className="mt-1 text-sm text-red-600">{errors.cityOfBirth}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
            <input
              type="text"
              value={formData.stateOfBirth || ''}
              onChange={(e) => handleChange('stateOfBirth', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="New York"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
            <input
              type="text"
              value={formData.countryOfBirth || ''}
              onChange={(e) => handleChange('countryOfBirth', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="United States"
            />
            {errors.countryOfBirth && <p className="mt-1 text-sm text-red-600">{errors.countryOfBirth}</p>}
          </div>
        </div>
      </div>

      {/* Nationality Section */}
      <div className="pb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Nationality</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country/Region of Origin (Nationality) *
            </label>
            <input
              type="text"
              value={formData.nationality || ''}
              onChange={(e) => handleChange('nationality', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mongolia"
            />
            {errors.nationality && <p className="mt-1 text-sm text-red-600">{errors.nationality}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              National ID Number (if any) *
            </label>
            <input
              type="text"
              value={formData.telCode || ''}
              onChange={(e) => handleChange('telCode', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter ID number"
            />
            {errors.telCode && <p className="mt-1 text-sm text-red-600">{errors.telCode}</p>}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4 border-t">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Save & Continue
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

function Tooltip({ text }: { text: string }) {
  return (
    <span className="relative group ml-1">
      <HelpCircle className="w-4 h-4 inline text-gray-400 cursor-help" />
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
        {text}
      </span>
    </span>
  );
}
