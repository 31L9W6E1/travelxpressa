import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { Button } from "@/components/ui/button";

export default function Maintenance() {
  const { t } = useTranslation();
  const { settings } = useSiteSettings();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background text-foreground flex items-center justify-center">
      <div className="max-w-xl w-full px-4 sm:px-6">
        <div className="rounded-2xl border border-dashed border-border/70 bg-card p-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t("maintenance.title", { defaultValue: "We'll be right back" })}
          </h1>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            {settings.maintenance.message?.trim()
              ? settings.maintenance.message
              : t("maintenance.subtitle", {
                  defaultValue:
                    "TravelXpressa is currently under maintenance. Please check back soon.",
                })}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/login">
                {t("maintenance.adminLogin", { defaultValue: "Admin login" })}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/contactsupport">
                {t("maintenance.contactSupport", { defaultValue: "Contact support" })}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
