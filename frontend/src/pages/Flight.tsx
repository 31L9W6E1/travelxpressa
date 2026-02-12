import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Flight = () => {
  return (
    <div className="min-h-screen bg-background text-foreground pt-20">
      <section className="py-10 border-b border-dashed border-border/60">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold">Flight Service</h1>
          <p className="text-muted-foreground mt-2">
            Визийн кейст шаардлагатай нислэгийн itinerary болон аяллын маршрутын зөвлөгөө.
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-5xl mx-auto px-6 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Бид юуг хийдэг вэ</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2">
              <p>• Нислэгийн itinerary (визийн шаардлагад нийцсэн)</p>
              <p>• Аяллын чиглэл ба хугацааны логик төлөвлөлт</p>
              <p>• Буцах нислэгийн төлөвлөгөөний зөв бүтэц</p>
              <p>• Мэдүүлгийн баримттай уялдуулсан маршрут</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Анхаарах зүйл</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2">
              <p>• Элчин/визийн төв бүрийн шалгуур өөр байдаг</p>
              <p>• Худал эсвэл зөрүүтэй маршрут нь эрсдэл үүсгэнэ</p>
              <p>• Аяллын хугацаа, зардал, байрлал уялдсан байх ёстой</p>
              <p>• Final ticket purchase хийхээс өмнө кейсээ баталгаажуул</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Flight;
