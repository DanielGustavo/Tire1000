import { useEffect, useRef, useState } from "react";
import { COMPETENCY_COLORS, COMPETENCY_ROMAN_NUMERALS, type EssayHighlight } from "../../../services/essay-service";

interface HighlightedTextSegment {
  key: number;
  text: string;
  highlight: EssayHighlight | null;
}

/** Splits `text` around non-overlapping highlight ranges, sorted by position — later overlapping ranges are dropped. */
function buildHighlightedTextSegments(text: string, highlights: EssayHighlight[]): HighlightedTextSegment[] {
  const sorted = [...highlights].sort((a, b) => a.anchorIndex - b.anchorIndex);
  const segments: HighlightedTextSegment[] = [];
  let cursor = 0;
  let key = 0;

  for (const highlight of sorted) {
    if (highlight.anchorIndex < cursor) continue;
    if (highlight.anchorIndex > cursor) segments.push({ key: key++, text: text.slice(cursor, highlight.anchorIndex), highlight: null });
    segments.push({ key: key++, text: text.slice(highlight.anchorIndex, highlight.endIndex), highlight });
    cursor = highlight.endIndex;
  }

  if (cursor < text.length) segments.push({ key: key++, text: text.slice(cursor), highlight: null });
  return segments;
}

/**
 * The essay text with its Avaliação highlights marked. `EssayHighlight.textContent` is the corrector's
 * comment about the excerpt, not the excerpt itself (see CONTEXT.md) — this screen is mobile-first, so
 * there's no hover to reveal it; tapping/clicking a highlighted excerpt toggles the comment instead.
 */
export function HighlightedEssayText({ text, highlights }: { text: string; highlights: EssayHighlight[] }) {
  const [openKey, setOpenKey] = useState<number | null>(null);
  const rootRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (openKey === null) return;
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpenKey(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openKey]);

  const segments = buildHighlightedTextSegments(text, highlights);

  return (
    <p ref={rootRef} className="whitespace-pre-line text-default leading-[1.7] text-neutral-900">
      {segments.map((segment) => {
        if (!segment.highlight) return <span key={segment.key}>{segment.text}</span>;

        const color = COMPETENCY_COLORS[segment.highlight.type];
        const isOpen = openKey === segment.key;

        return (
          <span key={segment.key} className="relative">
            <mark
              role="button"
              tabIndex={0}
              aria-expanded={isOpen}
              className="cursor-pointer"
              style={{ backgroundColor: color }}
              onClick={() => setOpenKey(isOpen ? null : segment.key)}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                setOpenKey(isOpen ? null : segment.key);
              }}
            >
              {segment.text}
            </mark>
            {isOpen && (
              <span
                className="absolute left-0 top-full z-10 mt-1 flex w-[min(280px,80vw)] flex-col gap-2 border-2 border-solid border-neutral-900 p-3 text-left font-normal leading-[1.2] shadow-hard"
                style={{ backgroundColor: color }}
              >
                <span className="font-bold text-neutral-900">Competência {COMPETENCY_ROMAN_NUMERALS[segment.highlight.type]}</span>
                <span className="text-neutral-900">{segment.highlight.textContent}</span>
              </span>
            )}
          </span>
        );
      })}
    </p>
  );
}
