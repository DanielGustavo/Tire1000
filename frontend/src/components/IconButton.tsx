import type { ButtonHTMLAttributes, ReactNode } from "react";

const VARIANT_CLASSES = {
  default: "bg-primary-300 border-neutral-900 shadow-hard",
  dark: "bg-neutral-900 border-neutral-0 shadow-hard-pink",
  gray: "bg-neutral-700 border-neutral-900 shadow-hard",
} as const;

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANT_CLASSES;
  icon: ReactNode;
};

export function IconButton({ variant = "default", icon, className, ...props }: IconButtonProps) {
  return (
    <button
      className={`flex size-10 shrink-0 items-center justify-center border-2 border-solid ${VARIANT_CLASSES[variant]} ${className ?? ""}`}
      {...props}
    >
      {icon}
    </button>
  );
}
