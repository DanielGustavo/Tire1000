export type HardShadowColor = "black" | "pink";

export const SHADOW_CLASSES: Record<HardShadowColor, string> = {
  black: "shadow-hard",
  pink: "shadow-hard-pink",
};

// box-shadow (hard, unblurred) on a rotated element leaves a jagged seam where its
// edge nearly meets the border — drop-shadow filters the element's own rasterized
// silhouette instead, so rotated instances stay crisp.
export const ROTATED_SHADOW_CLASSES: Record<HardShadowColor, string> = {
  black: "drop-shadow-[2px_2px_0px_#1e1e1e]",
  pink: "drop-shadow-[2px_2px_0px_var(--color-pink-300)]",
};

export function rotateClass(rotate: "left" | "right"): string {
  return rotate === "left" ? "-rotate-5" : "rotate-5";
}
