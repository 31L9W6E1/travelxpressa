import React, { useState, useCallback, useRef } from 'react';
import { uploadImage, normalizeImageUrl } from '@/api/upload';
import { Upload, X, Link as LinkIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = 'Featured Image',
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState(value || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleFileUpload(files[0]);
    }
  }, [disabled]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please upload JPEG, PNG, GIF, or WebP.');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File too large. Maximum size is 10MB.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await uploadImage(file);
      // Store the relative URL (will be converted to full URL when displaying)
      onChange(result.data.url);
      setUrlInput(result.data.url);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      // For external URLs, normalize them; for local URLs, use as-is
      const url = urlInput.trim();
      if (url.startsWith('/uploads') || url.startsWith('http')) {
        onChange(url);
      } else {
        const normalizedUrl = normalizeImageUrl(url);
        onChange(normalizedUrl);
        setUrlInput(normalizedUrl);
      }
    }
  };

  const handleClearImage = () => {
    onChange('');
    setUrlInput('');
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get display URL (convert to full URL for preview)
  const displayUrl = value ? normalizeImageUrl(value) : '';

  return (
    <div className="grid gap-2">
      <Label>{label}</Label>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="url" className="gap-2">
            <LinkIcon className="h-4 w-4" />
            URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-3">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
              isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50",
              (disabled || isUploading) && "cursor-not-allowed opacity-50"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              disabled={disabled || isUploading}
            />

            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">
                  {isDragging ? 'Drop image here' : 'Drag & drop an image, or click to select'}
                </p>
                <p className="text-xs text-muted-foreground">
                  JPEG, PNG, GIF, WebP up to 10MB
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="url" className="mt-3">
          <div className="flex gap-2">
            <Input
              placeholder="https://images.unsplash.com/photo-..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={disabled}
              className="flex-1"
            />
            <Button onClick={handleUrlSubmit} disabled={disabled || !urlInput.trim()}>
              Apply
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Paste an image URL. Unsplash page URLs are automatically converted to direct image links.
          </p>
        </TabsContent>
      </Tabs>

      {/* Error Message */}
      {uploadError && (
        <p className="text-sm text-destructive">
          {uploadError}
        </p>
      )}

      {/* Image Preview */}
      {displayUrl && (
        <div className="mt-3">
          <p className="text-xs text-muted-foreground mb-1">Preview:</p>
          <div className="relative rounded-lg overflow-hidden border">
            <img
              src={displayUrl}
              alt="Preview"
              className="w-full max-h-48 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                setUploadError('Failed to load image preview. The URL may be invalid.');
              }}
              onLoad={(e) => {
                (e.target as HTMLImageElement).style.display = 'block';
                setUploadError(null);
              }}
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearImage}
              disabled={disabled}
              className="absolute top-2 right-2"
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {value}
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
