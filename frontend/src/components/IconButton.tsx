import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ROTATED_SHADOW_CLASSES, rotateClass, SHADOW_CLASSES } from "../libs/hardShadow";

const VARIANT_STYLES = {
  default: { classes: "bg-primary-300 border-neutral-900", shadow: "black" },
  dark: { classes: "bg-neutral-900 border-neutral-0", shadow: "pink" },
  gray: { classes: "bg-neutral-700 border-neutral-900", shadow: "black" },
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
  const { classes, shadow } = VARIANT_STYLES[variant];

  const button = (
    <button
      className={`flex ${SIZE_CLASSES[size]} shrink-0 items-center justify-center border-2 border-solid ${classes} ${rotate ? "" : SHADOW_CLASSES[shadow]} ${className ?? ""}`}
      {...props}
    >
      {icon}
    </button>
  );

  if (!rotate) return button;

  return <div className={`${rotateClass(rotate)} ${ROTATED_SHADOW_CLASSES[shadow]}`}>{button}</div>;
}
