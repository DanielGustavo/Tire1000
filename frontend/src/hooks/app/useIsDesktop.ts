import { useEffect, useState } from "react";

/** Matches Tailwind's default `lg:` breakpoint (see ticket 08's desktop-breakpoint decision). */
const DESKTOP_QUERY = "(min-width: 1024px)";

/** Tracks the `lg` viewport breakpoint live, so callers can react to a desktop/mobile crossing
 * without a page reload. Subscribes to the `MediaQueryList`'s `change` event rather than
 * `window.resize` — it only fires when the query's match state actually flips, avoiding
 * resize-storm re-renders. */
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(DESKTOP_QUERY).matches);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(DESKTOP_QUERY);
    setIsDesktop(mediaQueryList.matches);

    function handleChange(event: MediaQueryListEvent) {
      setIsDesktop(event.matches);
    }

    mediaQueryList.addEventListener("change", handleChange);
    return () => mediaQueryList.removeEventListener("change", handleChange);
  }, []);

  return isDesktop;
}
