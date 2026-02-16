import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {items.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-sm text-muted-foreground">
                Одоогоор асуулт, хариултын мэдээлэл алга.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Түгээмэл асуултууд</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Accordion type="single" collapsible className="w-full">
                  {items.map((item, index) => (
                    <AccordionItem
                      key={`${item.q}-${item.a.slice(0, 24)}-${index}`}
                      value={`item-${index}`}
                    >
                      <AccordionTrigger>{item.q}</AccordionTrigger>
                      <AccordionContent>{item.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
};

export default QAndA;
