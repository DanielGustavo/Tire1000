import type { ButtonHTMLAttributes, ReactNode } from "react";

const VARIANT_CLASSES = {
  primary: "bg-primary-300 text-neutral-900 border-neutral-900 shadow-hard",
  neutral: "bg-neutral-300 text-neutral-0 border-neutral-900 shadow-hard",
  secondary: "bg-alert-300 text-neutral-900 border-neutral-900 shadow-hard",
  dark: "bg-neutral-900 text-neutral-0 border-neutral-0 shadow-hard-pink",
} as const;

const SIZE_CLASSES = {
  default: "h-12 px-8",
  small: "h-10 px-8",
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANT_CLASSES;
  size?: keyof typeof SIZE_CLASSES;
  icon?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "default",
  icon,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex shrink-0 items-center justify-center gap-2 border-2 border-solid text-default font-bold ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className ?? ""}`}
      {...props}
    >
      {children}
      {icon && (
        <span className="size-5 shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}
    </button>
  );
}
