import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

const QAndA = () => {
  const { settings } = useSiteSettings();
  const items = settings.qAndAItems || [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader
        title="Q&A"
        subtitle="Хамгийн их асуудаг асуултууд болон товч, ойлгомжтой хариултууд."
      />

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {items.length === 0 ? (
            <Card className="xl:col-span-4">
              <CardContent className="py-8 text-sm text-muted-foreground">
                Одоогоор асуулт, хариултын мэдээлэл алга.
              </CardContent>
            </Card>
          ) : (
            items.map((item) => (
              <Card key={`${item.q}-${item.a.slice(0, 24)}`}>
                <CardHeader>
                  <CardTitle className="text-lg">{item.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{item.a}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default QAndA;
