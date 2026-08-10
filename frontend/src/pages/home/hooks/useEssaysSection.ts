import { useState } from "react";
import { useEssays } from "../../../hooks/queries/useEssays";

export function useEssaysSection() {
  // Every cursor visited so far, index 0 always undefined (first page). DynamoDB only paginates
  // forward, so "Anterior" is just popping back to a cursor already in this stack instead of
  // asking the backend for a "previous" page.
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([undefined]);
  const cursor = cursorStack[cursorStack.length - 1];

  const essaysQuery = useEssays(cursor);
  const essays = essaysQuery.data?.essays ?? [];
  const nextCursor = essaysQuery.data?.nextCursor;

  const hasPreviousPage = cursorStack.length > 1;
  const hasNextPage = Boolean(nextCursor);

  function goToNextPage() {
    if (!nextCursor) return;
    setCursorStack((stack) => [...stack, nextCursor]);
  }

  function goToPreviousPage() {
    setCursorStack((stack) => (stack.length > 1 ? stack.slice(0, -1) : stack));
  }

  return { essaysQuery, essays, hasPreviousPage, hasNextPage, goToNextPage, goToPreviousPage };
}
