import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

const control =
  "block min-h-11 w-full rounded-sm border border-border-strong bg-surface px-3 py-2 text-base text-fg placeholder:text-muted/70 transition-colors focus:border-brand-strong focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus aria-[invalid=true]:border-danger";

export function Label({ htmlFor, children, hint }: { htmlFor: string; children: ReactNode; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-fg">
      {children}
      {hint && <span className="ml-1 font-normal text-muted">({hint})</span>}
    </label>
  );
}

export function Input({ className, ...rest }: ComponentProps<"input">) {
  return <input className={cn(control, className)} {...rest} />;
}

export function Select({ className, children, ...rest }: ComponentProps<"select">) {
  return (
    <select
      className={cn(control, "appearance-none bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat pr-8", className)}
      {...rest}
    >
      {children}
    </select>
  );
}

export function Textarea({ className, ...rest }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-24", className)} {...rest} />;
}

export function FieldError({ id, children }: { id: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-sm text-danger">
      {children}
    </p>
  );
}
