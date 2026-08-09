import { useEffect, type RefObject } from "react";

/**
 * Closes/dismisses something when a `mousedown` lands outside the given element(s). Extracted from
 * the "fechar ao clicar fora" pattern duplicated across `UserMenu`, `Select` and
 * `HighlightedEssayText` (see ticket 09 in `.scratch/frontend-structure/`).
 *
 * `ref` accepts either one element or a list of elements — a click is "outside" only if it lands
 * outside all of them. `Select` needs the list form: its options popup is portaled to
 * `document.body`, so it isn't a DOM descendant of the trigger's ref, but a mousedown on an option
 * must still count as "inside".
 */
export function useOnClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null> | RefObject<T | null>[],
  onOutsideClick: () => void,
  active: boolean,
) {
  useEffect(() => {
    if (!active) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const refs = Array.isArray(ref) ? ref : [ref];
      const isInside = refs.some((r) => r.current?.contains(target));
      if (!isInside) onOutsideClick();
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, onOutsideClick, active]);
}
