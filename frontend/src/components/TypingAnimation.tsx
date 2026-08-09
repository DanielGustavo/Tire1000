import { useEffect, useState } from "react";

const DOT_STATES = ["", ".", "..", "..."];
const INTERVAL_MS = 500;

export function TypingAnimation() {
  const [dotIndex, setDotIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotIndex((current) => (current + 1) % DOT_STATES.length);
    }, INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return <span>{DOT_STATES[dotIndex]}</span>;
}
