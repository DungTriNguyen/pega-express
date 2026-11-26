/**
 * Quy trình 4 bước, đường nối tự vẽ theo cuộn (hiệu ứng c).
 * CSS scroll-driven animation (`.process-line`, globals.css) — Server Component, 0 KB JS.
 * Trình duyệt chưa hỗ trợ / giảm chuyển động: đường nối hiện đầy đủ.
 */
export function ProcessSteps({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <ol className="process-track relative grid gap-10 md:grid-cols-4 md:gap-6">
      <div aria-hidden className="absolute top-6 right-0 left-0 hidden h-0.5 bg-charcoal-700 md:block">
        <div className="process-line process-line-x h-full origin-left bg-orange-400" />
      </div>
      <div aria-hidden className="absolute top-0 bottom-0 left-6 w-0.5 bg-charcoal-700 md:hidden">
        <div className="process-line process-line-y h-full w-full origin-top bg-orange-400" />
      </div>
      {steps.map((s, i) => (
        <li key={s.title} className="relative pl-16 md:pl-0">
          <span className="absolute top-0 left-0 grid size-12 place-items-center border-2 border-orange-400 bg-charcoal-900 font-mono text-sm font-semibold text-orange-300 md:relative">
            0{i + 1}
          </span>
          <h3 className="mt-0 font-display text-2xl font-bold uppercase md:mt-6">{s.title}</h3>
          <p className="mt-2 text-charcoal-200">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}
