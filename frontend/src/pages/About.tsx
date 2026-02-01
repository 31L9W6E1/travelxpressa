import { Link } from "react-router-dom";
import {
  Shield,
  Clock,
  Users,
  CheckCircle,
  FileText,
  Headphones,
  Award,
  Plane
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  const features = [
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your personal information is encrypted and securely stored. We never share your data with third parties."
    },
    {
      icon: Clock,
      title: "Save Time",
      description: "Our guided process helps you complete your DS-160 form faster with fewer errors than doing it alone."
    },
    {
      icon: Users,
      title: "Expert Support",
      description: "Our team of visa experts is available to answer your questions and guide you through the process."
    },
    {
      icon: CheckCircle,
      title: "Error Prevention",
      description: "Built-in validation catches common mistakes before submission, reducing the chance of delays."
    }
  ];

  const stats = [
    { value: "50,000+", label: "Applications Completed" },
    { value: "98%", label: "Success Rate" },
    { value: "24/7", label: "Support Available" },
    { value: "4.9/5", label: "Customer Rating" }
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative pt-28 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-full text-muted-foreground text-sm mb-6">
            <Plane className="w-4 h-4" />
            Trusted by thousands worldwide
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            About{" "}
            <span className="text-muted-foreground">
              TravelXpressa
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            We simplify the US visa application process by providing a user-friendly platform
            that guides you through every step of the DS-160 form completion.
          </p>
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
              Why Choose Us
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform is designed to make your visa application experience as smooth as possible.
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
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Complete your DS-160 application in three simple steps.
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
                  Create Account
                </h3>
                <p className="text-muted-foreground">
                  Sign up for free and access our guided DS-160 form builder with auto-save functionality.
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
                  Fill Your Application
                </h3>
                <p className="text-muted-foreground">
                  Complete each section with our step-by-step guidance. Get help anytime from our support team.
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
                  Submit & Track
                </h3>
                <p className="text-muted-foreground">
                  Review your application, submit to CEAC, and track your visa status all in one place.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Card className="bg-secondary">
            <CardContent className="p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to Start Your Application?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of successful applicants who have used our platform to complete their DS-160 forms.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to="/login">Get Started Free</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/learn-more">Learn More</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Plane className="w-6 h-6" />
              <span className="text-xl font-bold">TravelXpressa</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link to="/learn-more" className="hover:text-foreground transition-colors">Learn More</Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2024 TravelXpressa. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default About;
