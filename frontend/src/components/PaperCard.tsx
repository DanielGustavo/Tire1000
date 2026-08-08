import type { ReactNode } from "react";
import paperEdge from "../assets/paper-edge.svg?url";

type PaperCardProps = {
  className?: string;
  children: ReactNode;
};

// Matches the leading every text block inside a PaperCard must use (see HighlightedEssayText and the
// Nota final paragraph) — the ruled lines are sized in `em` off this same number so a line of text can
// never drift off its rule, no matter how long the card grows. A literal px line-height here would
// round differently than the browser's own line-box math and drift more with every line.
const LINE_HEIGHT_EM = 1.7;

/**
 * A bordered card styled like ruled notebook paper — the scalloped edge straddling its top border,
 * horizontal rules behind its content. Used for the essay text and the final score in the Correção
 * result.
 *
 * The scallop overlay comes *after* the bordered box in the DOM (and is drawn with `bg-no-repeat` at
 * the card's actual width, not tiled — the source asset is one full pre-rendered strip of bumps, not a
 * single repeatable tile) so it paints on top of the straight border and visually breaks it up.
 */
export function PaperCard({ className, children }: PaperCardProps) {
  return (
    <div className="relative w-full">
      <div
        className={`relative border-2 border-solid border-neutral-900 bg-neutral-0 bg-repeat-y p-4 text-default shadow-hard ${className ?? ""}`}
        style={{
          lineHeight: LINE_HEIGHT_EM,
          backgroundImage: "linear-gradient(to bottom, transparent calc(100% - 2px), var(--color-neutral-50) calc(100% - 2px))",
          backgroundSize: `100% ${LINE_HEIGHT_EM}em`,
          backgroundPosition: `0 calc(1rem + ${LINE_HEIGHT_EM}em)`,
        }}
      >
        {children}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-2 top-0 h-[18px] bg-no-repeat"
        style={{ backgroundImage: `url(${paperEdge})`, backgroundSize: "100% 100%" }}
      />
    </div>
  );
}
