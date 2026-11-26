import type { ReactNode } from "react";

export type Crumb = { label: string; href?: string };

/** Breadcrumb hiển thị. `renderLink` cho phép tầng trên truyền Link đã dịch slug. */
export function Breadcrumbs({
  items,
  renderLink,
  inverse,
}: {
  items: Crumb[];
  renderLink: (href: string, children: ReactNode) => ReactNode;
  inverse?: boolean;
}) {
  return (
    <nav aria-label="Breadcrumb" className={inverse ? "text-charcoal-200" : "text-muted"}>
      <ol className="flex flex-wrap items-center gap-1.5 font-mono text-xs tracking-wider uppercase">
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden>/</span>}
            {c.href && i < items.length - 1 ? (
              renderLink(c.href, c.label)
            ) : (
              <span aria-current={i === items.length - 1 ? "page" : undefined}>{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
