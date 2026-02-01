import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Users, Globe, BarChart3, CheckCircle, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const LearnMore = () => {
  // Mongolian visa statistics
  const mongoliaStats = [
    { label: "Total Applications (2023)", value: "12,450", change: "+15%" },
    { label: "Approval Rate", value: "78%", change: "+3%" },
    { label: "Average Processing", value: "45 days", change: "-5 days" },
    { label: "B1/B2 Visas Issued", value: "8,200", change: "+12%" }
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
    { type: "B1/B2 Tourist/Business", percentage: 65, count: "8,100" },
    { type: "F1 Student", percentage: 18, count: "2,240" },
    { type: "H1B Work", percentage: 8, count: "996" },
    { type: "J1 Exchange", percentage: 5, count: "622" },
    { type: "Other Categories", percentage: 4, count: "492" }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pt-16">
      {/* Hero Section */}
      <section className="py-20 border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Visa Statistics &
              <span className="block text-muted-foreground">Insights</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Comprehensive data on US visa applications, approval rates, and trends
              for Mongolian citizens and global travelers.
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
                <h2 className="text-2xl font-bold">Mongolia Visa Data</h2>
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
                  <h3 className="text-lg font-semibold mb-6">Visa Categories Breakdown</h3>
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
                <h2 className="text-2xl font-bold">Global Approval Rates</h2>
              </div>

              <Card className="bg-secondary/50 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Country</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">Approval Rate</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">Comparison</th>
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
                              You
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
                  <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5" />
                      <span className="text-muted-foreground">
                        Mongolia's approval rate has increased by 3% compared to the previous year
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-foreground mt-0.5" />
                      <span className="text-muted-foreground">
                        B1/B2 tourist visas remain the most commonly applied category
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-foreground mt-0.5" />
                      <span className="text-muted-foreground">
                        Complete documentation significantly improves approval chances
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
          <h2 className="text-3xl font-bold mb-12 text-center">Tips to Improve Your Approval Chances</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Complete Documentation",
                description: "Ensure all required documents are accurate, up-to-date, and properly organized before your interview."
              },
              {
                title: "Strong Ties to Home",
                description: "Demonstrate employment, property ownership, family ties, or other reasons to return to Mongolia."
              },
              {
                title: "Clear Travel Purpose",
                description: "Articulate a specific, legitimate reason for your trip with supporting documentation."
              },
              {
                title: "Financial Stability",
                description: "Show sufficient funds through bank statements and proof of income to cover your trip expenses."
              },
              {
                title: "Honest Answers",
                description: "Always provide truthful information. Inconsistencies can lead to immediate denial."
              },
              {
                title: "Professional Appearance",
                description: "Dress appropriately and arrive early for your interview to make a positive impression."
              }
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
              <h2 className="text-4xl font-bold mb-4">Ready to Apply?</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Start your DS-160 application with TravelXpressa and join the thousands who have successfully obtained their US visa.
              </p>
              <Button asChild size="lg">
                <Link to="/login" className="inline-flex items-center gap-2">
                  Start Your Application
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
    </div>
  );
};

export default LearnMore;
