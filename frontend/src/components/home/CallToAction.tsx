import { Button } from "@/components/ui/button";

export const CallToAction = () => {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 text-center space-y-6">
      <h2 className="text-3xl font-bold">
        Start Your U.S. Visa Application Today
      </h2>
      <Button size="lg" asChild>
        <a href="/form">Apply Now</a>
      </Button>
    </section>
  );
};
