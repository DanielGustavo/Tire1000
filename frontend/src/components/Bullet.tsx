import type { ReactNode } from "react";
import { ROTATED_SHADOW_CLASSES, rotateClass, SHADOW_CLASSES } from "../libs/hard-shadow";

const VARIANT_STYLES = {
  default: { classes: "bg-primary-100 border-neutral-900 text-neutral-900", shadow: "black" },
  dark: { classes: "bg-neutral-900 border-neutral-0 text-neutral-0", shadow: "pink" },
  white: { classes: "bg-neutral-0 border-neutral-900 text-neutral-900", shadow: "black" },
  alert: { classes: "bg-alert-100 border-neutral-900 text-neutral-900", shadow: "black" },
  error: { classes: "bg-error-100 border-neutral-900 text-neutral-900", shadow: "black" },
  info: { classes: "bg-info-300 border-neutral-900 text-neutral-900", shadow: "black" },
  pink: { classes: "bg-pink-300 border-neutral-900 text-neutral-900", shadow: "black" },
  slot: { classes: "bg-primary-100 border-neutral-900", shadow: "black" },
  "dark-slot": { classes: "bg-neutral-900 border-neutral-0", shadow: "pink" },
} as const;

type BulletProps = {
  variant?: keyof typeof VARIANT_STYLES;
  /** Overrides the variant's background with an arbitrary hex — e.g. a topic's color. Border/text/shadow still come from `variant`. */
  color?: string;
  /** "fixed" is the classic 51px square (landing page). "auto" hugs its text — badges/labels of varying length. */
  size?: "fixed" | "auto";
  rotate?: "left" | "right";
  children: ReactNode;
};

export function Bullet({ variant = "default", color, size = "fixed", rotate, children }: BulletProps) {
  const { classes, shadow } = VARIANT_STYLES[variant];
  const isSlot = variant === "slot" || variant === "dark-slot";
  const sizeClasses = size === "fixed" ? "size-[51px]" : "min-h-10 w-auto max-w-full";

  const box = (
    <div
      className={`flex ${sizeClasses} shrink-0 items-center justify-center overflow-clip border-2 border-solid ${classes} ${rotate ? "" : SHADOW_CLASSES[shadow]} ${isSlot ? "" : "px-3 py-1"}`}
      style={color ? { backgroundColor: color } : undefined}
    >
      {isSlot ? (
        children
      ) : (
        <span className="text-[20px] leading-none font-extrabold uppercase">{children}</span>
      )}
    </div>
  );

  if (!rotate) return box;

  return <div className={`${rotateClass(rotate)} ${ROTATED_SHADOW_CLASSES[shadow]}`}>{box}</div>;
}
