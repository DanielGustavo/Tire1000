import type { PreTokenGenerationV2TriggerHandler } from "aws-lambda";

// Copies the internal User id (stored as the `custom:userId` Cognito attribute at signup) into
// the access token as a `userId` claim — no DynamoDB lookup needed (see ADR-0008).
export const handler: PreTokenGenerationV2TriggerHandler = async (event) => {
  const userId = event.request.userAttributes["custom:userId"];
  if (userId) {
    event.response.claimsAndScopeOverrideDetails = {
      accessTokenGeneration: { claimsToAddOrOverride: { userId } },
    };
  }

  return event;
};
