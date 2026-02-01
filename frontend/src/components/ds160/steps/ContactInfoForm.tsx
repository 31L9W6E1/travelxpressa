import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ContactInfo } from '../../../api/applications';

interface ContactInfoFormProps {
  data?: ContactInfo;
  onSave: (data: ContactInfo) => Promise<void>;
  onNext: () => void;
  onPrev: () => void;
}

export default function ContactInfoForm({ data, onSave, onNext, onPrev }: ContactInfoFormProps) {
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
        const submitData: ContactInfo = {
          ...value,
          mailingAddress: sameAsHome ? undefined : value.mailingAddress,
        };
        await onSave(submitData);
        onNext();
      } finally {
        setIsSaving(false);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      {/* Home Address Section */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Home Address</h3>
        <div className="space-y-4">
          <form.Field name="homeAddress.street">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123 Main Street, Apt 4B"
                />
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field name="homeAddress.city">
              {(field) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ulaanbaatar"
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="homeAddress.state">
              {(field) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                  <input
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="State/Province"
                  />
                </div>
              )}
            </form.Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field name="homeAddress.postalCode">
              {(field) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="14200"
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="homeAddress.country">
              {(field) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                  <input
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mongolia"
                  />
                </div>
              )}
            </form.Field>
          </div>
        </div>
      </div>

      {/* Mailing Address Section */}
      <div className="border-b pb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Mailing Address</h3>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={sameAsHome}
              onChange={(e) => setSameAsHome(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Same as home address
          </label>
        </div>

        {!sameAsHome && (
          <div className="space-y-4">
            <form.Field name="mailingAddress.street">
              {(field) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </form.Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form.Field name="mailingAddress.city">
                {(field) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="mailingAddress.country">
                {(field) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                    <input
                      type="text"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </form.Field>
            </div>
          </div>
        )}
      </div>

      {/* Contact Information Section */}
      <div className="pb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <form.Field name="phone">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Phone Number *
                </label>
                <input
                  type="tel"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+976 9999 9999"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="secondaryPhone">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secondary Phone Number
                </label>
                <input
                  type="tel"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+976 8888 8888"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="workPhone">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Phone Number
                </label>
                <input
                  type="tel"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+976 7777 7777"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="email">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your.email@example.com"
                />
              </div>
            )}
          </form.Field>
        </div>
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
