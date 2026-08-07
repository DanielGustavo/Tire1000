import type { ReactNode } from "react";

const VARIANT_CLASSES = {
  default: "bg-primary-100 border-neutral-900 text-neutral-900 shadow-hard",
  dark: "bg-neutral-900 border-neutral-0 text-neutral-0 shadow-hard-pink",
  slot: "bg-primary-100 border-neutral-900 shadow-hard",
  "dark-slot": "bg-neutral-900 border-neutral-0 shadow-hard-pink",
} as const;

type BulletProps = {
  variant?: keyof typeof VARIANT_CLASSES;
  children: ReactNode;
};

export function Bullet({ variant = "default", children }: BulletProps) {
  const isSlot = variant === "slot" || variant === "dark-slot";

  return (
    <div
      className={`flex size-[51px] shrink-0 items-center justify-center overflow-clip border-2 border-solid ${VARIANT_CLASSES[variant]} ${isSlot ? "" : "px-3 py-1"}`}
    >
      {isSlot ? (
        children
      ) : (
        <span className="text-[20px] leading-none font-extrabold uppercase">{children}</span>
      )}
    </div>
  );
}
