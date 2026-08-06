import { describe, expect, it } from "vitest";
import type { TopicDTO } from "../../dtos/topic-dto.js";
import { ListTopicsController } from "./list-topics-controller.js";

function buildRequest() {
  return { body: {}, headers: {}, pathParameters: {}, queryStringParameters: {} };
}

describe("ListTopicsController", () => {
  it("returns 200 with the topics from the use case", async () => {
    const topics: TopicDTO[] = [{ id: "topic-1", title: "Meio ambiente", color: "#2E7D32" }];
    const controller = new ListTopicsController(async () => topics);

    const response = await controller.execute(buildRequest());

    expect(response).toEqual({ statusCode: 200, body: topics });
  });
});
