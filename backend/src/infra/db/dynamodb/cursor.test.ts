import { describe, expect, it } from "vitest";
import { decodeCursor, encodeCursor } from "./cursor.js";

describe("cursor", () => {
  it("round-trips a key through encode/decode", () => {
    const key = { PK: "USER#user-1", SK: "ESSAY#1zzz1" };

    expect(decodeCursor(encodeCursor(key))).toEqual(key);
  });

  it("rejects a cursor that isn't valid base64-encoded JSON", () => {
    expect(() => decodeCursor("not-a-valid-cursor!!!")).toThrow("Cursor de paginação inválido");
  });

  it("rejects a cursor that decodes to a non-object", () => {
    const cursor = Buffer.from(JSON.stringify(["not", "an", "object"])).toString("base64");

    expect(() => decodeCursor(cursor)).toThrow("Cursor de paginação inválido");
  });
});
