import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const items = [
  {
    q: "Визийн зөвлөгөө авахын тулд заавал оффис дээр очих уу?",
    a: "Үгүй. Та онлайнаар мэдээллээ өгч, мэргэжлийн зөвлөгөөг бүрэн авах боломжтой. Шаардлагатай тохиолдолд биечлэн уулзалт хийнэ.",
  },
  {
    q: "Баримт бичиг дутуу бол яах вэ?",
    a: "Манай баг таны баримтыг нягталж, дутуу жагсаалтыг үе шат бүрээр гаргаж өгнө. Бүрдүүлэлт дуусах хүртэл хяналттай ажиллана.",
  },
  {
    q: "Үйлчилгээний хугацаа хэд хоног вэ?",
    a: "Кейсийн төрөл болон улсын шаардлагаас хамаарч ялгаатай. Ихэнх тохиолдолд 1–2 хоногт өргөдөл бэлэн болгох боломжтой.",
  },
  {
    q: "Express үйлчилгээ гэж юу вэ?",
    a: "Яаралтай тохиолдолд баримтын шалгалт, зөвлөгөө, бүрдүүлэлтийг түргэвчилж гүйцэтгэнэ. Express үйлчилгээний нэмэгдэл төлбөр үйлчилнэ.",
  },
  {
    q: "Мэдүүлгээ хаанаас хянах вэ?",
    a: "Нэвтэрсэн хэрэглэгч өөрийн профайл дахь Inbox/Tracking хэсгээс явцаа бодит цагт хянана.",
  },
];

const QAndA = () => {
  return (
    <div className="min-h-screen bg-background text-foreground pt-20">
      <section className="py-10 border-b border-dashed border-border/60">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold">Q&A</h1>
          <p className="text-muted-foreground mt-2">
            Хамгийн их асуудаг асуултууд болон товч, ойлгомжтой хариултууд.
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-5xl mx-auto px-6 grid gap-4">
          {items.map((item) => (
            <Card key={item.q}>
              <CardHeader>
                <CardTitle className="text-lg">{item.q}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{item.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default QAndA;
