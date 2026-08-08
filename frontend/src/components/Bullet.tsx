import type { ReactNode } from "react";

const VARIANT_STYLES = {
  default: { classes: "bg-primary-100 border-neutral-900 text-neutral-900", shadow: "black" },
  dark: { classes: "bg-neutral-900 border-neutral-0 text-neutral-0", shadow: "pink" },
  alert: { classes: "bg-alert-100 border-neutral-900 text-neutral-900", shadow: "black" },
  error: { classes: "bg-error-100 border-neutral-900 text-neutral-900", shadow: "black" },
  info: { classes: "bg-info-300 border-neutral-900 text-neutral-900", shadow: "black" },
  pink: { classes: "bg-pink-300 border-neutral-900 text-neutral-900", shadow: "black" },
  slot: { classes: "bg-primary-100 border-neutral-900", shadow: "black" },
  "dark-slot": { classes: "bg-neutral-900 border-neutral-0", shadow: "pink" },
} as const;

const SHADOW_CLASSES = {
  black: "shadow-hard",
  pink: "shadow-hard-pink",
} as const;

// box-shadow (hard, unblurred) on a rotated element leaves a jagged seam where its
// edge nearly meets the border — drop-shadow filters the element's own rasterized
// silhouette instead, so rotated instances stay crisp.
const ROTATED_SHADOW_CLASSES = {
  black: "drop-shadow-[2px_2px_0px_#1e1e1e]",
  pink: "drop-shadow-[2px_2px_0px_var(--color-pink-300)]",
} as const;

type BulletProps = {
  variant?: keyof typeof VARIANT_STYLES;
  rotate?: "left" | "right";
  children: ReactNode;
};

export function Bullet({ variant = "default", rotate, children }: BulletProps) {
  const { classes, shadow } = VARIANT_STYLES[variant];
  const isSlot = variant === "slot" || variant === "dark-slot";

  const box = (
    <div
      className={`flex size-[51px] shrink-0 items-center justify-center overflow-clip border-2 border-solid ${classes} ${rotate ? "" : SHADOW_CLASSES[shadow]} ${isSlot ? "" : "px-3 py-1"}`}
    >
      {isSlot ? (
        children
      ) : (
        <span className="text-[20px] leading-none font-extrabold uppercase">{children}</span>
      )}
    </div>
  );

  if (!rotate) return box;

  return (
    <div className={`${rotate === "left" ? "-rotate-5" : "rotate-5"} ${ROTATED_SHADOW_CLASSES[shadow]}`}>{box}</div>
  );
}
