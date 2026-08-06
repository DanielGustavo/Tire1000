import { describe, expect, it } from "vitest";
import { Theme } from "../../../domain/entities/theme.js";
import { ThemeTopic } from "../../../domain/entities/theme-topic.js";
import type { ThemeWithTopic } from "../../use-cases/list-themes/list-themes.js";
import { ListThemesController } from "./list-themes-controller.js";

function buildRequest(queryStringParameters: Record<string, string | undefined> = {}) {
  return { body: {}, headers: {}, pathParameters: {}, queryStringParameters };
}

function buildTheme(): Theme {
  return Theme.reconstitute({
    id: "theme-1",
    title: "Educação financeira",
    enemYear: 2023,
    topicId: "topic-1",
    createdAt: new Date("2026-08-01T00:00:00.000Z"),
    updatedAt: new Date("2026-08-01T00:00:00.000Z"),
  });
}

function buildTopic(): ThemeTopic {
  return ThemeTopic.reconstitute({
    id: "topic-1",
    title: "Educação",
    color: "#2E7D32",
    createdAt: new Date("2026-08-01T00:00:00.000Z"),
    updatedAt: new Date("2026-08-01T00:00:00.000Z"),
  });
}

describe("ListThemesController", () => {
  it("returns 200 with the themes from the use case", async () => {
    const themes: ThemeWithTopic[] = [{ theme: buildTheme(), topic: buildTopic() }];
    const controller = new ListThemesController(async () => themes);

    const response = await controller.execute(buildRequest());

    expect(response).toEqual({ statusCode: 200, body: themes });
  });

  it("passes topicId and search from the query string to the use case", async () => {
    let receivedInput: unknown;
    const controller = new ListThemesController(async (input) => {
      receivedInput = input;
      return [];
    });

    await controller.execute(buildRequest({ topicId: "topic-1", search: "financeira" }));

    expect(receivedInput).toEqual({ topicId: "topic-1", search: "financeira" });
  });
});
