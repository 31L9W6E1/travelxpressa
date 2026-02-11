import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import type { TravelInfo } from '../../../api/applications';

// US States for dropdown
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

interface TravelInfoFormProps {
  data?: TravelInfo;
  onSave: (data: TravelInfo) => Promise<void>;
  onNext: () => void;
  onPrev: () => void;
}

export default function TravelInfoForm({ data, onSave, onNext, onPrev }: TravelInfoFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    purposeOfTrip: data?.purposeOfTrip || '',
    specificPurpose: data?.specificPurpose || '',
    intendedArrivalDate: data?.intendedArrivalDate || '',
    intendedLengthOfStay: data?.intendedLengthOfStay || '',
    noUSAddressYet: data?.noUSAddressYet || false,
    destinationCountry: data?.destinationCountry || 'USA',
    supportServices: {
      hotelBooking: data?.supportServices?.hotelBooking || false,
      preFlightBooking: data?.supportServices?.preFlightBooking || false,
      travelItinerary: data?.supportServices?.travelItinerary || false,
      declarationFormAssistance: data?.supportServices?.declarationFormAssistance || false,
    },
    supportNotes: data?.supportNotes || '',
    addressWhileInUS: {
      street: data?.addressWhileInUS?.street || '',
      city: data?.addressWhileInUS?.city || '',
      state: data?.addressWhileInUS?.state || '',
      zipCode: data?.addressWhileInUS?.zipCode || '',
    },
    payingForTrip: data?.payingForTrip || '',
    travelingWithOthers: data?.travelingWithOthers || false,
    companions: data?.companions || [] as Array<{ name: string; relationship: string }>,
  });

  const handleChange = (field: string, value: string | boolean) => {
    if (field.startsWith('addressWhileInUS.')) {
      const subField = field.replace('addressWhileInUS.', '');
      setFormData(prev => ({
        ...prev,
        addressWhileInUS: {
          ...prev.addressWhileInUS,
          [subField]: value,
        },
      }));
    } else if (field.startsWith('supportServices.')) {
      const subField = field.replace('supportServices.', '');
      setFormData(prev => ({
        ...prev,
        supportServices: {
          ...prev.supportServices,
          [subField]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const addCompanion = () => {
    setFormData(prev => ({
      ...prev,
      companions: [...prev.companions, { name: '', relationship: '' }],
    }));
  };

  const removeCompanion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      companions: prev.companions.filter((_, i) => i !== index),
    }));
  };

  const updateCompanion = (index: number, field: 'name' | 'relationship', value: string) => {
    setFormData(prev => ({
      ...prev,
      companions: prev.companions.map((c, i) =>
        i === index ? { ...c, [field]: value } : c
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData as TravelInfo);
      onNext();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Trip Purpose Section */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Purpose of Trip</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purpose of Trip to the U.S. *
            </label>
            <select
              value={formData.purposeOfTrip}
              onChange={(e) => handleChange('purposeOfTrip', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select purpose</option>
              <option value="TOURISM">Tourism/Vacation</option>
              <option value="BUSINESS">Business</option>
              <option value="STUDY">Study</option>
              <option value="WORK">Work</option>
              <option value="MEDICAL">Medical Treatment</option>
              <option value="CONFERENCE">Conference/Convention</option>
              <option value="FAMILY">Visit Family/Friends</option>
              <option value="TRANSIT">Transit</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specific Travel Plans
            </label>
            <textarea
              value={formData.specificPurpose}
              onChange={(e) => handleChange('specificPurpose', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe your specific travel plans, places you intend to visit, etc."
            />
          </div>
        </div>
      </div>

      {/* Travel Dates Section */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Travel Dates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Intended Date of Arrival *
            </label>
            <input
              type="date"
              value={formData.intendedArrivalDate}
              onChange={(e) => handleChange('intendedArrivalDate', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Intended Length of Stay *
            </label>
            <input
              type="text"
              value={formData.intendedLengthOfStay}
              onChange={(e) => handleChange('intendedLengthOfStay', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 2 weeks, 3 months"
            />
          </div>
        </div>
      </div>

      {/* US Address Section */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Address in the United States</h3>
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination Country
              </label>
              <select
                value={formData.destinationCountry}
                onChange={(e) => handleChange('destinationCountry', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="USA">USA</option>
                <option value="JAPAN">Japan</option>
                <option value="SCHENGEN">Schengen</option>
                <option value="UK">United Kingdom</option>
                <option value="CANADA">Canada</option>
                <option value="AUSTRALIA">Australia</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
              <input
                id="noUSAddressYet"
                type="checkbox"
                checked={formData.noUSAddressYet}
                onChange={(e) => handleChange('noUSAddressYet', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="noUSAddressYet" className="text-sm text-gray-700">
                I do not have a U.S. address yet (need hotel/itinerary support)
              </label>
            </div>
          </div>

          {!formData.noUSAddressYet ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={formData.addressWhileInUS.street}
                  onChange={(e) => handleChange('addressWhileInUS.street', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    value={formData.addressWhileInUS.city}
                    onChange={(e) => handleChange('addressWhileInUS.city', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="New York"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <select
                    value={formData.addressWhileInUS.state}
                    onChange={(e) => handleChange('addressWhileInUS.state', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select state</option>
                    {US_STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    value={formData.addressWhileInUS.zipCode}
                    onChange={(e) => handleChange('addressWhileInUS.zipCode', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="10001"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                Address can be provided later. Enable support services below so your team can prepare hotel booking
                and itinerary documents.
              </p>
            </div>
          )}

          <div className="rounded-lg border p-4 space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Support Services Needed</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.supportServices.hotelBooking}
                  onChange={(e) => handleChange('supportServices.hotelBooking', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Hotel booking support
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.supportServices.travelItinerary}
                  onChange={(e) => handleChange('supportServices.travelItinerary', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Travel itinerary preparation
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.supportServices.preFlightBooking}
                  onChange={(e) => handleChange('supportServices.preFlightBooking', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Pre-flight booking support
              </label>
              {(formData.destinationCountry === 'JAPAN' || formData.destinationCountry === 'OTHER') && (
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.supportServices.declarationFormAssistance}
                    onChange={(e) => handleChange('supportServices.declarationFormAssistance', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Declaration form / VFS form assistance
                </label>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional support notes
              </label>
              <textarea
                value={formData.supportNotes}
                onChange={(e) => handleChange('supportNotes', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any specific hotel area, itinerary preferences, or VFS/Japan form requirements..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Trip Funding Section */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Trip Funding</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Who is paying for your trip? *
          </label>
          <select
            value={formData.payingForTrip}
            onChange={(e) => handleChange('payingForTrip', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select</option>
            <option value="SELF">Self</option>
            <option value="EMPLOYER">Employer</option>
            <option value="FAMILY">Family Member</option>
            <option value="SPONSOR">Sponsor/Organization</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Travel Companions Section */}
      <div className="pb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Travel Companions</h3>
        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.travelingWithOthers}
              onChange={(e) => handleChange('travelingWithOthers', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Are you traveling with other persons?
            </span>
          </label>
        </div>

        {formData.travelingWithOthers && (
          <div className="space-y-4 pl-6 border-l-2 border-blue-200">
            {formData.companions.map((companion, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={companion.name}
                      onChange={(e) => updateCompanion(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relationship
                    </label>
                    <input
                      type="text"
                      value={companion.relationship}
                      onChange={(e) => updateCompanion(index, 'relationship', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Spouse, Child, Friend"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeCompanion(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addCompanion}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
            >
              <Plus className="w-4 h-4" />
              Add Companion
            </button>
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
