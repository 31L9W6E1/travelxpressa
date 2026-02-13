import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
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
  className,
  containerClassName,
  titleClassName,
  subtitleClassName,
}: PageHeaderProps) {
  return (
    <section className={cn("py-8 md:py-10 border-b border-border", className)}>
      <div className={cn("max-w-7xl mx-auto px-4 sm:px-6", containerClassName)}>
        <div className="flex flex-col gap-4 md:gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <h3 className={cn("text-2xl md:text-3xl font-bold mb-2", titleClassName)}>{title}</h3>
            {subtitle ? (
              <p className={cn("text-sm md:text-base text-muted-foreground", subtitleClassName)}>{subtitle}</p>
            ) : null}
          </div>
          {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
        </div>
        {children ? <div className="mt-4 md:mt-6">{children}</div> : null}
      </div>
    </section>
  );
}
