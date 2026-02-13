import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { FileText, Paperclip, Send, Sparkles, Upload, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createInquiry } from "@/api/inquiries";
import { getFullImageUrl, uploadApplicationFile } from "@/api/upload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/PageHeader";

const fileTypePricing: Record<string, number> = {
  certificate: 25000,
  visa: 30000,
  academic: 35000,
  legal: 40000,
  other: 30000,
};

const toMnt = (value: number) =>
  new Intl.NumberFormat("mn-MN").format(Math.round(value)) + "₮";

const MAX_TRANSLATION_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB (server limit)

const translationUploadMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const translationUploadExtensions = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".pdf",
  ".doc",
  ".docx",
]);

const getFileExtension = (filename: string): string => {
  const idx = filename.lastIndexOf(".");
  return idx >= 0 ? filename.slice(idx).toLowerCase() : "";
};

const isAllowedTranslationUpload = (file: File): boolean => {
  if (file.type && translationUploadMimeTypes.has(file.type)) return true;

  // Some browsers omit `file.type` for certain documents. Fall back to extension.
  const ext = getFileExtension(file.name);
  return !!ext && translationUploadExtensions.has(ext);
};

const isValidPhone = (phone: string): { ok: boolean; message?: string } => {
  const value = phone.trim();
  if (!value) return { ok: false, message: "Phone is required" };
  if (!/^[\d\s\-\+\(\)]+$/.test(value)) {
    return { ok: false, message: "Invalid phone number format" };
  }
  const digits = value.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) {
    return { ok: false, message: "Phone number must be 8-15 digits" };
  }
  return { ok: true };
};

