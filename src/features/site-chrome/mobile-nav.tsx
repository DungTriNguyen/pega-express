"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { StaticPathname } from "@/i18n/routing";

export function MobileNav({
  items,
  labels,
  phone,
}: {
  items: { href: StaticPathname; label: string }[];
  labels: { open: string; close: string; menu: string };
  phone: { display: string; e164: string };
}) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="grid size-11 place-items-center rounded-md text-fg lg:hidden"
        aria-label={labels.open}
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Menu aria-hidden className="size-6" />
      </button>
      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        aria-label={labels.menu}
        className="m-0 ml-auto h-dvh max-h-none w-[min(22rem,88vw)] max-w-none bg-bg p-0 text-fg backdrop:bg-charcoal-950/60"
      >
        <div className="flex h-full flex-col p-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
          <div className="flex justify-end">
            <button
              type="button"
              className="grid size-11 place-items-center"
              aria-label={labels.close}
              onClick={() => setOpen(false)}
            >
              <X aria-hidden className="size-6" />
            </button>
          </div>
          <nav aria-label={labels.menu} className="mt-4">
            <ul className="divide-y divide-border border-y border-border">
              {items.map((i) => (
                <li key={i.href}>
                  <Link
                    href={i.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-14 items-center font-display text-2xl font-bold uppercase"
                  >
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <a
            href={`tel:${phone.e164}`}
            className="mt-auto inline-flex min-h-12 items-center gap-2 font-mono text-lg font-semibold"
          >
            <Phone aria-hidden className="size-5 text-brand-strong" /> {phone.display}
          </a>
        </div>
      </dialog>
    </>
  );
}
