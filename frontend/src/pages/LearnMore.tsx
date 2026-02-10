import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Users, Globe, BarChart3, CheckCircle, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const LearnMore = () => {
  const { t } = useTranslation();

  // Mongolian visa statistics
  const mongoliaStats = [
    { label: t("learnMorePage.mongoliaStats.totalApplications", { defaultValue: "Total Applications (2023)" }), value: "12,450", change: "+15%" },
    { label: t("learnMorePage.mongoliaStats.approvalRate", { defaultValue: "Approval Rate" }), value: "78%", change: "+3%" },
    { label: t("learnMorePage.mongoliaStats.avgProcessing", { defaultValue: "Average Processing" }), value: "45 days", change: "-5 days" },
    { label: t("learnMorePage.mongoliaStats.b1b2Issued", { defaultValue: "B1/B2 Visas Issued" }), value: "8,200", change: "+12%" }
  ];

  // Global visa statistics
  const globalStats = [
    { country: "United Kingdom", approval: "92%" },
    { country: "Germany", approval: "89%" },
    { country: "France", approval: "87%" },
    { country: "Japan", approval: "95%" },
    { country: "Australia", approval: "85%" },
    { country: "South Korea", approval: "91%" },
    { country: "Canada", approval: "88%" },
    { country: "Mongolia", approval: "78%" }
  ];

  // Visa categories breakdown
  const visaCategories = [
    { type: t("learnMorePage.visaCategories.b1b2", { defaultValue: "B1/B2 Tourist/Business" }), percentage: 65, count: "8,100" },
    { type: t("learnMorePage.visaCategories.f1", { defaultValue: "F1 Student" }), percentage: 18, count: "2,240" },
    { type: t("learnMorePage.visaCategories.h1b", { defaultValue: "H1B Work" }), percentage: 8, count: "996" },
    { type: t("learnMorePage.visaCategories.j1", { defaultValue: "J1 Exchange" }), percentage: 5, count: "622" },
    { type: t("learnMorePage.visaCategories.other", { defaultValue: "Other Categories" }), percentage: 4, count: "492" }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pt-16">
      {/* Hero Section */}
      <section className="py-20 border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              {t("learnMorePage.hero.titleLine1", { defaultValue: "Visa Statistics &" })}
              <span className="block text-muted-foreground">
                {t("learnMorePage.hero.titleLine2", { defaultValue: "Insights" })}
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t("learnMorePage.hero.subtitle", {
                defaultValue:
                  "Comprehensive data on US visa applications, approval rates, and trends for Mongolian citizens and global travelers.",
              })}
            </p>
          </div>
        </div>
      </section>

      {/* Main Statistics Section */}
      <section className="py-20 border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Mongolia Stats - Left Side */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-secondary rounded-lg">
                  <Globe className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">
                  {t("learnMorePage.sections.mongolia.title", { defaultValue: "Mongolia Visa Data" })}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {mongoliaStats.map((stat, index) => (
                  <Card
                    key={index}
                    className="bg-secondary/50"
                  >
                    <CardContent className="p-6">
                      <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                      <p className="text-3xl font-bold mb-1">{stat.value}</p>
                      <span className="text-sm text-green-500 dark:text-green-400">{stat.change}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Visa Categories Breakdown */}
              <Card className="bg-secondary/50">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-6">
                    {t("learnMorePage.sections.categories.title", { defaultValue: "Visa Categories Breakdown" })}
                  </h3>
                  <div className="space-y-4">
                    {visaCategories.map((category, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-foreground">{category.type}</span>
                          <span className="text-muted-foreground">{category.count} ({category.percentage}%)</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${category.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Global Stats - Right Side */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-secondary rounded-lg">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">
                  {t("learnMorePage.sections.global.title", { defaultValue: "Global Approval Rates" })}
                </h2>
              </div>

              <Card className="bg-secondary/50 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                        {t("learnMorePage.sections.global.table.country", { defaultValue: "Country" })}
                      </th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                        {t("learnMorePage.sections.global.table.approvalRate", { defaultValue: "Approval Rate" })}
                      </th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                        {t("learnMorePage.sections.global.table.comparison", { defaultValue: "Comparison" })}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {globalStats.map((stat, index) => (
                      <tr
                        key={index}
                        className={`border-b border-border/50 ${stat.country === "Mongolia" ? "bg-primary/10" : ""}`}
                      >
                        <td className="p-4">
                          <span className={stat.country === "Mongolia" ? "font-semibold" : ""}>
                            {stat.country}
                          </span>
                          {stat.country === "Mongolia" && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded">
                              {t("learnMorePage.sections.global.you", { defaultValue: "You" })}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right font-mono">{stat.approval}</td>
                        <td className="p-4 text-right">
                          <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden ml-auto">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: stat.approval }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              {/* Key Insights */}
              <Card className="mt-8 bg-secondary/50">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {t("learnMorePage.sections.insights.title", { defaultValue: "Key Insights" })}
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5" />
                      <span className="text-muted-foreground">
                        {t("learnMorePage.sections.insights.item1", {
                          defaultValue:
                            "Mongolia's approval rate has increased by 3% compared to the previous year",
                        })}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-foreground mt-0.5" />
                      <span className="text-muted-foreground">
                        {t("learnMorePage.sections.insights.item2", {
                          defaultValue:
                            "B1/B2 tourist visas remain the most commonly applied category",
                        })}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-foreground mt-0.5" />
                      <span className="text-muted-foreground">
                        {t("learnMorePage.sections.insights.item3", {
                          defaultValue:
                            "Complete documentation significantly improves approval chances",
                        })}
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-20 border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">
            {t("learnMorePage.tips.title", { defaultValue: "Tips to Improve Your Approval Chances" })}
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: t("learnMorePage.tips.items.documentation.title", { defaultValue: "Complete Documentation" }),
                description: t("learnMorePage.tips.items.documentation.description", {
                  defaultValue:
                    "Ensure all required documents are accurate, up-to-date, and properly organized before your interview.",
                }),
              },
              {
                title: t("learnMorePage.tips.items.ties.title", { defaultValue: "Strong Ties to Home" }),
                description: t("learnMorePage.tips.items.ties.description", {
                  defaultValue:
                    "Demonstrate employment, property ownership, family ties, or other reasons to return to Mongolia.",
                }),
              },
              {
                title: t("learnMorePage.tips.items.purpose.title", { defaultValue: "Clear Travel Purpose" }),
                description: t("learnMorePage.tips.items.purpose.description", {
                  defaultValue:
                    "Articulate a specific, legitimate reason for your trip with supporting documentation.",
                }),
              },
              {
                title: t("learnMorePage.tips.items.finances.title", { defaultValue: "Financial Stability" }),
                description: t("learnMorePage.tips.items.finances.description", {
                  defaultValue:
                    "Show sufficient funds through bank statements and proof of income to cover your trip expenses.",
                }),
              },
              {
                title: t("learnMorePage.tips.items.honesty.title", { defaultValue: "Honest Answers" }),
                description: t("learnMorePage.tips.items.honesty.description", {
                  defaultValue:
                    "Always provide truthful information. Inconsistencies can lead to immediate denial.",
                }),
              },
              {
                title: t("learnMorePage.tips.items.appearance.title", { defaultValue: "Professional Appearance" }),
                description: t("learnMorePage.tips.items.appearance.description", {
                  defaultValue:
                    "Dress appropriately and arrive early for your interview to make a positive impression.",
                }),
              },
            ].map((tip, index) => (
              <Card
                key={index}
                className="bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <CardContent className="p-6">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold mb-4">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{tip.title}</h3>
                  <p className="text-muted-foreground text-sm">{tip.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <Card className="bg-secondary">
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl font-bold mb-4">
                {t("learnMorePage.cta.title", { defaultValue: "Ready to Apply?" })}
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t("learnMorePage.cta.subtitle", {
                  defaultValue:
                    "Start your DS-160 application with TravelXpressa and join the thousands who have successfully obtained their US visa.",
                })}
              </p>
              <Button asChild size="lg">
                <Link to="/login" className="inline-flex items-center gap-2">
                  {t("learnMorePage.cta.primary", { defaultValue: "Start Your Application" })}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
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
    </div>
  );
};

export default LearnMore;
