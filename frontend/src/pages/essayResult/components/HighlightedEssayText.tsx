import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { COMPETENCY_COLORS, COMPETENCY_ROMAN_NUMERALS } from "../../../services/essayService";
import type { EssayHighlight } from "../../../types/essay";
import { useOnClickOutside } from "../../../hooks/app/useOnClickOutside";

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

const POPUP_WIDTH_PX = 260;
const VIEWPORT_MARGIN_PX = 12;

type PopupState = { key: number; top: number; left: number };

/**
 * The essay text with its Avaliação highlights marked. `EssayHighlight.textContent` is the corrector's
 * comment about the excerpt, not the excerpt itself (see CONTEXT.md) — this screen is mobile-first, so
 * there's no hover to reveal it; tapping/clicking a highlighted excerpt toggles the comment instead.
 *
 * A highlight can span several lines (it's a run of inline text, not a block), so its on-screen shape
 * isn't a single rectangle — the popup is positioned in the viewport from the highlight's last line
 * fragment (`getClientRects()`) instead of being CSS-anchored inside it, and clamped so it never runs
 * past the screen edge.
 */
export function HighlightedEssayText({ text, highlights }: { text: string; highlights: EssayHighlight[] }) {
  const [popup, setPopup] = useState<PopupState | null>(null);
  const popupRef = useRef<HTMLSpanElement>(null);
  const openMarkRef = useRef<HTMLElement>(null);

  // "Outside" is just the popup and the currently-open mark — not the whole essay `<p>` — so
  // clicking anywhere else in the essay text (not only outside the paragraph) closes the popup too.
  useOnClickOutside([popupRef, openMarkRef], () => setPopup(null), popup !== null);

  // Extra to the click-outside pattern: this popup is viewport-positioned (not CSS-anchored to its
  // mark), so it also needs to close on scroll/resize or it'd drift away from the text it points at.
  useEffect(() => {
    if (!popup) return;
    function close() {
      setPopup(null);
    }
    window.addEventListener("scroll", close, { passive: true, capture: true });
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [popup]);

  const segments = buildHighlightedTextSegments(text, highlights);

  function togglePopup(target: HTMLElement, key: number) {
    if (popup?.key === key) {
      setPopup(null);
      return;
    }
    const rects = target.getClientRects();
    const anchor = rects[rects.length - 1] ?? target.getBoundingClientRect();
    const left = Math.min(Math.max(anchor.left, VIEWPORT_MARGIN_PX), window.innerWidth - POPUP_WIDTH_PX - VIEWPORT_MARGIN_PX);
    setPopup({ key, top: anchor.bottom + 4, left });
  }

  const openSegment = popup ? segments.find((segment) => segment.key === popup.key) : undefined;

  return (
    <p className="whitespace-pre-line text-default leading-[1.7] text-neutral-900">
      {segments.map((segment) =>
        segment.highlight ? (
          <mark
            key={segment.key}
            ref={popup?.key === segment.key ? openMarkRef : undefined}
            role="button"
            tabIndex={0}
            aria-expanded={popup?.key === segment.key}
            className="cursor-pointer"
            style={{ backgroundColor: COMPETENCY_COLORS[segment.highlight.type] }}
            onClick={(event: MouseEvent<HTMLElement>) => togglePopup(event.currentTarget, segment.key)}
            onKeyDown={(event: KeyboardEvent<HTMLElement>) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              togglePopup(event.currentTarget, segment.key);
            }}
          >
            {segment.text}
          </mark>
        ) : (
          <span key={segment.key}>{segment.text}</span>
        ),
      )}
      {popup && openSegment?.highlight && (
        <span
          ref={popupRef}
          className="fixed z-20 flex flex-col gap-2 border-2 border-solid border-neutral-900 p-3 text-left font-normal leading-[1.2] shadow-hard"
          style={{ top: popup.top, left: popup.left, width: POPUP_WIDTH_PX, backgroundColor: COMPETENCY_COLORS[openSegment.highlight.type] }}
        >
          <span className="font-bold text-neutral-900">Competência {COMPETENCY_ROMAN_NUMERALS[openSegment.highlight.type]}</span>
          <span className="text-neutral-900">{openSegment.highlight.textContent}</span>
        </span>
      )}
    </p>
  );
}
