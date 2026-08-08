import type { ReactNode } from "react";

type PaperCardProps = {
  className?: string;
  children: ReactNode;
};

// Matches the leading every text block inside a PaperCard must use (see HighlightedEssayText and the
// Nota final paragraph) — the ruled lines are sized in `em` off this same number so a line of text can
// never drift off its rule, no matter how long the card grows. A literal px line-height here would
// round differently than the browser's own line-box math and drift more with every line.
const LINE_HEIGHT_EM = 1.7;

// The scallop is one bump per tile, radius 12px (bottom half only — the tile is exactly as tall as the
// radius, so the circle's top half falls outside its own box and never renders), repeated as a plain CSS
// pattern instead of a stretched image — that's what makes it look the same size at any card width,
// from a 40px sliver to a full desktop-width card, instead of distorting to fill whatever width it's given.
const SCALLOP_TILE_WIDTH_PX = 34;
const SCALLOP_RADIUS_PX = 12;
const SCALLOP_STROKE_PX = 2;

/**
 * A bordered card styled like ruled notebook paper — the scalloped edge straddling its top border,
 * horizontal rules behind its content. Used for the essay text and the final score in the Correção
 * result.
 *
 * The scallop overlay comes *after* the bordered box in the DOM, so it paints on top of the straight
 * border and visually breaks it up — the gaps between bumps are transparent, letting that straight
 * border show through underneath.
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
        className="pointer-events-none absolute inset-x-0 top-0 bg-repeat-x bg-top"
        style={{
          height: SCALLOP_RADIUS_PX,
          backgroundImage: `radial-gradient(circle at 50% 0, var(--color-neutral-0) 0 ${SCALLOP_RADIUS_PX - SCALLOP_STROKE_PX}px, var(--color-neutral-900) ${SCALLOP_RADIUS_PX - SCALLOP_STROKE_PX}px ${SCALLOP_RADIUS_PX}px, transparent ${SCALLOP_RADIUS_PX}px 100%)`,
          backgroundSize: `${SCALLOP_TILE_WIDTH_PX}px ${SCALLOP_RADIUS_PX}px`,
        }}
      />
    </div>
  );
}