const TranslationService = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    sourceLanguage: "Mongolian",
    targetLanguage: "English",
    fileType: "visa",
    pages: 1,
    urgency: "standard",
    fileLinks: "",
    notes: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const price = useMemo(() => {
    const perPage = fileTypePricing[form.fileType] || fileTypePricing.other;
    const subtotal = perPage * Math.max(1, Number(form.pages || 1));
    const total = form.urgency === "express" ? subtotal * 1.15 : subtotal;
    return { perPage, subtotal, total };
  }, [form.fileType, form.pages, form.urgency]);

  const addSelectedFiles = (files: FileList | null) => {
    if (!files?.length) return;

    const rejectedTypes: string[] = [];
    const rejectedSizes: string[] = [];

    setSelectedFiles((prev) => {
      const next = [...prev];
      for (const file of Array.from(files)) {
        if (file.size > MAX_TRANSLATION_UPLOAD_BYTES) {
          rejectedSizes.push(file.name);
          continue;
        }
        if (!isAllowedTranslationUpload(file)) {
          rejectedTypes.push(file.name);
          continue;
        }

        const exists = next.some(
          (existing) =>
            existing.name === file.name &&
            existing.size === file.size &&
            existing.lastModified === file.lastModified,
        );
        if (!exists) next.push(file);
      }
      return next;
    });

    if (rejectedSizes.length) {
      toast.error(
        t("translationService.validation.fileTooLarge", {
          defaultValue: "Some files are too large (max 10MB).",
        }),
        {
          description: rejectedSizes.slice(0, 5).join(", "),
        }
      );
    }

    if (rejectedTypes.length) {
      toast.error(
        t("translationService.validation.fileTypeUnsupported", {
          defaultValue: "Some files have an unsupported type.",
        }),
        {
          description: rejectedTypes.slice(0, 5).join(", "),
        }
      );
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const contactName = (user?.name || form.name).trim();
    const contactEmail = (user?.email || form.email).trim();

    if (!contactName || !contactEmail || !form.phone.trim()) {
      toast.error(
        t("translationService.validation.required", {
          defaultValue: "Name, email, and phone are required.",
        }),
      );
      return;
    }

    const phoneCheck = isValidPhone(form.phone);
    if (!phoneCheck.ok) {
      toast.error(
        t("translationService.validation.phoneInvalid", {
          defaultValue: phoneCheck.message || "Invalid phone number",
        }),
      );
      return;
    }

    setSubmitting(true);
    try {
      const uploadedFiles: Array<{
        name: string;
        size: number;
        url: string;
      }> = [];

      if (selectedFiles.length > 0) {
        if (!user) {
          toast.error(
            t("translationService.validation.loginToUpload", {
              defaultValue: "Please sign in to upload files (or use a cloud link).",
            })
          );
          return;
        }

        for (const file of selectedFiles) {
          if (file.size > MAX_TRANSLATION_UPLOAD_BYTES) {
            throw new Error(`File too large (max 10MB): ${file.name}`);
          }
          if (!isAllowedTranslationUpload(file)) {
            throw new Error(`Unsupported file type: ${file.name}`);
          }

          const uploadResult = await uploadApplicationFile(file);
          const relativeUrl = uploadResult?.data?.url || "";
          uploadedFiles.push({
            name: file.name,
            size: file.size,
            url: relativeUrl ? getFullImageUrl(relativeUrl) : "",
          });
        }
      }

      const message = [
        "Translation request",
        `Source language: ${form.sourceLanguage}`,
        `Target language: ${form.targetLanguage}`,
        `File type: ${form.fileType}`,
        `Pages: ${Math.max(1, Number(form.pages || 1))}`,
        `Speed: ${form.urgency}`,
        `Estimated fee: ${toMnt(price.total)}`,
        `Uploaded files:\n${
          uploadedFiles.length
            ? uploadedFiles
                .map((file) => `- ${file.name} (${formatFileSize(file.size)}): ${file.url}`)
                .join("\n")
            : "-"
        }`,
        `File links: ${form.fileLinks || "-"}`,
        `Notes: ${form.notes || "-"}`,
      ].join("\n");

      await createInquiry({
        name: contactName,
        email: contactEmail,
        phone: form.phone.trim(),
        serviceType: "TRANSLATION_SERVICE",
        message,
      });

      toast.success(
        t("translationService.submit.success", {
          defaultValue: "Translation request submitted. We will review and contact you.",
        }),
      );
      setForm((prev) => ({
        ...prev,
        phone: "",
        fileLinks: "",
        notes: "",
        pages: 1,
        urgency: "standard",
      }));
      setSelectedFiles([]);
    } catch (error: any) {
      const fieldErrors = Array.isArray(error?.errors) ? error.errors : null;
      if (fieldErrors?.length) {
        toast.error(
          t("translationService.validation.genericFailed", {
            defaultValue: "Validation failed",
          }),
          {
            description: fieldErrors.map((err: any) => err?.message).filter(Boolean).join(", "),
          },
        );
      } else {
        toast.error(error?.message || "Failed to submit translation request");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader
        title={t("translationService.title", {
          defaultValue: "Document Translation Service",
        })}
        subtitle={t("translationService.subtitle", {
          defaultValue:
            "Submit your translation request for visa, legal, and academic documents. Pricing is transparent per page, and requests are linked to your account for admin review and tracking.",
        })}
      />

      <section className="py-10 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                {t("translationService.form.title", { defaultValue: "Request Details" })}
              </CardTitle>
              <CardDescription>
                {t("translationService.form.description", {
                  defaultValue:
                    "Provide file details and upload your files. You can also include cloud links if needed.",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={onSubmit}>
                {user && (
                  <div className="rounded-lg border border-dashed border-border px-4 py-3 bg-secondary/40">
                    <p className="text-sm font-medium text-foreground">
                      {t("translationService.form.accountLinked", {
                        defaultValue: "Request will be submitted using your signed-in account.",
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {user.name} • {user.email}
                    </p>
                  </div>
                )}

                {!user && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t("common.name", { defaultValue: "Name" })}</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("common.email", { defaultValue: "Email" })}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("common.phone", { defaultValue: "Phone" })}</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pages">{t("translationService.form.pages", { defaultValue: "Page Count" })}</Label>
                    <Input
                      id="pages"
                      type="number"
                      min={1}
                      value={form.pages}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          pages: Number(e.target.value || 1),
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("translationService.form.sourceLanguage", { defaultValue: "Source Language" })}</Label>
                    <Input
                      value={form.sourceLanguage}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, sourceLanguage: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("translationService.form.targetLanguage", { defaultValue: "Target Language" })}</Label>
                    <Input
                      value={form.targetLanguage}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, targetLanguage: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("translationService.form.fileType", { defaultValue: "File Type" })}</Label>
                    <Select
                      value={form.fileType}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, fileType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="certificate">
                          {t("translationService.fileTypes.certificate", { defaultValue: "Certificate / Civil Document" })}
                        </SelectItem>
                        <SelectItem value="visa">
                          {t("translationService.fileTypes.visa", { defaultValue: "Visa / Embassy Document" })}
                        </SelectItem>
                        <SelectItem value="academic">
                          {t("translationService.fileTypes.academic", { defaultValue: "Academic / Education" })}
                        </SelectItem>
                        <SelectItem value="legal">
                          {t("translationService.fileTypes.legal", { defaultValue: "Legal / Contract" })}
                        </SelectItem>
                        <SelectItem value="other">
                          {t("translationService.fileTypes.other", { defaultValue: "Other" })}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("translationService.form.speed", { defaultValue: "Service Speed" })}</Label>
                    <Select
                      value={form.urgency}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, urgency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">
                          {t("translationService.speed.standard", { defaultValue: "Standard" })}
                        </SelectItem>
                        <SelectItem value="express">
                          {t("translationService.speed.express", { defaultValue: "Express (+15%)" })}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>{t("translationService.form.files", { defaultValue: "Upload Files" })}</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                    className="hidden"
                    onChange={(e) => addSelectedFiles(e.target.files)}
                  />
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    onDragEnter={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setIsDraggingFiles(true);
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setIsDraggingFiles(true);
                    }}
                    onDragLeave={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setIsDraggingFiles(false);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setIsDraggingFiles(false);
                      addSelectedFiles(event.dataTransfer.files);
                    }}
                    className={`rounded-lg border border-dashed px-4 py-6 text-center cursor-pointer transition-colors ${
                      isDraggingFiles
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/60 hover:bg-secondary/40"
                    }`}
                  >
                    <Upload className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">
                      {t("translationService.form.dragDrop", {
                        defaultValue: "Drag and drop files here, or click to select",
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("translationService.form.dragDropHint", {
                        defaultValue: "Accepted: PDF, DOC, DOCX, JPG, PNG",
                      })}
                    </p>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={`${file.name}-${file.lastModified}-${index}`}
                          className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2"
                        >
                          <div className="min-w-0 flex items-center gap-2">
                            <Paperclip className="w-4 h-4 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm text-foreground truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSelectedFile(index)}
                            aria-label={t("common.remove", { defaultValue: "Remove file" })}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fileLinks">
                    {t("translationService.form.fileLinks", { defaultValue: "Cloud Link(s) (Optional)" })}
                  </Label>
                  <Input
                    id="fileLinks"
                    placeholder="Google Drive / OneDrive / Dropbox URL"
                    value={form.fileLinks}
                    onChange={(e) => setForm((prev) => ({ ...prev, fileLinks: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">{t("common.notes", { defaultValue: "Notes" })}</Label>
                  <Textarea
                    id="notes"
                    rows={5}
                    placeholder={t("translationService.form.notesPlaceholder", {
                      defaultValue:
                        "Add special terms, name spellings, deadline, or preferred formatting instructions.",
                    })}
                    value={form.notes}
                    onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                  />
                </div>

                <Button type="submit" disabled={submitting} className="w-full md:w-auto">
                  <Send className="w-4 h-4 mr-2" />
                  {submitting
                    ? t("common.submitting", { defaultValue: "Submitting..." })
                    : t("translationService.form.submit", { defaultValue: "Submit Translation Request" })}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5" />
                  {t("translationService.pricing.title", { defaultValue: "Pricing Estimate" })}
                </CardTitle>
                <CardDescription>
                  {t("translationService.pricing.description", {
                    defaultValue: "1 page = 25,000₮ to 40,000₮ depending on file type.",
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {t("translationService.pricing.perPage", { defaultValue: "Rate per page" })}
                  </span>
                  <span className="font-semibold">{toMnt(price.perPage)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {t("translationService.pricing.pages", { defaultValue: "Pages" })}
                  </span>
                  <span className="font-semibold">{Math.max(1, Number(form.pages || 1))}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {t("translationService.pricing.subtotal", { defaultValue: "Subtotal" })}
                  </span>
                  <span className="font-semibold">{toMnt(price.subtotal)}</span>
                </div>
                {form.urgency === "express" && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t("translationService.pricing.express", { defaultValue: "Express uplift (+15%)" })}
                    </span>
                    <span className="font-semibold">
                      {toMnt(Math.max(0, price.total - price.subtotal))}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-border flex items-center justify-between text-base">
                  <span className="font-medium">
                    {t("translationService.pricing.total", { defaultValue: "Estimated Total" })}
                  </span>
                  <span className="font-bold">{toMnt(price.total)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5" />
                  {t("translationService.workflow.title", { defaultValue: "Workflow" })}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  {t("translationService.workflow.step1", {
                    defaultValue: "1) Submit request with file type, pages, and language pair.",
                  })}
                </p>
                <p>
                  {t("translationService.workflow.step2", {
                    defaultValue: "2) Admin reviews request and confirms final quote and turnaround.",
                  })}
                </p>
                <p>
                  {t("translationService.workflow.step3", {
                    defaultValue: "3) Status and updates are tracked in your inbox and support thread.",
                  })}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </section>
    </div>
  );
};

export default TranslationService;
