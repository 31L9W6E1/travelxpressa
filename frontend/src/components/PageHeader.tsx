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
    <section className={cn("pt-16 pb-12 border-b border-border", className)}>
      <div className={cn("max-w-7xl mx-auto px-6", containerClassName)}>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <h3 className={cn("text-4xl md:text-5xl font-bold mb-4", titleClassName)}>{title}</h3>
            {subtitle ? (
              <p className={cn("text-xl text-muted-foreground", subtitleClassName)}>{subtitle}</p>
            ) : null}
          </div>
          {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
        </div>
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}

