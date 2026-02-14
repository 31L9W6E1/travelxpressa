import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

type FooterNavLink = {
  to: string;
  label: string;
};

type SiteFooterProps = {
  links: FooterNavLink[];
};

const BRAND_LOGO = "/branding/logo-visamn-com.png";

const SiteFooter = ({ links }: SiteFooterProps) => {
  const { t, i18n } = useTranslation();
  const isMongolian = i18n.language?.toLowerCase().startsWith("mn");

  const headline = isMongolian
    ? "Виз мэдүүлгийг илүү хурдан, илүү итгэлтэй болгоно."
    : "Faster, clearer, and more reliable visa applications.";

  const subline = isMongolian
    ? "Баримт бичгийн шалгалт, зөвлөмж, шат бүрийн хяналт — бүгдийг нэг дор."
    : "From document checks to appointment updates, manage everything in one place.";

  const trustLine = isMongolian
    ? "Аюулгүй процесс • Мэргэжлийн дэмжлэг"
    : "Secure process • Professional support";

  return (
    <footer className="border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="space-y-3">
            <Link to="/" className="inline-flex items-center">
              <img
                src={BRAND_LOGO}
                alt="visamn.com"
                className="h-9 md:h-10 w-auto object-contain"
                loading="lazy"
              />
            </Link>
            <p className="text-base md:text-lg font-semibold text-foreground">{headline}</p>
            <p className="text-sm text-muted-foreground">{subline}</p>
          </div>

          <div className="flex flex-wrap gap-5 md:justify-end text-sm text-muted-foreground">
            {links.map((link) => (
              <Link key={`${link.to}-${link.label}`} to={link.to} className="hover:text-foreground transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-border/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} visamn.com. {t("footer.copyright", { defaultValue: "All rights reserved" })}.
          </p>
          <p className="text-xs text-muted-foreground">{trustLine}</p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
