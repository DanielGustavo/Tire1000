import { describe, expect, it } from "vitest";
import { ThemeTopic } from "../../../domain/entities/theme-topic.js";
import { ListTopicsController } from "./list-topics-controller.js";

function buildRequest() {
  return { body: {}, headers: {}, pathParameters: {}, queryStringParameters: {} };
}

describe("ListTopicsController", () => {
  it("returns 200 with the topics from the use case", async () => {
    const topics = [
      ThemeTopic.reconstitute({
        id: "topic-1",
        title: "Meio ambiente",
        color: "#2E7D32",
        createdAt: new Date("2026-08-01T00:00:00.000Z"),
        updatedAt: new Date("2026-08-01T00:00:00.000Z"),
      }),
    ];
    const controller = new ListTopicsController(async () => topics);

    const response = await controller.execute(buildRequest());

    expect(response).toEqual({ statusCode: 200, body: topics });
  });
});
