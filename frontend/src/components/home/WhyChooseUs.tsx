import { ShieldCheck, Globe, ThumbsUp } from "lucide-react";

export const WhyChooseUs = () => {
  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-6xl mx-auto px-6 space-y-10">
        <h2 className="text-3xl font-bold text-center">
          Why Choose Travel Xpressa
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          <Feature icon={ShieldCheck} title="Trusted Agency" />
          <Feature icon={Globe} title="Global Experience" />
          <Feature icon={ThumbsUp} title="High Approval Guidance" />
        </div>
      </div>
    </section>
  );
};

const Feature = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <div className="bg-white border rounded-lg p-6 text-center">
    <Icon className="mx-auto h-8 w-8 text-primary mb-3" />
    <h4 className="font-semibold">{title}</h4>
  </div>
);
