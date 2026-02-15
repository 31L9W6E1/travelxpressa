import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  backgroundImageUrl?: string;
  className?: string;
  containerClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
};

export default function PageHeader({
  title,
  subtitle,
  actions,
  children,
  backgroundImageUrl,
  className,
  containerClassName,
  titleClassName,
  subtitleClassName,
}: PageHeaderProps) {
  const hasBackgroundImage = Boolean(backgroundImageUrl?.trim());
  const backgroundStyle = hasBackgroundImage
    ? {
        backgroundImage: `linear-gradient(120deg, rgba(2, 6, 23, 0.72), rgba(15, 23, 42, 0.58)), url(${backgroundImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined;

  return (
    <section
      className={cn(
        "py-6 md:py-8 border-b border-border",
        hasBackgroundImage && "text-white",
        className
      )}
      style={backgroundStyle}
    >
      <div className={cn("max-w-7xl mx-auto px-4 sm:px-6", containerClassName)}>
        <div className="flex flex-col gap-3 md:gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <h3
              className={cn(
                "text-xl sm:text-2xl font-bold mb-1.5",
                hasBackgroundImage && "text-white",
                titleClassName
              )}
            >
              {title}
            </h3>
            {subtitle ? (
              <p
                className={cn(
                  "text-sm text-muted-foreground",
                  hasBackgroundImage && "text-white/85",
                  subtitleClassName
                )}
              >
                {subtitle}
              </p>
            ) : null}
          </div>
          {actions ? <div className="flex w-full md:w-auto flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
        {children ? <div className="mt-3 md:mt-5">{children}</div> : null}
      </div>
    </section>
  );
}
