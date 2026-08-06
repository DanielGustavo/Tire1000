import { describe, expect, it } from "vitest";
import { decodeS3ObjectKey } from "./enqueue-essay-validation.js";

describe("decodeS3ObjectKey", () => {
  it("decodes percent-encoded characters", () => {
    expect(decodeS3ObjectKey("essays/foo%20bar")).toBe("essays/foo bar");
  });

  it("decodes '+' as a space, matching S3's event-notification encoding", () => {
    expect(decodeS3ObjectKey("essays/foo+bar")).toBe("essays/foo bar");
  });

  it("leaves an already-plain key untouched", () => {
    expect(decodeS3ObjectKey("essays/essay-1")).toBe("essays/essay-1");
  });
});
