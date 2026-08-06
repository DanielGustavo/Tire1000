/**
 * Seeds sample ThemeTopics (Eixos), Themes, and ReferenceTexts directly into the
 * DynamoDB table, bypassing the (deliberately read-only) application layer — cadastro
 * de temas/eixos é manual, direto no banco (see .scratch/tire1000-mvp/spec.md).
 *
 * Usage (run by a developer, never by an agent — this writes to the real table):
 *   TABLE_NAME=tire1000-dev-MainTable pnpm seed:themes
 *
 * For a local DynamoDB, also set AWS_ENDPOINT_URL (read natively by the AWS SDK), e.g.:
 *   TABLE_NAME=tire1000-local-MainTable AWS_ENDPOINT_URL=http://localhost:8000 pnpm seed:themes
 */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import KSUID from "ksuid";
import { Theme } from "../src/domain/entities/theme.js";
import { ThemeTopic } from "../src/domain/entities/theme-topic.js";
import { ReferenceText } from "../src/domain/entities/reference-text.js";
import { toThemeItem } from "../src/infra/db/dynamodb/items/theme-item.js";
import { toThemeTopicItem } from "../src/infra/db/dynamodb/items/theme-topic-item.js";
import { toReferenceTextItem } from "../src/infra/db/dynamodb/items/reference-text-item.js";

const tableName = process.env.TABLE_NAME;
if (!tableName) {
  throw new Error("TABLE_NAME env var is required, e.g. TABLE_NAME=tire1000-dev-MainTable pnpm seed:themes");
}

const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

async function id(): Promise<string> {
  return (await KSUID.random()).string;
}

async function main() {
  const now = new Date();

  const topics = [
    ThemeTopic.reconstitute({ id: await id(), title: "Meio ambiente", color: "#2E7D32", createdAt: now, updatedAt: now }),
    ThemeTopic.reconstitute({ id: await id(), title: "Tecnologia", color: "#1565C0", createdAt: now, updatedAt: now }),
    ThemeTopic.reconstitute({ id: await id(), title: "Cidadania", color: "#C62828", createdAt: now, updatedAt: now }),
  ];

  const themes = [
    Theme.reconstitute({
      id: await id(),
      title: "Desafios para a valorização de comunidades e povos tradicionais no Brasil",
      enemYear: 2023,
      topicId: topics[0]!.id,
      createdAt: now,
      updatedAt: now,
    }),
    Theme.reconstitute({
      id: await id(),
      title: "Invisibilidade e registro civil: garantia de acesso à cidadania no Brasil",
      enemYear: 2022,
      topicId: topics[2]!.id,
      createdAt: now,
      updatedAt: now,
    }),
    Theme.reconstitute({
      id: await id(),
      title: "Os desafios da regulação da inteligência artificial no Brasil",
      enemYear: null,
      topicId: topics[1]!.id,
      createdAt: now,
      updatedAt: now,
    }),
  ];

  const referenceTexts = [
    ReferenceText.reconstitute({
      id: await id(),
      title: "Texto motivador 1",
      font: "serif",
      paragraphs: [
        { type: "TEXT", content: "O reconhecimento de comunidades e povos tradicionais é um processo recente..." },
      ],
      themeId: themes[0]!.id,
      createdAt: now,
      updatedAt: now,
    }),
    ReferenceText.reconstitute({
      id: await id(),
      title: "Texto motivador 2",
      font: "serif",
      paragraphs: [{ type: "IMAGE", content: { fileKey: "seed/mapa-comunidades.png", font: "sans-serif" } }],
      themeId: themes[0]!.id,
      createdAt: now,
      updatedAt: now,
    }),
  ];

  for (const topic of topics) {
    await documentClient.send(new PutCommand({ TableName: tableName, Item: toThemeTopicItem(topic) }));
  }
  for (const theme of themes) {
    await documentClient.send(new PutCommand({ TableName: tableName, Item: toThemeItem(theme) }));
  }
  for (const referenceText of referenceTexts) {
    await documentClient.send(new PutCommand({ TableName: tableName, Item: toReferenceTextItem(referenceText) }));
  }

  console.log(`Seeded ${topics.length} topics, ${themes.length} themes, ${referenceTexts.length} reference texts.`);
}

main();
