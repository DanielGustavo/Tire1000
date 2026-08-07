export interface LocatedHighlight {
  anchorIndex: number;
  endIndex: number;
}

/**
 * Finds `excerpt` (a quote Gemini claims is literal) inside `text` and returns its character range.
 * Asking the model to also compute the range itself is unreliable (LLMs are bad at counting
 * characters) — locating a substring the model already quoted verbatim is deterministic and testable.
 * Returns `null` when the excerpt isn't found (empty excerpt, or the model paraphrased instead of
 * quoting) — callers drop those highlights rather than storing a bogus range.
 */
export function locateHighlight(text: string, excerpt: string): LocatedHighlight | null {
  if (!excerpt) return null;

  const anchorIndex = text.indexOf(excerpt);
  if (anchorIndex === -1) return null;

  return { anchorIndex, endIndex: anchorIndex + excerpt.length };
}
