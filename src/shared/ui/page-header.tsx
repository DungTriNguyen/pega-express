import type { ReactNode } from "react";
import { Eyebrow } from "./section";

/** Đầu trang con: nền charcoal, một dòng tiêu đề condensed rất lớn. */
export function PageHeader({
  eyebrow,
  title,
  lead,
  breadcrumbs,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  breadcrumbs?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden bg-charcoal-900 pt-10 pb-14 text-ivory-50 sm:pt-14 sm:pb-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full border border-orange-400/20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-40 size-[28rem] rounded-full border border-orange-400/10"
      />
      <div className="relative container-page">
        {breadcrumbs}
        <div className="mt-8 max-w-5xl">
          {eyebrow && <Eyebrow inverse>{eyebrow}</Eyebrow>}
          <h1 className="mt-3 font-display text-display-xl leading-tight font-extrabold uppercase">{title}</h1>
          {lead && <p className="mt-5 max-w-2xl text-lg text-charcoal-200">{lead}</p>}
        </div>
        {children}
      </div>
    </header>
  );
}
