import { useState } from 'react';
import { ChevronRight, ChevronLeft, Plus, Trash2, Briefcase, GraduationCap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export interface WorkEducationInfo {
  // Current Occupation
  primaryOccupation?: string;
  presentEmployerName?: string;
  presentEmployerAddress?: string;
  presentEmployerCity?: string;
  presentEmployerState?: string;
  presentEmployerPostalCode?: string;
  presentEmployerCountry?: string;
  presentEmployerPhone?: string;
  monthlySalary?: string;
  jobDuties?: string;
  startDate?: string;

  // Previous Employment
  wasPreviouslyEmployed?: boolean;
  previousEmployment?: Array<{
    employerName?: string;
    employerAddress?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
    jobTitle?: string;
    supervisorSurname?: string;
    supervisorGivenName?: string;
    startDate?: string;
    endDate?: string;
    duties?: string;
  }>;

  // Education
  hasAttendedEducation?: boolean;
  education?: Array<{
    institutionName?: string;
    institutionAddress?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    courseOfStudy?: string;
    startDate?: string;
    endDate?: string;
  }>;

  // Additional Information
  belongsToClanOrTribe?: boolean;
  clanOrTribeName?: string;
  languages?: string[];

  // Countries Visited
  hasVisitedCountriesLastFiveYears?: boolean;
  countriesVisited?: string[];

  // Professional Organizations
  belongsToProfessionalOrg?: boolean;
  professionalOrgs?: string[];

  // Specialized Skills
  hasSpecializedSkills?: boolean;
  specializedSkillsDescription?: string;

  // Military Service
  hasServedInMilitary?: boolean;
  militaryService?: {
    country?: string;
    branch?: string;
    rank?: string;
    specialty?: string;
    startDate?: string;
    endDate?: string;
  };
}

interface WorkEducationFormProps {
  data?: WorkEducationInfo;
  onSave: (data: WorkEducationInfo) => Promise<void>;
  onNext: () => void;
  onPrev: () => void;
}

const OCCUPATION_OPTIONS = [
  'BUSINESS', 'STUDENT', 'ENGINEER', 'DOCTOR', 'TEACHER', 'LAWYER',
  'ACCOUNTANT', 'MANAGER', 'RETIRED', 'HOMEMAKER', 'UNEMPLOYED', 'OTHER'
];

export default function WorkEducationForm({ data, onSave, onNext, onPrev }: WorkEducationFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<WorkEducationInfo>>({
    primaryOccupation: data?.primaryOccupation || '',
    presentEmployerName: data?.presentEmployerName || '',
    presentEmployerAddress: data?.presentEmployerAddress || '',
    presentEmployerCity: data?.presentEmployerCity || '',
    presentEmployerState: data?.presentEmployerState || '',
    presentEmployerPostalCode: data?.presentEmployerPostalCode || '',
    presentEmployerCountry: data?.presentEmployerCountry || '',
    presentEmployerPhone: data?.presentEmployerPhone || '',
    monthlySalary: data?.monthlySalary || '',
    jobDuties: data?.jobDuties || '',
    startDate: data?.startDate || '',
    wasPreviouslyEmployed: data?.wasPreviouslyEmployed || false,
    previousEmployment: data?.previousEmployment || [],
    hasAttendedEducation: data?.hasAttendedEducation || false,
    education: data?.education || [],
    belongsToClanOrTribe: data?.belongsToClanOrTribe || false,
    clanOrTribeName: data?.clanOrTribeName || '',
    languages: data?.languages || [''],
    hasVisitedCountriesLastFiveYears: data?.hasVisitedCountriesLastFiveYears || false,
    countriesVisited: data?.countriesVisited || [],
    belongsToProfessionalOrg: data?.belongsToProfessionalOrg || false,
    professionalOrgs: data?.professionalOrgs || [],
    hasSpecializedSkills: data?.hasSpecializedSkills || false,
    specializedSkillsDescription: data?.specializedSkillsDescription || '',
    hasServedInMilitary: data?.hasServedInMilitary || false,
    militaryService: data?.militaryService || undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.primaryOccupation) newErrors.primaryOccupation = 'Occupation is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await onSave(formData as WorkEducationInfo);
      onNext();
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof WorkEducationInfo, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Previous Employment handlers
  const addPreviousEmployment = () => {
    const current = formData.previousEmployment || [];
    handleChange('previousEmployment', [...current, {
      employerName: '', employerAddress: '', city: '', state: '', postalCode: '',
      country: '', phone: '', jobTitle: '', supervisorSurname: '', supervisorGivenName: '',
      startDate: '', endDate: '', duties: ''
    }]);
  };

  const removePreviousEmployment = (index: number) => {
    const current = formData.previousEmployment || [];
    handleChange('previousEmployment', current.filter((_, i) => i !== index));
  };

  const updatePreviousEmployment = (index: number, field: string, value: string) => {
    const current = [...(formData.previousEmployment || [])];
    current[index] = { ...current[index], [field]: value };
    handleChange('previousEmployment', current);
  };

  // Education handlers
  const addEducation = () => {
    const current = formData.education || [];
    handleChange('education', [...current, {
      institutionName: '', institutionAddress: '', city: '', state: '',
      postalCode: '', country: '', courseOfStudy: '', startDate: '', endDate: ''
    }]);
  };

  const removeEducation = (index: number) => {
    const current = formData.education || [];
    handleChange('education', current.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const current = [...(formData.education || [])];
    current[index] = { ...current[index], [field]: value };
    handleChange('education', current);
  };

  // Language handlers
  const addLanguage = () => {
    const current = formData.languages || [];
    handleChange('languages', [...current, '']);
  };

  const updateLanguage = (index: number, value: string) => {
    const current = [...(formData.languages || [])];
    current[index] = value;
    handleChange('languages', current);
  };

  const removeLanguage = (index: number) => {
    const current = formData.languages || [];
    if (current.length > 1) {
      handleChange('languages', current.filter((_, i) => i !== index));
    }
  };

  // Countries visited handlers
  const addCountry = () => {
    const current = formData.countriesVisited || [];
    handleChange('countriesVisited', [...current, '']);
  };

  const updateCountry = (index: number, value: string) => {
    const current = [...(formData.countriesVisited || [])];
    current[index] = value;
    handleChange('countriesVisited', current);
  };

  const removeCountry = (index: number) => {
    const current = formData.countriesVisited || [];
    handleChange('countriesVisited', current.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Current Employment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Present Work/Occupation
          </CardTitle>
          <CardDescription>Enter your current employment information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Primary Occupation *</Label>
              <Select
                value={formData.primaryOccupation || ''}
                onValueChange={(value) => handleChange('primaryOccupation', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select occupation" />
                </SelectTrigger>
                <SelectContent>
                  {OCCUPATION_OPTIONS.map(occ => (
                    <SelectItem key={occ} value={occ}>{occ}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.primaryOccupation && <p className="text-sm text-red-600 mt-1">{errors.primaryOccupation}</p>}
            </div>
            <div>
              <Label>Present Employer or School Name</Label>
              <Input
                value={formData.presentEmployerName || ''}
                onChange={(e) => handleChange('presentEmployerName', e.target.value.toUpperCase())}
                placeholder="Company/School name"
                className="uppercase"
              />
            </div>
          </div>

          <div>
            <Label>Employer Address</Label>
            <Input
              value={formData.presentEmployerAddress || ''}
              onChange={(e) => handleChange('presentEmployerAddress', e.target.value)}
              placeholder="Street address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>City</Label>
              <Input
                value={formData.presentEmployerCity || ''}
                onChange={(e) => handleChange('presentEmployerCity', e.target.value)}
                placeholder="City"
              />
            </div>
            <div>
              <Label>State/Province</Label>
              <Input
                value={formData.presentEmployerState || ''}
                onChange={(e) => handleChange('presentEmployerState', e.target.value)}
                placeholder="State"
              />
            </div>
            <div>
              <Label>Postal Code</Label>
              <Input
                value={formData.presentEmployerPostalCode || ''}
                onChange={(e) => handleChange('presentEmployerPostalCode', e.target.value)}
                placeholder="Postal code"
              />
            </div>
            <div>
              <Label>Country</Label>
              <Input
                value={formData.presentEmployerCountry || ''}
                onChange={(e) => handleChange('presentEmployerCountry', e.target.value)}
                placeholder="Country"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Work Phone Number</Label>
              <Input
                value={formData.presentEmployerPhone || ''}
                onChange={(e) => handleChange('presentEmployerPhone', e.target.value)}
                placeholder="+1 123-456-7890"
              />
            </div>
            <div>
              <Label>Monthly Salary (Local Currency)</Label>
              <Input
                value={formData.monthlySalary || ''}
                onChange={(e) => handleChange('monthlySalary', e.target.value)}
                placeholder="30000000"
              />
            </div>
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => handleChange('startDate', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Briefly Describe Your Duties</Label>
            <Textarea
              value={formData.jobDuties || ''}
              onChange={(e) => handleChange('jobDuties', e.target.value.toUpperCase())}
              placeholder="Describe your job responsibilities..."
              rows={3}
              className="uppercase"
            />
          </div>
        </CardContent>
      </Card>

      {/* Previous Employment */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Previous Employment</CardTitle>
            <Switch
              checked={formData.wasPreviouslyEmployed || false}
              onCheckedChange={(checked) => handleChange('wasPreviouslyEmployed', checked)}
            />
          </div>
          <CardDescription>Were you previously employed?</CardDescription>
        </CardHeader>
        {formData.wasPreviouslyEmployed && (
          <CardContent className="space-y-4">
            {(formData.previousEmployment || []).map((emp, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Previous Employer {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePreviousEmployment(index)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Employer Name</Label>
                    <Input
                      value={emp.employerName}
                      onChange={(e) => updatePreviousEmployment(index, 'employerName', e.target.value.toUpperCase())}
                      className="uppercase"
                    />
                  </div>
                  <div>
                    <Label>Job Title</Label>
                    <Input
                      value={emp.jobTitle}
                      onChange={(e) => updatePreviousEmployment(index, 'jobTitle', e.target.value.toUpperCase())}
                      className="uppercase"
                    />
                  </div>
                </div>
                <div>
                  <Label>Address</Label>
                  <Input
                    value={emp.employerAddress}
                    onChange={(e) => updatePreviousEmployment(index, 'employerAddress', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>City</Label>
                    <Input
                      value={emp.city}
                      onChange={(e) => updatePreviousEmployment(index, 'city', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input
                      value={emp.state}
                      onChange={(e) => updatePreviousEmployment(index, 'state', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Postal Code</Label>
                    <Input
                      value={emp.postalCode}
                      onChange={(e) => updatePreviousEmployment(index, 'postalCode', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Country</Label>
                    <Input
                      value={emp.country}
                      onChange={(e) => updatePreviousEmployment(index, 'country', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Supervisor's Surname</Label>
                    <Input
                      value={emp.supervisorSurname}
                      onChange={(e) => updatePreviousEmployment(index, 'supervisorSurname', e.target.value.toUpperCase())}
                      className="uppercase"
                    />
                  </div>
                  <div>
                    <Label>Supervisor's Given Name</Label>
                    <Input
                      value={emp.supervisorGivenName}
                      onChange={(e) => updatePreviousEmployment(index, 'supervisorGivenName', e.target.value.toUpperCase())}
                      className="uppercase"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Employment Start Date</Label>
                    <Input
                      type="date"
                      value={emp.startDate}
                      onChange={(e) => updatePreviousEmployment(index, 'startDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Employment End Date</Label>
                    <Input
                      type="date"
                      value={emp.endDate}
                      onChange={(e) => updatePreviousEmployment(index, 'endDate', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Briefly Describe Your Duties</Label>
                  <Textarea
                    value={emp.duties}
                    onChange={(e) => updatePreviousEmployment(index, 'duties', e.target.value.toUpperCase())}
                    rows={2}
                    className="uppercase"
                  />
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addPreviousEmployment} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Previous Employment
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Education
            </CardTitle>
            <Switch
              checked={formData.hasAttendedEducation || false}
              onCheckedChange={(checked) => handleChange('hasAttendedEducation', checked)}
            />
          </div>
          <CardDescription>Have you attended any educational institutions at a secondary level or above?</CardDescription>
        </CardHeader>
        {formData.hasAttendedEducation && (
          <CardContent className="space-y-4">
            {(formData.education || []).map((edu, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Institution {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEducation(index)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Institution Name</Label>
                    <Input
                      value={edu.institutionName}
                      onChange={(e) => updateEducation(index, 'institutionName', e.target.value.toUpperCase())}
                      className="uppercase"
                    />
                  </div>
                  <div>
                    <Label>Course of Study</Label>
                    <Input
                      value={edu.courseOfStudy}
                      onChange={(e) => updateEducation(index, 'courseOfStudy', e.target.value.toUpperCase())}
                      className="uppercase"
                    />
                  </div>
                </div>
                <div>
                  <Label>Address</Label>
                  <Input
                    value={edu.institutionAddress}
                    onChange={(e) => updateEducation(index, 'institutionAddress', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>City</Label>
                    <Input
                      value={edu.city}
                      onChange={(e) => updateEducation(index, 'city', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input
                      value={edu.state}
                      onChange={(e) => updateEducation(index, 'state', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Postal Code</Label>
                    <Input
                      value={edu.postalCode}
                      onChange={(e) => updateEducation(index, 'postalCode', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Country</Label>
                    <Input
                      value={edu.country}
                      onChange={(e) => updateEducation(index, 'country', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Date of Attendance From</Label>
                    <Input
                      type="date"
                      value={edu.startDate}
                      onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Date of Attendance To</Label>
                    <Input
                      type="date"
                      value={edu.endDate}
                      onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addEducation} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Educational Institution
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Languages
          </CardTitle>
          <CardDescription>Provide a list of languages you speak</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(formData.languages || ['']).map((lang, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={lang}
                onChange={(e) => updateLanguage(index, e.target.value.toUpperCase())}
                placeholder="Language name"
                className="uppercase"
              />
              {(formData.languages || []).length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLanguage(index)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addLanguage} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Language
          </Button>
        </CardContent>
      </Card>

      {/* Countries Visited */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Countries Visited (Last 5 Years)</CardTitle>
            <Switch
              checked={formData.hasVisitedCountriesLastFiveYears || false}
              onCheckedChange={(checked) => handleChange('hasVisitedCountriesLastFiveYears', checked)}
            />
          </div>
          <CardDescription>Have you traveled to any countries/regions within the last five years?</CardDescription>
        </CardHeader>
        {formData.hasVisitedCountriesLastFiveYears && (
          <CardContent className="space-y-4">
            {(formData.countriesVisited || []).map((country, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={country}
                  onChange={(e) => updateCountry(index, e.target.value.toUpperCase())}
                  placeholder="Country/Region name"
                  className="uppercase"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCountry(index)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addCountry} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Country
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Military Service */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Military Service</CardTitle>
            <Switch
              checked={formData.hasServedInMilitary || false}
              onCheckedChange={(checked) => handleChange('hasServedInMilitary', checked)}
            />
          </div>
          <CardDescription>Have you ever served in the military?</CardDescription>
        </CardHeader>
        {formData.hasServedInMilitary && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Country/Region</Label>
                <Input
                  value={formData.militaryService?.country || ''}
                  onChange={(e) => handleChange('militaryService', { ...formData.militaryService, country: e.target.value })}
                  placeholder="Country"
                />
              </div>
              <div>
                <Label>Branch of Service</Label>
                <Input
                  value={formData.militaryService?.branch || ''}
                  onChange={(e) => handleChange('militaryService', { ...formData.militaryService, branch: e.target.value })}
                  placeholder="Army, Navy, etc."
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Rank/Position</Label>
                <Input
                  value={formData.militaryService?.rank || ''}
                  onChange={(e) => handleChange('militaryService', { ...formData.militaryService, rank: e.target.value })}
                  placeholder="Rank"
                />
              </div>
              <div>
                <Label>Military Specialty</Label>
                <Input
                  value={formData.militaryService?.specialty || ''}
                  onChange={(e) => handleChange('militaryService', { ...formData.militaryService, specialty: e.target.value })}
                  placeholder="Specialty"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Service Start Date</Label>
                <Input
                  type="date"
                  value={formData.militaryService?.startDate || ''}
                  onChange={(e) => handleChange('militaryService', { ...formData.militaryService, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Service End Date</Label>
                <Input
                  type="date"
                  value={formData.militaryService?.endDate || ''}
                  onChange={(e) => handleChange('militaryService', { ...formData.militaryService, endDate: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Specialized Skills */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Specialized Skills</CardTitle>
            <Switch
              checked={formData.hasSpecializedSkills || false}
              onCheckedChange={(checked) => handleChange('hasSpecializedSkills', checked)}
            />
          </div>
          <CardDescription>
            Do you have any specialized skills or training, such as firearms, explosives, nuclear, biological, or chemical experience?
          </CardDescription>
        </CardHeader>
        {formData.hasSpecializedSkills && (
          <CardContent>
            <Textarea
              value={formData.specializedSkillsDescription || ''}
              onChange={(e) => handleChange('specializedSkillsDescription', e.target.value)}
              placeholder="Please describe your specialized skills..."
              rows={3}
            />
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
