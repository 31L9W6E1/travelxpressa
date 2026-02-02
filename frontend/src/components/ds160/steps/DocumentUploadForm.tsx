import { useState, useCallback } from 'react';
import { ChevronRight, ChevronLeft, Upload, X, FileText, Image, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

export interface DocumentInfo {
  photo?: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: string;
  };
  invitationLetter?: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: string;
  };
  additionalDocuments?: Array<{
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: string;
    documentType: string;
  }>;
}

interface DocumentUploadFormProps {
  data?: DocumentInfo;
  onSave: (data: DocumentInfo) => Promise<void>;
  onNext: () => void;
  onPrev: () => void;
}

interface DropZoneProps {
  title: string;
  description: string;
  accept: string;
  maxSize: number;
  file?: { fileName: string; fileUrl: string; fileSize: number };
  onUpload: (file: File) => Promise<void>;
  onRemove: () => void;
  isUploading: boolean;
  uploadProgress: number;
  requirements?: string[];
  icon: React.ReactNode;
}

function DropZone({
  title,
  description,
  accept,
  maxSize,
  file,
  onUpload,
  onRemove,
  isUploading,
  uploadProgress,
  requirements,
  icon
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.size > maxSize) {
        setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
        return;
      }
      await onUpload(droppedFile);
    }
  }, [maxSize, onUpload]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > maxSize) {
        setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
        return;
      }
      await onUpload(selectedFile);
    }
  }, [maxSize, onUpload]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };

  if (file) {
    return (
      <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium">{file.fileName}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(file.fileSize)}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onRemove} className="text-destructive">
              <X className="w-5 h-5" />
            </Button>
          </div>
          {file.fileUrl && (
            <div className="mt-4">
              {accept.includes('image') ? (
                <img src={file.fileUrl} alt={title} className="max-h-48 rounded-lg object-contain mx-auto" />
              ) : (
                <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                  View uploaded file
                </a>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {requirements && requirements.length > 0 && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Requirements:</strong>
              <ul className="list-disc list-inside mt-1 text-xs space-y-1">
                {requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
            ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          `}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />

          {isUploading ? (
            <div className="space-y-4">
              <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
              <Progress value={uploadProgress} className="w-48 mx-auto" />
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm font-medium mb-1">
                Drag and drop your file here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Maximum file size: {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export default function DocumentUploadForm({ data, onSave, onNext, onPrev }: DocumentUploadFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<DocumentInfo>({
    photo: data?.photo,
    invitationLetter: data?.invitationLetter,
    additionalDocuments: data?.additionalDocuments || [],
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingInvitation, setUploadingInvitation] = useState(false);
  const [uploadingAdditional, setUploadingAdditional] = useState(false);
  const [photoProgress, setPhotoProgress] = useState(0);
  const [invitationProgress, setInvitationProgress] = useState(0);
  const [additionalProgress, setAdditionalProgress] = useState(0);

  // Simulate file upload (in production, this would upload to a server)
  const simulateUpload = async (file: File, onProgress: (progress: number) => void): Promise<string> => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        onProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          // In production, return the actual URL from the server
          const url = URL.createObjectURL(file);
          resolve(url);
        }
      }, 100);
    });
  };

  const handlePhotoUpload = async (file: File) => {
    setUploadingPhoto(true);
    setPhotoProgress(0);
    try {
      const fileUrl = await simulateUpload(file, setPhotoProgress);
      setFormData(prev => ({
        ...prev,
        photo: {
          fileName: file.name,
          fileUrl,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
        }
      }));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleInvitationUpload = async (file: File) => {
    setUploadingInvitation(true);
    setInvitationProgress(0);
    try {
      const fileUrl = await simulateUpload(file, setInvitationProgress);
      setFormData(prev => ({
        ...prev,
        invitationLetter: {
          fileName: file.name,
          fileUrl,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
        }
      }));
    } finally {
      setUploadingInvitation(false);
    }
  };

  const handleAdditionalUpload = async (file: File) => {
    setUploadingAdditional(true);
    setAdditionalProgress(0);
    try {
      const fileUrl = await simulateUpload(file, setAdditionalProgress);
      setFormData(prev => ({
        ...prev,
        additionalDocuments: [
          ...(prev.additionalDocuments || []),
          {
            fileName: file.name,
            fileUrl,
            fileSize: file.size,
            uploadedAt: new Date().toISOString(),
            documentType: 'other',
          }
        ]
      }));
    } finally {
      setUploadingAdditional(false);
    }
  };

  const removePhoto = () => {
    if (formData.photo?.fileUrl) {
      URL.revokeObjectURL(formData.photo.fileUrl);
    }
    setFormData(prev => ({ ...prev, photo: undefined }));
  };

  const removeInvitation = () => {
    if (formData.invitationLetter?.fileUrl) {
      URL.revokeObjectURL(formData.invitationLetter.fileUrl);
    }
    setFormData(prev => ({ ...prev, invitationLetter: undefined }));
  };

  const removeAdditionalDocument = (index: number) => {
    const doc = formData.additionalDocuments?.[index];
    if (doc?.fileUrl) {
      URL.revokeObjectURL(doc.fileUrl);
    }
    setFormData(prev => ({
      ...prev,
      additionalDocuments: prev.additionalDocuments?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      onNext();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Upload your required documents below. All documents must be clear, legible, and meet the specified requirements.
          Your photo must meet U.S. visa photo standards.
        </AlertDescription>
      </Alert>

      {/* Photo Upload */}
      <DropZone
        title="Passport Photo"
        description="Upload a recent passport-style photo for your visa application"
        accept="image/jpeg,image/png"
        maxSize={5 * 1024 * 1024}
        file={formData.photo}
        onUpload={handlePhotoUpload}
        onRemove={removePhoto}
        isUploading={uploadingPhoto}
        uploadProgress={photoProgress}
        icon={<Image className="w-5 h-5" />}
        requirements={[
          'Recent photo taken within the last 6 months',
          'Color photo with white or off-white background',
          'Size: 2x2 inches (51x51 mm)',
          'Head must be centered and take up 50-69% of the frame',
          'Neutral facial expression with both eyes open',
          'No glasses, hats, or head coverings (unless for religious purposes)',
          'Format: JPEG or PNG, max 5MB'
        ]}
      />

      {/* Invitation Letter Upload */}
      <DropZone
        title="Invitation Letter (if applicable)"
        description="Upload an invitation letter from your host or sponsoring organization in the U.S."
        accept=".pdf,.doc,.docx,image/jpeg,image/png"
        maxSize={10 * 1024 * 1024}
        file={formData.invitationLetter}
        onUpload={handleInvitationUpload}
        onRemove={removeInvitation}
        isUploading={uploadingInvitation}
        uploadProgress={invitationProgress}
        icon={<FileText className="w-5 h-5" />}
        requirements={[
          'Letter from U.S. host or sponsoring organization',
          'Should include: purpose of visit, dates, relationship to applicant',
          'Host\'s contact information and U.S. address',
          'Format: PDF, DOC, DOCX, or image, max 10MB'
        ]}
      />

      {/* Additional Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Additional Supporting Documents
          </CardTitle>
          <CardDescription>
            Upload any additional documents that support your visa application (bank statements, employment letters, travel itinerary, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Uploaded documents list */}
          {(formData.additionalDocuments || []).length > 0 && (
            <div className="space-y-2">
              {formData.additionalDocuments!.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{doc.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {(doc.fileSize / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAdditionalDocument(index)}
                    className="text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Upload area for additional documents */}
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
              ${uploadingAdditional ? 'pointer-events-none opacity-50' : 'hover:border-primary/50 cursor-pointer'}
              border-muted-foreground/25
            `}
          >
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && file.size <= 10 * 1024 * 1024) {
                  handleAdditionalUpload(file);
                }
                e.target.value = '';
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploadingAdditional}
            />

            {uploadingAdditional ? (
              <div className="space-y-2">
                <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
                <Progress value={additionalProgress} className="w-32 mx-auto" />
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Click or drag to add more documents</p>
                <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, or images up to 10MB each</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Document Checklist</CardTitle>
          <CardDescription>Recommended documents for your visa application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Passport Photo', uploaded: !!formData.photo },
              { name: 'Invitation Letter', uploaded: !!formData.invitationLetter },
              { name: 'Bank Statements', uploaded: formData.additionalDocuments?.some(d => d.fileName.toLowerCase().includes('bank')) },
              { name: 'Employment Letter', uploaded: formData.additionalDocuments?.some(d => d.fileName.toLowerCase().includes('employ')) },
              { name: 'Travel Itinerary', uploaded: formData.additionalDocuments?.some(d => d.fileName.toLowerCase().includes('travel') || d.fileName.toLowerCase().includes('itinerary')) },
              { name: 'Hotel Reservations', uploaded: formData.additionalDocuments?.some(d => d.fileName.toLowerCase().includes('hotel') || d.fileName.toLowerCase().includes('reservation')) },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                {item.uploaded ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 border-2 border-muted-foreground/30 rounded-full" />
                )}
                <span className={item.uploaded ? 'text-foreground' : 'text-muted-foreground'}>
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={onPrev}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Save & Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
