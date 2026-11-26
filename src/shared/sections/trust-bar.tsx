import { CountUp } from "@/shared/ui/count-up";

export type TrustItem = { value?: number; label: string; note: string; strong?: string };

/** Thanh tin cậy — CHỈ số liệu thật, không dùng mẫu "X năm, Y khách" (plan mục 5.1). */
export function TrustBar({ title, items }: { title: string; items: TrustItem[] }) {
  return (
    <section aria-label={title} className="border-b border-border bg-surface">
      <ul className="container-page grid grid-cols-2 divide-border md:grid-cols-4 md:divide-x">
        {items.map((it, i) => (
          <li
            key={i}
            className="flex flex-col justify-center gap-1 border-border px-2 py-6 md:px-6 [&:nth-child(-n+2)]:border-b md:[&:nth-child(-n+2)]:border-b-0"
          >
            <p className="flex items-baseline gap-2">
              {it.value !== undefined && (
                <CountUp value={it.value} className="font-display text-4xl font-extrabold text-brand-strong" />
              )}
              <span className="font-sub text-sm font-semibold tracking-wide uppercase">{it.strong ?? it.label}</span>
            </p>
            {it.strong && <span className="text-sm font-medium">{it.label}</span>}
            <span className="font-mono text-xs text-muted">{it.note}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
