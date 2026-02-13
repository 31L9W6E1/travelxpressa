import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";

const Insurance = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader
        title="Insurance Service"
        subtitle="Виз мэдүүлэгт шаардлагатай аяллын даатгалын чиглэл, багц, баримтын зөвлөмж."
      />

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-6 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Даатгалын үндсэн шаардлага</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2">
              <p>• Аяллын бүх хугацааг бүрэн хамарсан байх</p>
              <p>• Очих орны визийн шаардлагад нийцсэн нөхөн төлбөрийн дүн</p>
              <p>• Эмнэлгийн яаралтай тусламжийн нөхцөл тодорхой туссан байх</p>
              <p>• Нэр, паспортын мэдээлэл зөрүүгүй байх</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Манай дэмжлэг</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2">
              <p>• Визийн төрлөөс хамаарсан зөв багц сонголт</p>
              <p>• Даатгалын баримтын бүрдүүлэлт, шалгалт</p>
              <p>• Өргөдлийн бусад баримттай нийцүүлсэн зөвлөгөө</p>
              <p>• Элчин/визийн төвд өгөхөд бэлэн форматаар зөвлөмж</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Insurance;
