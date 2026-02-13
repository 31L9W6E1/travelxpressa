import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import { useTranslation } from "react-i18next";

const HelpCenter = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader
        title={t("nav.helpCenter", { defaultValue: "Help Center" })}
        subtitle={t("helpCenterPage.subtitle", {
          defaultValue:
            "Help for visa services, application tracking, payments, and support.",
        })}
      />

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>{t("helpCenterPage.cards.inbox.title", { defaultValue: "Track Applications" })}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                {t("helpCenterPage.cards.inbox.description", {
                  defaultValue:
                    "Check your application status, step-by-step updates, and what to do next.",
                })}
              </p>
              <Button asChild variant="outline">
                <Link to="/profile/inbox">
                  {t("helpCenterPage.cards.inbox.action", { defaultValue: "Open Inbox" })}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("nav.feedback", { defaultValue: "Feedback" })}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                {t("helpCenterPage.cards.feedback.description", {
                  defaultValue:
                    "Share feedback about the service and your experience on the website.",
                })}
              </p>
              <Button asChild variant="outline">
                <Link to="/feedback">
                  {t("helpCenterPage.cards.feedback.action", { defaultValue: "Send Feedback" })}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("nav.qAndA", { defaultValue: "Q&A" })}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                {t("helpCenterPage.cards.qa.description", {
                  defaultValue:
                    "Common questions and short answers about preparing your visa documents.",
                })}
              </p>
              <Button asChild variant="outline">
                <Link to="/q-and-a">
                  {t("helpCenterPage.cards.qa.action", { defaultValue: "View Q&A" })}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("nav.flight", { defaultValue: "Flight" })}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                {t("helpCenterPage.cards.flight.description", {
                  defaultValue:
                    "Flight search and itinerary planning support for visa preparation.",
                })}
              </p>
              <Button asChild variant="outline">
                <Link to="/flight">
                  {t("helpCenterPage.cards.flight.action", { defaultValue: "View Flights" })}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("nav.insurance", { defaultValue: "Insurance" })}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                {t("helpCenterPage.cards.insurance.description", {
                  defaultValue:
                    "Guidance on travel insurance requirements and document readiness.",
                })}
              </p>
              <Button asChild variant="outline">
                <Link to="/insurance">
                  {t("helpCenterPage.cards.insurance.action", { defaultValue: "View Insurance" })}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("helpCenterPage.cards.support.title", { defaultValue: "Support Chat" })}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                {t("helpCenterPage.cards.support.description", {
                  defaultValue:
                    "Chat with our team, share files, and receive progress updates.",
                })}
              </p>
              <Button asChild>
                <Link to="/contactsupport">
                  {t("helpCenterPage.cards.support.action", { defaultValue: "Open Chat" })}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default HelpCenter;
