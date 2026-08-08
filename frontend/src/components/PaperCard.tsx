import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

type PaperCardProps = {
  className?: string;
  children: ReactNode;
};

// Matches the leading every text block inside a PaperCard must use (see HighlightedEssayText and the
// Nota final paragraph) — the ruled lines are sized in `em` off this same number so a line of text can
// never drift off its rule, no matter how long the card grows. A literal px line-height here would
// round differently than the browser's own line-box math and drift more with every line.
const LINE_HEIGHT_EM = 1.7;

// The scallop is one bump per circle, radius 12px (bottom half only — the SVG is exactly as tall as the
// radius, so each circle's top half falls outside the viewBox and never renders). Circles are real SVG
// elements, laid out explicitly by measuring the card's width, rather than a CSS/SVG tile pattern —
// neither `background-repeat` nor an SVG `<pattern>` has a "fixed gap, fixed margin floor, never crop a
// bump" mode (round resizes the bumps to fit; a plain tile just crops at a fixed pitch). Computing
// exactly how many whole circles fit is the only way to guarantee both the fixed 12px gap and the 21px
// minimum breathing margin at once, at any card width.
const SCALLOP_RADIUS_PX = 12;
const SCALLOP_STROKE_PX = 2;
const SCALLOP_DIAMETER_PX = SCALLOP_RADIUS_PX * 2;
const SCALLOP_GAP_PX = 12;
const SCALLOP_MIN_MARGIN_PX = 21;
const SCALLOP_PITCH_PX = SCALLOP_DIAMETER_PX + SCALLOP_GAP_PX;

// Below this, not even one bump fits inside the two margins — the overlay renders nothing and the
// straight border shows through on its own rather than trying to squeeze a bump in.
const SCALLOP_MIN_WIDTH_PX = SCALLOP_MIN_MARGIN_PX * 2 + SCALLOP_DIAMETER_PX;

function scallopCenters(width: number): number[] {
  if (width < SCALLOP_MIN_WIDTH_PX) return [];

  const available = width - SCALLOP_MIN_MARGIN_PX * 2;
  const count = Math.floor((available + SCALLOP_GAP_PX) / SCALLOP_PITCH_PX);
  const rowWidth = count * SCALLOP_DIAMETER_PX + (count - 1) * SCALLOP_GAP_PX;
  const margin = (width - rowWidth) / 2;

  return Array.from({ length: count }, (_, i) => margin + SCALLOP_RADIUS_PX + i * SCALLOP_PITCH_PX);
}

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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    setWidth(el.clientWidth);

    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full">
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
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0"
        width={width}
        height={SCALLOP_RADIUS_PX}
        style={{ overflow: "hidden" }}
      >
        {scallopCenters(width).map((cx) => (
          <circle
            key={cx}
            cx={cx}
            cy={0}
            r={SCALLOP_RADIUS_PX - SCALLOP_STROKE_PX / 2}
            fill="var(--color-neutral-0)"
            stroke="var(--color-neutral-900)"
            strokeWidth={SCALLOP_STROKE_PX}
          />
        ))}
      </svg>
    </div>
  );
}
