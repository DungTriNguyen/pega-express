import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

type Tone = "default" | "alt" | "inverse";

const tones: Record<Tone, string> = {
  default: "bg-bg text-fg",
  alt: "bg-surface-2 text-fg",
  // "inverse" luôn tối (charcoal) ở cả 2 chế độ — đúng hướng "Charcoal biên tập"
  inverse: "bg-charcoal-900 text-ivory-50",
};

type Props = {
  id?: string;
  tone?: Tone;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  headingLevel?: "h1" | "h2";
  className?: string;
  children: ReactNode;
  actions?: ReactNode;
};

export function Section({
  id,
  tone = "default",
  eyebrow,
  title,
  subtitle,
  headingLevel = "h2",
  className,
  actions,
  children,
}: Props) {
  const Heading = headingLevel;
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={title ? headingId : undefined}
      className={cn("py-16 sm:py-24", tones[tone], className)}
    >
      <div className="container-page">
        {(eyebrow || title) && (
          <header className="reveal mb-10 flex flex-col gap-4 sm:mb-14 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              {eyebrow && <Eyebrow inverse={tone === "inverse"}>{eyebrow}</Eyebrow>}
              {title && (
                <Heading id={headingId} className="mt-3 font-display text-display-lg font-extrabold uppercase">
                  {title}
                </Heading>
              )}
              {subtitle && (
                <p className={cn("mt-4 max-w-2xl text-lg", tone === "inverse" ? "text-charcoal-200" : "text-muted")}>
                  {subtitle}
                </p>
              )}
            </div>
            {actions}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}

export function Eyebrow({ children, inverse }: { children: ReactNode; inverse?: boolean }) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 font-mono text-xs font-medium tracking-[0.18em] uppercase",
        inverse ? "text-orange-300" : "text-brand-strong",
      )}
    >
      <span aria-hidden className="inline-block h-px w-6 bg-current" />
      {children}
    </p>
  );
}
