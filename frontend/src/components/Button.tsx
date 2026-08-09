import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader } from "lucide-react";

const VARIANT_CLASSES = {
  primary:
    "bg-primary-300 text-neutral-900 border-neutral-900 shadow-hard hover:shadow-[4px_4px_0px_0px_#1e1e1e] focus-visible:outline-neutral-900",
  neutral:
    "bg-neutral-300 text-neutral-0 border-neutral-900 shadow-hard hover:shadow-[4px_4px_0px_0px_#1e1e1e] focus-visible:outline-neutral-900",
  secondary:
    "bg-alert-300 text-neutral-900 border-neutral-900 shadow-hard hover:shadow-[4px_4px_0px_0px_#1e1e1e] focus-visible:outline-neutral-900",
  dark: "bg-neutral-900 text-neutral-0 border-neutral-0 shadow-hard-pink hover:shadow-[4px_4px_0px_0px_var(--color-pink-300)] focus-visible:outline-neutral-0",
  error:
    "bg-error-300 text-neutral-0 border-neutral-900 shadow-hard hover:shadow-[4px_4px_0px_0px_#1e1e1e] focus-visible:outline-neutral-900",
} as const;

const SIZE_CLASSES = {
  default: "h-12 px-8",
  small: "h-10 px-8",
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANT_CLASSES;
  size?: keyof typeof SIZE_CLASSES;
  icon?: ReactNode;
  /** Blocks clicks like `disabled`, but keeps the enabled look and swaps the icon slot for a spinner. */
  loading?: boolean;
};

export function Button({
  variant = "primary",
  size = "default",
  icon,
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const isDimmed = Boolean(disabled) && !loading;

  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex shrink-0 items-center justify-center gap-2 border-2 border-solid text-default font-bold transition-[box-shadow,transform] duration-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${isDimmed ? "opacity-50 shadow-none" : ""} ${className ?? ""}`}
      {...props}
    >
      {children}
      {(loading || icon) && (
        <span className="size-5 shrink-0" aria-hidden="true">
          {loading ? <Loader size={20} className="animate-spin" /> : icon}
        </span>
      )}
    </button>
  );
}
