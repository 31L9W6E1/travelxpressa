import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { FileText, Languages, Send, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createInquiry } from "@/api/inquiries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const fileTypePricing: Record<string, number> = {
  certificate: 25000,
  visa: 30000,
  academic: 35000,
  legal: 40000,
  other: 30000,
};

const toMnt = (value: number) =>
  new Intl.NumberFormat("mn-MN").format(Math.round(value)) + "₮";

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
  const [submitting, setSubmitting] = useState(false);

  const price = useMemo(() => {
    const perPage = fileTypePricing[form.fileType] || fileTypePricing.other;
    const subtotal = perPage * Math.max(1, Number(form.pages || 1));
    const total = form.urgency === "express" ? subtotal * 1.15 : subtotal;
    return { perPage, subtotal, total };
  }, [form.fileType, form.pages, form.urgency]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error(
        t("translationService.validation.required", {
          defaultValue: "Name, email, and phone are required.",
        }),
      );
      return;
    }

    setSubmitting(true);
    try {
      const message = [
        "Translation request",
        `Source language: ${form.sourceLanguage}`,
        `Target language: ${form.targetLanguage}`,
        `File type: ${form.fileType}`,
        `Pages: ${Math.max(1, Number(form.pages || 1))}`,
        `Speed: ${form.urgency}`,
        `Estimated fee: ${toMnt(price.total)}`,
        `File links: ${form.fileLinks || "-"}`,
        `Notes: ${form.notes || "-"}`,
      ].join("\n");

      await createInquiry({
        name: form.name.trim(),
        email: form.email.trim(),
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
    } catch (error: any) {
      toast.error(error?.message || "Failed to submit translation request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 text-foreground">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <div className="space-y-3">
          <Badge variant="secondary" className="inline-flex items-center gap-2">
            <Languages className="w-4 h-4" />
            {t("translationService.badge", { defaultValue: "Professional Translation" })}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {t("translationService.title", {
              defaultValue: "Document Translation Service",
            })}
          </h1>
          <p className="text-muted-foreground max-w-3xl">
            {t("translationService.subtitle", {
              defaultValue:
                "Submit your translation request for visa, legal, and academic documents. Pricing is transparent per page, and requests are linked to your account for admin review and tracking.",
            })}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                {t("translationService.form.title", { defaultValue: "Request Details" })}
              </CardTitle>
              <CardDescription>
                {t("translationService.form.description", {
                  defaultValue:
                    "Provide file details and links. You can send final files later by support chat or email.",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={onSubmit}>
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

                <div className="space-y-2">
                  <Label htmlFor="fileLinks">
                    {t("translationService.form.fileLinks", { defaultValue: "File Link(s)" })}
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
    </div>
  );
};

export default TranslationService;
