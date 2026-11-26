/** FAQ dạng <details> — không cần JavaScript, dùng được bằng bàn phím. */
export function FaqList({ items }: { items: { id: string; q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-border border-y border-border">
      {items.map((item) => (
        <details key={item.id} className="group py-1">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-left text-lg font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
            <span>{item.q}</span>
            <span
              aria-hidden
              className="grid size-8 shrink-0 place-items-center border border-border-strong font-mono text-brand-strong transition-transform duration-300 group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="max-w-3xl pb-5 text-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
