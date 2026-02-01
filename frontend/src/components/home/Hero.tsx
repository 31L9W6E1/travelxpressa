import { Button } from "@/components/ui/button";
import { Plane } from "lucide-react";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 text-center space-y-6">
      <div className="flex justify-center">
        <Plane className="h-10 w-10 text-primary" />
      </div>

      <h1 className="text-4xl md:text-5xl font-bold">
        United States Tourist Visa
      </h1>

      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Professional U.S. visa consultation and full application support by
        Travel Xpressa.
      </p>

      <div className="flex justify-center gap-4">
        <Button size="lg" asChild>
          <Link to="/form">Apply for Visa</Link>
        </Button>
        <Button size="lg" variant="outline">
          Free Consultation
        </Button>
      </div>
    </section>
  );
};
