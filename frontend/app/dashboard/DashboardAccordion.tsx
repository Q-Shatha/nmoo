import type { ReactNode } from "react";

type DashboardAccordionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

export function DashboardAccordion({ title, description, children, defaultOpen = false, className = "" }: DashboardAccordionProps) {
  return (
    <details className={`dashboard-accordion group rounded-2xl border border-outline-variant/25 bg-surface-container-lowest ${className}`} open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-start marker:hidden">
        <span className="grid gap-1">
          <span className="font-black text-on-surface">{title}</span>
          {description ? <span className="text-sm leading-6 text-on-surface-variant">{description}</span> : null}
        </span>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container-low text-xl font-black text-primary transition group-open:rotate-45">+</span>
      </summary>
      <div className="border-t border-outline-variant/15 p-4">{children}</div>
    </details>
  );
}
