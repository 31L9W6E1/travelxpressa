import { useState } from 'react';
import { ChevronRight, ChevronLeft, Plus, Trash2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface FamilyInfo {
  // Father
  fatherSurnames: string;
  fatherGivenNames: string;
  fatherDateOfBirth: string;
  isFatherInUS: boolean;
  fatherUSStatus?: string;

  // Mother
  motherSurnames: string;
  motherGivenNames: string;
  motherDateOfBirth: string;
  isMotherInUS: boolean;
  motherUSStatus?: string;

  // Spouse (if married)
  hasSpouse: boolean;
  spouseFullName?: string;
  spouseDateOfBirth?: string;
  spouseNationality?: string;
  spouseCityOfBirth?: string;
  spouseCountryOfBirth?: string;
  spouseAddress?: string;
  spouseAddressSameAsApplicant?: boolean;

  // Children
  hasChildren: boolean;
  children?: Array<{
    fullName: string;
    dateOfBirth: string;
    relationship: string;
  }>;

  // Immediate relatives in US
  hasImmediateRelativesInUS: boolean;
  immediateRelativesInUS?: Array<{
    fullName: string;
    relationship: string;
    status: string;
  }>;

  // Other relatives in US
  hasOtherRelativesInUS: boolean;
  otherRelativesInUS?: Array<{
    fullName: string;
    relationship: string;
    status: string;
  }>;
}

interface FamilyInfoFormProps {
  data?: FamilyInfo;
  onSave: (data: FamilyInfo) => Promise<void>;
  onNext: () => void;
  onPrev: () => void;
}

export default function FamilyInfoForm({ data, onSave, onNext, onPrev }: FamilyInfoFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<FamilyInfo>>({
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fatherSurnames) newErrors.fatherSurnames = 'Father\'s surname is required';
    if (!formData.fatherGivenNames) newErrors.fatherGivenNames = 'Father\'s given name is required';
    if (!formData.motherSurnames) newErrors.motherSurnames = 'Mother\'s surname is required';
    if (!formData.motherGivenNames) newErrors.motherGivenNames = 'Mother\'s given name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await onSave(formData as FamilyInfo);
      onNext();
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof FamilyInfo, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addChild = () => {
    const currentChildren = formData.children || [];
    handleChange('children', [...currentChildren, { fullName: '', dateOfBirth: '', relationship: 'CHILD' }]);
  };

  const removeChild = (index: number) => {
    const currentChildren = formData.children || [];
    handleChange('children', currentChildren.filter((_, i) => i !== index));
  };

  const updateChild = (index: number, field: string, value: string) => {
    const currentChildren = [...(formData.children || [])];
    currentChildren[index] = { ...currentChildren[index], [field]: value };
    handleChange('children', currentChildren);
  };

  const addRelative = (type: 'immediate' | 'other') => {
    const field = type === 'immediate' ? 'immediateRelativesInUS' : 'otherRelativesInUS';
    const current = formData[field] || [];
    handleChange(field, [...current, { fullName: '', relationship: '', status: '' }]);
  };

  const removeRelative = (type: 'immediate' | 'other', index: number) => {
    const field = type === 'immediate' ? 'immediateRelativesInUS' : 'otherRelativesInUS';
    const current = formData[field] || [];
    handleChange(field, current.filter((_, i) => i !== index));
  };

  const updateRelative = (type: 'immediate' | 'other', index: number, field: string, value: string) => {
    const arrayField = type === 'immediate' ? 'immediateRelativesInUS' : 'otherRelativesInUS';
    const current = [...(formData[arrayField] || [])];
    current[index] = { ...current[index], [field]: value };
    handleChange(arrayField, current);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Father Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Father's Information
            <Tooltip text="Enter your father's information exactly as it appears on official documents" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Father's Surnames *</Label>
              <Input
                value={formData.fatherSurnames || ''}
                onChange={(e) => handleChange('fatherSurnames', e.target.value.toUpperCase())}
                placeholder="SMITH"
                className="uppercase"
              />
              {errors.fatherSurnames && <p className="text-sm text-red-600 mt-1">{errors.fatherSurnames}</p>}
            </div>
            <div>
              <Label>Father's Given Names *</Label>
              <Input
                value={formData.fatherGivenNames || ''}
                onChange={(e) => handleChange('fatherGivenNames', e.target.value.toUpperCase())}
                placeholder="JOHN"
                className="uppercase"
              />
              {errors.fatherGivenNames && <p className="text-sm text-red-600 mt-1">{errors.fatherGivenNames}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={formData.fatherDateOfBirth || ''}
                onChange={(e) => handleChange('fatherDateOfBirth', e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <Label>Is your father in the U.S.?</Label>
                <p className="text-sm text-muted-foreground">Currently residing in the United States</p>
              </div>
              <Switch
                checked={formData.isFatherInUS || false}
                onCheckedChange={(checked) => handleChange('isFatherInUS', checked)}
              />
            </div>
          </div>
          {formData.isFatherInUS && (
            <div>
              <Label>Father's U.S. Status</Label>
              <Select
                value={formData.fatherUSStatus || ''}
                onValueChange={(value) => handleChange('fatherUSStatus', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US_CITIZEN">U.S. Citizen</SelectItem>
                  <SelectItem value="LAWFUL_PERMANENT_RESIDENT">Lawful Permanent Resident</SelectItem>
                  <SelectItem value="NONIMMIGRANT">Nonimmigrant</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mother Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mother's Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Mother's Surnames *</Label>
              <Input
                value={formData.motherSurnames || ''}
                onChange={(e) => handleChange('motherSurnames', e.target.value.toUpperCase())}
                placeholder="JOHNSON"
                className="uppercase"
              />
              {errors.motherSurnames && <p className="text-sm text-red-600 mt-1">{errors.motherSurnames}</p>}
            </div>
            <div>
              <Label>Mother's Given Names *</Label>
              <Input
                value={formData.motherGivenNames || ''}
                onChange={(e) => handleChange('motherGivenNames', e.target.value.toUpperCase())}
                placeholder="MARY"
                className="uppercase"
              />
              {errors.motherGivenNames && <p className="text-sm text-red-600 mt-1">{errors.motherGivenNames}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={formData.motherDateOfBirth || ''}
                onChange={(e) => handleChange('motherDateOfBirth', e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <Label>Is your mother in the U.S.?</Label>
                <p className="text-sm text-muted-foreground">Currently residing in the United States</p>
              </div>
              <Switch
                checked={formData.isMotherInUS || false}
                onCheckedChange={(checked) => handleChange('isMotherInUS', checked)}
              />
            </div>
          </div>
          {formData.isMotherInUS && (
            <div>
              <Label>Mother's U.S. Status</Label>
              <Select
                value={formData.motherUSStatus || ''}
                onValueChange={(value) => handleChange('motherUSStatus', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US_CITIZEN">U.S. Citizen</SelectItem>
                  <SelectItem value="LAWFUL_PERMANENT_RESIDENT">Lawful Permanent Resident</SelectItem>
                  <SelectItem value="NONIMMIGRANT">Nonimmigrant</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spouse Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Spouse Information</CardTitle>
            <Switch
              checked={formData.hasSpouse || false}
              onCheckedChange={(checked) => handleChange('hasSpouse', checked)}
            />
          </div>
          <CardDescription>Do you have a spouse?</CardDescription>
        </CardHeader>
        {formData.hasSpouse && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Spouse's Full Name</Label>
                <Input
                  value={formData.spouseFullName || ''}
                  onChange={(e) => handleChange('spouseFullName', e.target.value.toUpperCase())}
                  placeholder="LAST NAME, FIRST NAME"
                  className="uppercase"
                />
              </div>
              <div>
                <Label>Spouse's Date of Birth</Label>
                <Input
                  type="date"
                  value={formData.spouseDateOfBirth || ''}
                  onChange={(e) => handleChange('spouseDateOfBirth', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Spouse's Nationality</Label>
                <Input
                  value={formData.spouseNationality || ''}
                  onChange={(e) => handleChange('spouseNationality', e.target.value)}
                  placeholder="Country of citizenship"
                />
              </div>
              <div>
                <Label>Spouse's City of Birth</Label>
                <Input
                  value={formData.spouseCityOfBirth || ''}
                  onChange={(e) => handleChange('spouseCityOfBirth', e.target.value)}
                  placeholder="City"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Spouse's Country of Birth</Label>
                <Input
                  value={formData.spouseCountryOfBirth || ''}
                  onChange={(e) => handleChange('spouseCountryOfBirth', e.target.value)}
                  placeholder="Country"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label>Same address as you?</Label>
                  <p className="text-sm text-muted-foreground">Spouse lives at your home address</p>
                </div>
                <Switch
                  checked={formData.spouseAddressSameAsApplicant || false}
                  onCheckedChange={(checked) => handleChange('spouseAddressSameAsApplicant', checked)}
                />
              </div>
            </div>
            {!formData.spouseAddressSameAsApplicant && (
              <div>
                <Label>Spouse's Address</Label>
                <Input
                  value={formData.spouseAddress || ''}
                  onChange={(e) => handleChange('spouseAddress', e.target.value)}
                  placeholder="Full address"
                />
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Children */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Children</CardTitle>
            <Switch
              checked={formData.hasChildren || false}
              onCheckedChange={(checked) => handleChange('hasChildren', checked)}
            />
          </div>
          <CardDescription>Do you have any children?</CardDescription>
        </CardHeader>
        {formData.hasChildren && (
          <CardContent className="space-y-4">
            {(formData.children || []).map((child, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Child {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeChild(index)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input
                      value={child.fullName}
                      onChange={(e) => updateChild(index, 'fullName', e.target.value.toUpperCase())}
                      placeholder="LAST NAME, FIRST NAME"
                      className="uppercase"
                    />
                  </div>
                  <div>
                    <Label>Date of Birth</Label>
                    <Input
                      type="date"
                      value={child.dateOfBirth}
                      onChange={(e) => updateChild(index, 'dateOfBirth', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addChild} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Child
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Immediate Relatives in US */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Immediate Relatives in the U.S.</CardTitle>
            <Switch
              checked={formData.hasImmediateRelativesInUS || false}
              onCheckedChange={(checked) => handleChange('hasImmediateRelativesInUS', checked)}
            />
          </div>
          <CardDescription>Do you have any immediate relatives (not including parents) in the United States?</CardDescription>
        </CardHeader>
        {formData.hasImmediateRelativesInUS && (
          <CardContent className="space-y-4">
            {(formData.immediateRelativesInUS || []).map((relative, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Relative {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRelative('immediate', index)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input
                      value={relative.fullName}
                      onChange={(e) => updateRelative('immediate', index, 'fullName', e.target.value)}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <Label>Relationship</Label>
                    <Select
                      value={relative.relationship}
                      onValueChange={(value) => updateRelative('immediate', index, 'relationship', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SPOUSE">Spouse</SelectItem>
                        <SelectItem value="CHILD">Child</SelectItem>
                        <SelectItem value="SIBLING">Sibling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>U.S. Status</Label>
                    <Select
                      value={relative.status}
                      onValueChange={(value) => updateRelative('immediate', index, 'status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US_CITIZEN">U.S. Citizen</SelectItem>
                        <SelectItem value="LPR">Lawful Permanent Resident</SelectItem>
                        <SelectItem value="NONIMMIGRANT">Nonimmigrant</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => addRelative('immediate')} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Relative
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={onPrev}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button type="submit" disabled={isSaving}>
          Save & Continue
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </form>
  );
}

function Tooltip({ text }: { text: string }) {
  return (
    <span className="relative group">
      <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg border">
        {text}
      </span>
    </span>
  );
}
