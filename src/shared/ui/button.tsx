import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "inverse" | "outline-inverse";
type Size = "md" | "lg" | "sm";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md font-sub font-semibold tracking-wide whitespace-nowrap transition-[background-color,color,border-color,transform] duration-150 ease-out active:translate-y-px disabled:pointer-events-none disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "bg-btn text-on-btn hover:bg-btn-hover shadow-1",
  secondary: "border border-border-strong bg-surface text-fg hover:border-brand-strong hover:text-brand-strong",
  ghost: "text-fg hover:text-brand-strong",
  inverse: "bg-ivory-50 text-charcoal-900 hover:bg-ivory-100",
  "outline-inverse": "border border-ivory-50/40 text-ivory-50 hover:border-orange-300 hover:text-orange-300",
};

const sizes: Record<Size, string> = {
  sm: "px-3 text-sm",
  md: "px-5 text-[0.95rem]",
  lg: "px-6 text-base min-h-12",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size; icon?: ReactNode };

export function Button({ variant = "primary", size = "md", className, icon, children, ...rest }: ButtonProps) {
  return (
    <button className={buttonClass(variant, size, className)} {...rest}>
      {icon}
      {children}
    </button>
  );
}

type ExternalLinkProps = ComponentProps<"a"> & { variant?: Variant; size?: Size; icon?: ReactNode };

/** Liên kết ngoài / tel: / zalo — dùng thẻ <a> thường */
export function ButtonAnchor({
  variant = "primary",
  size = "md",
  className,
  icon,
  children,
  ...rest
}: ExternalLinkProps) {
  return (
    <a className={buttonClass(variant, size, className)} {...rest}>
      {icon}
      {children}
    </a>
  );
}
