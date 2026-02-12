import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Shield,
  Clock,
  Users,
  CheckCircle,
  FileText,
  Headphones,
  Award,
  Plane,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Shield,
      title: t("home.features.secure.title", { defaultValue: "Secure & Private" }),
      description: t("home.features.secure.description", {
        defaultValue:
          "Your personal information is encrypted and securely stored. We never share your data with third parties.",
      }),
    },
    {
      icon: Clock,
      title: t("aboutPage.features.saveTime.title", { defaultValue: "Save Time" }),
      description: t("aboutPage.features.saveTime.description", {
        defaultValue:
          "Our guided process helps you prepare applications faster with fewer errors than doing it alone.",
      }),
    },
    {
      icon: Users,
      title: t("home.features.support.title", { defaultValue: "Expert Support" }),
      description: t("home.features.support.description", {
        defaultValue:
          "Our team of visa experts is available to answer your questions and guide you through the process.",
      }),
    },
    {
      icon: CheckCircle,
      title: t("home.features.errorPrevention.title", { defaultValue: "Error Prevention" }),
      description: t("home.features.errorPrevention.description", {
        defaultValue:
          "Built-in validation catches common mistakes before submission, reducing the chance of delays.",
      }),
    }
  ];

  const stats = [
    { value: "1,000+", label: t("home.stats.applicationsCompleted", { defaultValue: "Applications Completed" }) },
    { value: "98%", label: t("home.stats.successRate", { defaultValue: "Success Rate" }) },
    { value: "24/7", label: t("home.stats.supportAvailable", { defaultValue: "Support Available" }) },
    { value: "4.9/5", label: t("home.stats.customerRating", { defaultValue: "Customer Rating" }) }
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="pt-16 pb-12 border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t("aboutPage.hero.titlePrefix", { defaultValue: "About" })}{" "}
            {t("footer.company", { defaultValue: "TravelXpressa" })}
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl mb-8">
            {t("aboutPage.hero.subtitle", {
              defaultValue:
                "We simplify visa application preparation with guided steps, clear checklists, and support for multiple destinations.",
            })}
          </p>

          <p className="text-sm text-muted-foreground mb-8">
            {t("aboutPage.hero.customers", {
              defaultValue: "We have helped 1,000+ customers.",
            })}
          </p>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/select-country">
                {t("aboutPage.hero.primaryCta", { defaultValue: "Start Application" })}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/learn-more">
                {t("aboutPage.hero.secondaryCta", { defaultValue: "View Fees & Requirements" })}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t("home.features.title", { defaultValue: "Why Choose Us" })}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("aboutPage.features.subtitle", {
                defaultValue:
                  "Our platform is designed to make your visa application experience as smooth as possible.",
              })}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-secondary/50 hover:border-primary/50 transition-all group"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t("aboutPage.howItWorks.title", { defaultValue: "How It Works" })}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("aboutPage.howItWorks.subtitle", {
                defaultValue:
                  "An online service for busy travelers: prepare your application, track progress, and get support when you need it.",
              })}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-secondary/50">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl mb-6">
                  1
                </div>
                <FileText className="w-10 h-10 text-foreground mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {t("aboutPage.howItWorks.steps.createAccount.title", { defaultValue: "Create Account" })}
                </h3>
                <p className="text-muted-foreground">
                  {t("aboutPage.howItWorks.steps.createAccount.description", {
                    defaultValue:
                      "Create an account and choose your destination. Your progress is saved automatically.",
                  })}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-secondary/50">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl mb-6">
                  2
                </div>
                <Headphones className="w-10 h-10 text-foreground mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {t("aboutPage.howItWorks.steps.fillApplication.title", { defaultValue: "Fill Your Application" })}
                </h3>
                <p className="text-muted-foreground">
                  {t("aboutPage.howItWorks.steps.fillApplication.description", {
                    defaultValue:
                      "Complete each section with step-by-step guidance and clear checklists. Get help anytime from our support team.",
                  })}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-secondary/50">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl mb-6">
                  3
                </div>
                <Award className="w-10 h-10 text-foreground mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {t("aboutPage.howItWorks.steps.submitTrack.title", { defaultValue: "Submit & Track" })}
                </h3>
                <p className="text-muted-foreground">
                  {t("aboutPage.howItWorks.steps.submitTrack.description", {
                    defaultValue:
                      "Review and export your application and track it through your dashboard. Appointment availability varies by location and season, and earlier slots can sometimes open within 1-2 days. Express support (if selected) adds +15% to the service fee.",
                  })}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Plane className="w-6 h-6" />
              <span className="text-xl font-bold">
                {t("footer.company", { defaultValue: "TravelXpressa" })}
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <Link to="/about" className="hover:text-foreground transition-colors">
                {t("footer.links.about", { defaultValue: "About Us" })}
              </Link>
              <Link to="/learn-more" className="hover:text-foreground transition-colors">
                {t("nav.learnMore", { defaultValue: "Learn More" })}
              </Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                {t("footer.links.privacy", { defaultValue: "Privacy Policy" })}
              </Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">
                {t("footer.links.terms", { defaultValue: "Terms of Service" })}
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} {t("footer.company", { defaultValue: "TravelXpressa" })}.{" "}
              {t("footer.copyright", { defaultValue: "All rights reserved" })}.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default About;
