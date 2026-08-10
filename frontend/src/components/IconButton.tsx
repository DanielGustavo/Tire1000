import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ROTATED_HOVER_SHADOW_CLASSES, ROTATED_SHADOW_CLASSES, rotateClass, SHADOW_CLASSES } from "../libs/hardShadow";

const VARIANT_STYLES = {
  default: {
    classes: "bg-primary-300 border-neutral-900 focus-visible:outline-neutral-900",
    shadow: "black",
    hoverShadow: "hover:shadow-[4px_4px_0px_0px_#1e1e1e]",
  },
  dark: {
    classes: "bg-neutral-900 border-neutral-0 focus-visible:outline-neutral-0",
    shadow: "pink",
    hoverShadow: "hover:shadow-[4px_4px_0px_0px_var(--color-pink-300)]",
  },
  gray: {
    classes: "bg-neutral-700 border-neutral-900 focus-visible:outline-neutral-900",
    shadow: "black",
    hoverShadow: "hover:shadow-[4px_4px_0px_0px_#1e1e1e]",
  },
} as const;

const SIZE_CLASSES = {
  default: "size-10",
  large: "size-12",
} as const;

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANT_STYLES;
  size?: keyof typeof SIZE_CLASSES;
  rotate?: "left" | "right";
  icon: ReactNode;
};

export function IconButton({ variant = "default", size = "default", rotate, icon, className, ...props }: IconButtonProps) {
  const { classes, shadow, hoverShadow } = VARIANT_STYLES[variant];

  const button = (
    <button
      className={`flex ${SIZE_CLASSES[size]} shrink-0 items-center justify-center border-2 border-solid transition-[box-shadow,transform] duration-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${classes} ${rotate ? "" : `${SHADOW_CLASSES[shadow]} ${hoverShadow}`} ${className ?? ""}`}
      {...props}
    >
      {icon}
    </button>
  );

  if (!rotate) return button;

  return (
    <div
      className={`transition-[filter] duration-100 ${rotateClass(rotate)} ${ROTATED_SHADOW_CLASSES[shadow]} ${ROTATED_HOVER_SHADOW_CLASSES[shadow]}`}
    >
      {button}
    </div>
  );
}
