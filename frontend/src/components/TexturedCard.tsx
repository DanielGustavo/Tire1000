import type { ReactNode } from "react";
import cardTexture from "../assets/card-texture.png";
import cardTextureDark from "../assets/card-texture-dark.png";

type TexturedCardProps = {
  /** A hex background color, or "dark" for the black/error-processing variant. */
  color: string | "dark";
  /** Sizing/self-participation in the parent layout (e.g. `flex-1`, `w-full`) — goes on the outer box. */
  className?: string;
  /** Padding and arrangement of `children` (e.g. `gap-4`, `justify-between`, `p-2.5`) — goes on the div that actually wraps them, so the texture/gradient overlay behind it can stay full-bleed to the border. */
  contentClassName?: string;
  /** Off for the Correção competência cards per a later call — the diagonal color wash still applies there, just not the dotted texture overlay. Every other usage keeps it. */
  texture?: boolean;
  /** Set when the card has a full-bleed overlay `Link`/`button` on top of it — grows the hard shadow on hover and flattens it on active, matching the feedback on `Button`/`IconButton`. */
  interactive?: boolean;
  children: ReactNode;
};

export function TexturedCard({ color, className, contentClassName, texture = true, interactive = false, children }: TexturedCardProps) {
  const isDark = color === "dark";

  return (
    <div
      className={`relative flex flex-col overflow-hidden border-2 border-solid border-neutral-900 ${isDark ? "shadow-hard-pink" : "shadow-hard"} ${
        interactive
          ? `transition-shadow duration-100 active:shadow-none ${isDark ? "hover:shadow-[4px_4px_0px_0px_var(--color-pink-300)]" : "hover:shadow-[4px_4px_0px_0px_#1e1e1e]"}`
          : ""
      } ${className ?? ""}`}
      style={isDark ? undefined : { backgroundColor: color }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {isDark && <div className="absolute inset-0 bg-black" />}
        {texture && (
          <div
            className={`absolute inset-0 bg-[length:40px_40px] bg-top-left ${isDark ? "mix-blend-hard-light" : "opacity-[0.11]"}`}
            style={{ backgroundImage: `url(${isDark ? cardTextureDark : cardTexture})` }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{ backgroundImage: isDark ? "linear-gradient(75deg, #000000 4%, #00000000 90%)" : `linear-gradient(75deg, ${color} 4%, ${color}00 78%)` }}
        />
      </div>
      <div className={`relative flex flex-1 flex-col ${contentClassName ?? ""}`}>{children}</div>
    </div>
  );
}
