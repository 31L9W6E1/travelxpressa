import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import { useTranslation } from "react-i18next";

const Insurance = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader
        title={t("nav.insurance", { defaultValue: "Insurance" })}
        subtitle={t("insurancePage.subtitle", {
          defaultValue:
            "Виз мэдүүлэгт шаардлагатай аяллын даатгалын чиглэл, багц, баримтын зөвлөмж.",
        })}
      />

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("insurancePage.basics.title", { defaultValue: "Даатгалын үндсэн шаардлага" })}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <ul className="space-y-2 text-sm list-disc pl-5">
                <li>{t("insurancePage.basics.items.coverage", { defaultValue: "Аяллын бүх хугацааг бүрэн хамарсан байх" })}</li>
                <li>{t("insurancePage.basics.items.amount", { defaultValue: "Очих орны визийн шаардлагад нийцсэн нөхөн төлбөрийн дүн" })}</li>
                <li>{t("insurancePage.basics.items.emergency", { defaultValue: "Эмнэлгийн яаралтай тусламжийн нөхцөл тодорхой туссан байх" })}</li>
                <li>{t("insurancePage.basics.items.match", { defaultValue: "Нэр, паспортын мэдээлэл зөрүүгүй байх" })}</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("insurancePage.support.title", { defaultValue: "Манай дэмжлэг" })}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <ul className="space-y-2 text-sm list-disc pl-5">
                <li>{t("insurancePage.support.items.packages", { defaultValue: "Визийн төрлөөс хамаарсан зөв багц сонголт" })}</li>
                <li>{t("insurancePage.support.items.review", { defaultValue: "Даатгалын баримтын бүрдүүлэлт, шалгалт" })}</li>
                <li>{t("insurancePage.support.items.align", { defaultValue: "Өргөдлийн бусад баримттай нийцүүлсэн зөвлөгөө" })}</li>
                <li>{t("insurancePage.support.items.ready", { defaultValue: "Элчин/визийн төвд өгөхөд бэлэн форматаар зөвлөмж" })}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Insurance;
