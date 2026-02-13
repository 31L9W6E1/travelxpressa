import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";

const HelpCenter = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader
        title="Help Center"
        subtitle="Визийн үйлчилгээ, бүрдүүлэлт, төлөв хяналт, төлбөртэй холбоотой тусламжийн төв."
      />

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Өргөдлийн явц хянах</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                Таны өргөдлийн статус, шат бүрийн шинэчлэл, шаардагдах дараагийн алхам.
              </p>
              <Button asChild variant="outline">
                <Link to="/profile/inbox">Inbox нээх</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Санал хүсэлт</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                Үйлчилгээний чанар, сайжруулах санал, хүсэлтээ илгээх хэсэг.
              </p>
              <Button asChild variant="outline">
                <Link to="/feedback">Feedback руу орох</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Түгээмэл асуулт</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                Визийн бүрдүүлэлттэй холбоотой хамгийн нийтлэг асуулт, хариултууд.
              </p>
              <Button asChild variant="outline">
                <Link to="/q-and-a">Q&A харах</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Flight үйлчилгээ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                Нислэгийн захиалга, itinerary бэлтгэх, аяллын төлөвлөлтийн тусламж.
              </p>
              <Button asChild variant="outline">
                <Link to="/flight">Flight мэдээлэл</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Insurance үйлчилгээ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                Аяллын даатгалын баримт, шаардлага, сонголтын талаар зөвлөгөө.
              </p>
              <Button asChild variant="outline">
                <Link to="/insurance">Insurance мэдээлэл</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Support чат</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                Админ болон дэмжлэгийн багтай шууд харилцах, файл/заавар солилцох чат.
              </p>
              <Button asChild>
                <Link to="/contactsupport">Чат нээх</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default HelpCenter;
