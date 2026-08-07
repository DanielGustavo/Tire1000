import { describe, expect, it } from "vitest";
import { locateHighlight } from "./locate-highlight.js";

describe("locateHighlight", () => {
  it("returns the character range of the first occurrence of the excerpt", () => {
    expect(locateHighlight("O acesso à educação é um direito de todos.", "direito de todos")).toEqual({
      anchorIndex: 25,
      endIndex: 41,
    });
  });

  it("returns null when the excerpt doesn't occur verbatim in the text (model paraphrased instead of quoting)", () => {
    expect(locateHighlight("O acesso à educação é um direito.", "direito à educação")).toBeNull();
  });

  it("returns null for an empty excerpt", () => {
    expect(locateHighlight("Algum texto.", "")).toBeNull();
  });

  it("locates only the first occurrence when the excerpt repeats", () => {
    expect(locateHighlight("educação, educação, educação", "educação")).toEqual({ anchorIndex: 0, endIndex: 8 });
  });
});
