import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PassportInfo } from '../../../api/applications';

interface PassportInfoFormProps {
  data?: PassportInfo;
  onSave: (data: PassportInfo) => Promise<void>;
  onNext: () => void;
  onPrev: () => void;
}

export default function PassportInfoForm({ data, onSave, onNext, onPrev }: PassportInfoFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<PassportInfo>>({
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

  const handleChange = (field: string, value: string | boolean) => {
    if (field.startsWith('otherPassportInfo.')) {
      const subField = field.replace('otherPassportInfo.', '');
      setFormData(prev => ({
        ...prev,
        otherPassportInfo: {
          ...prev.otherPassportInfo,
          [subField]: value,
        } as { number: string; country: string },
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const submitData: PassportInfo = {
        ...formData as PassportInfo,
        otherPassportInfo: formData.hasOtherPassport ? formData.otherPassportInfo : undefined,
      };
      await onSave(submitData);
      onNext();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Passport Type Section */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Passport Type</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Passport/Travel Document Type *
          </label>
          <select
            value={formData.passportType || ''}
            onChange={(e) => handleChange('passportType', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="REGULAR">Regular</option>
            <option value="OFFICIAL">Official</option>
            <option value="DIPLOMATIC">Diplomatic</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Passport Details Section */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Passport Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passport Number *
            </label>
            <input
              type="text"
              value={formData.passportNumber || ''}
              onChange={(e) => handleChange('passportNumber', e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
              placeholder="E12345678"
            />
            <p className="mt-1 text-xs text-gray-500">Enter exactly as shown on your passport</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passport Book Number (if any)
            </label>
            <input
              type="text"
              value={formData.passportBookNumber || ''}
              onChange={(e) => handleChange('passportBookNumber', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Book number"
            />
          </div>
        </div>
      </div>

      {/* Issuance Information Section */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Issuance Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country/Authority that Issued Passport *
            </label>
            <input
              type="text"
              value={formData.countryOfIssuance || ''}
              onChange={(e) => handleChange('countryOfIssuance', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mongolia"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City Where Issued *
            </label>
            <input
              type="text"
              value={formData.cityOfIssuance || ''}
              onChange={(e) => handleChange('cityOfIssuance', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ulaanbaatar"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State/Province (if any)
            </label>
            <input
              type="text"
              value={formData.stateOfIssuance || ''}
              onChange={(e) => handleChange('stateOfIssuance', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="State/Province"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issuance Date *
            </label>
            <input
              type="date"
              value={formData.issuanceDate || ''}
              onChange={(e) => handleChange('issuanceDate', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiration Date *
            </label>
            <input
              type="date"
              value={formData.expirationDate || ''}
              onChange={(e) => handleChange('expirationDate', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Your passport must be valid for at least 6 months beyond your intended stay
            </p>
          </div>
        </div>
      </div>

      {/* Other Passport Section */}
      <div className="pb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Passport Information</h3>
        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.hasOtherPassport || false}
              onChange={(e) => handleChange('hasOtherPassport', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Do you hold or have you held any nationality other than the one indicated above?
            </span>
          </label>
        </div>

        {formData.hasOtherPassport && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-blue-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Other Country/Authority
              </label>
              <input
                type="text"
                value={formData.otherPassportInfo?.country || ''}
                onChange={(e) => handleChange('otherPassportInfo.country', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Country"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Other Passport Number
              </label>
              <input
                type="text"
                value={formData.otherPassportInfo?.number || ''}
                onChange={(e) => handleChange('otherPassportInfo.number', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Passport number"
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <button
          type="button"
          onClick={onPrev}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
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
