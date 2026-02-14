import { CheckCircle2, FileCheck2, HeartPulse, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import SiteFooter from "@/components/SiteFooter";
import { useTranslation } from "react-i18next";

const Insurance = () => {
  const { t } = useTranslation();

  const basicItems = [
    t("insurancePage.basics.items.coverage", { defaultValue: "Аяллын бүх хугацааг бүрэн хамарсан байх" }),
    t("insurancePage.basics.items.amount", { defaultValue: "Очих орны визийн шаардлагад нийцсэн нөхөн төлбөрийн дүн" }),
    t("insurancePage.basics.items.emergency", { defaultValue: "Эмнэлгийн яаралтай тусламжийн нөхцөл тодорхой туссан байх" }),
    t("insurancePage.basics.items.match", { defaultValue: "Нэр, паспортын мэдээлэл зөрүүгүй байх" }),
  ];

  const supportItems = [
    t("insurancePage.support.items.packages", { defaultValue: "Визийн төрлөөс хамаарсан зөв багц сонголт" }),
    t("insurancePage.support.items.review", { defaultValue: "Даатгалын баримтын бүрдүүлэлт, шалгалт" }),
    t("insurancePage.support.items.align", { defaultValue: "Өргөдлийн бусад баримттай нийцүүлсэн зөвлөгөө" }),
    t("insurancePage.support.items.ready", { defaultValue: "Элчин/визийн төвд өгөхөд бэлэн форматаар зөвлөмж" }),
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader
        title={t("nav.insurance", { defaultValue: "Insurance" })}
        subtitle={t("insurancePage.subtitle", {
          defaultValue:
            "Виз мэдүүлэгт шаардлагатай аяллын даатгалын чиглэл, багц, баримтын зөвлөмж.",
        })}
      />

      <section className="py-8 md:py-12 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="rounded-xl border border-border bg-card/70 p-3 md:p-4">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary mb-2">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <p className="text-xs md:text-sm font-medium text-foreground">
                {t("insurancePage.basics.items.coverage", { defaultValue: "Бүрэн хугацааны хамгаалалт" })}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card/70 p-3 md:p-4">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary mb-2">
                <HeartPulse className="h-4 w-4" />
              </div>
              <p className="text-xs md:text-sm font-medium text-foreground">
                {t("insurancePage.basics.items.emergency", { defaultValue: "Яаралтай тусламжийн нөхцөл тодорхой" })}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card/70 p-3 md:p-4">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary mb-2">
                <FileCheck2 className="h-4 w-4" />
              </div>
              <p className="text-xs md:text-sm font-medium text-foreground">
                {t("insurancePage.support.items.review", { defaultValue: "Баримтын шалгалт ба нийцэл" })}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card/70 p-3 md:p-4">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary mb-2">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <p className="text-xs md:text-sm font-medium text-foreground">
                {t("insurancePage.support.items.ready", { defaultValue: "Элчинд өгөхөд бэлэн формат" })}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:gap-6 md:grid-cols-2">
            <Card className="rounded-2xl border-border/80">
              <CardHeader className="pb-2">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary mb-2">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg md:text-xl">
                  {t("insurancePage.basics.title", { defaultValue: "Даатгалын үндсэн шаардлага" })}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <ul className="space-y-3 text-sm md:text-base">
                  {basicItems.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/80">
              <CardHeader className="pb-2">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary mb-2">
                  <FileCheck2 className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg md:text-xl">
                  {t("insurancePage.support.title", { defaultValue: "Манай дэмжлэг" })}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <ul className="space-y-3 text-sm md:text-base">
                  {supportItems.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <SiteFooter
        links={[
          { to: "/about", label: t("footer.links.about", { defaultValue: "About Us" }) },
          { to: "/learn-more", label: t("nav.learnMore", { defaultValue: "Learn More" }) },
          { to: "/privacy", label: t("footer.links.privacy", { defaultValue: "Privacy Policy" }) },
          { to: "/terms", label: t("footer.links.terms", { defaultValue: "Terms of Service" }) },
        ]}
      />
    </div>
  );
};

export default Insurance;
