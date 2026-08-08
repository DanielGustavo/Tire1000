import type { ReactNode } from "react";
import cardTexture from "../assets/card-texture.png";
import cardTextureDark from "../assets/card-texture-dark.png";

type TexturedCardProps = {
  /** A hex background color, or "dark" for the black/error-processing variant. */
  color: string | "dark";
  className?: string;
  children: ReactNode;
};

export function TexturedCard({ color, className, children }: TexturedCardProps) {
  const isDark = color === "dark";

  return (
    <div
      className={`relative flex flex-col overflow-hidden border-2 border-solid border-neutral-900 ${isDark ? "shadow-hard-pink" : "shadow-hard"} ${className ?? ""}`}
      style={isDark ? undefined : { backgroundColor: color }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {isDark && <div className="absolute inset-0 bg-black" />}
        <div
          className={`absolute inset-0 bg-[length:40px_40px] bg-top-left ${isDark ? "mix-blend-hard-light" : "opacity-[0.11]"}`}
          style={{ backgroundImage: `url(${isDark ? cardTextureDark : cardTexture})` }}
        />
      </div>
      <div className="relative flex flex-1 flex-col">{children}</div>
    </div>
  );
}
