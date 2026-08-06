import type { PreTokenGenerationAuthenticationV2TriggerEvent } from "aws-lambda";
import { describe, expect, it } from "vitest";
import { handler } from "./pre-token-generation.js";

function buildEvent(userAttributes: Record<string, string>): PreTokenGenerationAuthenticationV2TriggerEvent {
  return {
    version: "2",
    region: "us-east-1",
    userPoolId: "us-east-1_fake",
    triggerSource: "TokenGeneration_Authentication",
    userName: "student@example.com",
    callerContext: { awsSdkVersion: "fake", clientId: "fake-client-id" },
    request: { userAttributes, groupConfiguration: {} },
    response: { claimsAndScopeOverrideDetails: {} },
  } as unknown as PreTokenGenerationAuthenticationV2TriggerEvent;
}

describe("pre-token-generation handler", () => {
  it("copies the custom:userId attribute into the access token's userId claim", async () => {
    const event = buildEvent({ sub: "cognito-sub-1", "custom:userId": "user-1" });

    const result = await handler(event, {} as never, () => {});

    expect(result?.response.claimsAndScopeOverrideDetails).toEqual({
      accessTokenGeneration: { claimsToAddOrOverride: { userId: "user-1" } },
    });
  });

  it("leaves the response untouched when custom:userId is missing", async () => {
    const event = buildEvent({ sub: "cognito-sub-1" });

    const result = await handler(event, {} as never, () => {});

    expect(result?.response.claimsAndScopeOverrideDetails).toEqual({});
  });
});
