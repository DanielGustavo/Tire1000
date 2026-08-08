/**
 * Seeds ThemeTopics (Eixos), Themes, and ReferenceTexts directly into the DynamoDB table,
 * bypassing the (deliberately read-only) application layer — cadastro de temas/eixos é
 * manual, direto no banco (see .scratch/tire1000-mvp/spec.md).
 *
 * Theme/reference-text content comes from `scripts/seed-data/enem-temas/*.json`, scraped
 * from provas reais do ENEM (see backend/scripts/seed-data/enem-temas). Eixos are the 8
 * canonical ones defined for the product; colors reuse the DS palette (frontend/src/index.css)
 * since there's no eixo-specific color in Figma.
 *
 * Usage (run by a developer, never by an agent — this writes to the real table):
 *   TABLE_NAME=tire1000-dev-MainTable pnpm seed:themes
 *
 * For a local DynamoDB, also set AWS_ENDPOINT_URL (read natively by the AWS SDK), e.g.:
 *   TABLE_NAME=tire1000-local-MainTable AWS_ENDPOINT_URL=http://localhost:8000 pnpm seed:themes
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import KSUID from "ksuid";
import { Theme } from "../src/domain/entities/theme.js";
import { ThemeTopic } from "../src/domain/entities/theme-topic.js";
import { ReferenceText, ReferenceTextParagraph } from "../src/domain/entities/reference-text.js";
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

// Os 8 eixos canônicos do produto. Cores reaproveitadas da paleta do DS (frontend/src/index.css)
// já que não existe uma cor de eixo definida no Figma.
const TOPIC_COLORS: Record<string, string> = {
  "Sociedade, Cultura e Comportamento": "#EF80BD", // pink-300
  "Ciência e Tecnologia": "#7AD3FF", // info-300
  "Educação": "#25E283", // primary-300
  "Meio Ambiente e Sustentabilidade": "#81EEB7", // primary-100
  "Saúde e Bem-Estar": "#FFED7A", // alert-100
  "Direitos Humanos e Minorias": "#EF8D80", // error-100
  "Economia, Trabalho e Desenvolvimento": "#FFE01A", // alert-300
  "Segurança Pública e Violência": "#E33A24", // error-300
};

interface EnemReferenceTextJson {
  title: string;
  font?: string;
  paragraphs: ReferenceTextParagraph[];
}

interface EnemThemeJson {
  title: string;
  enemYear: number | null;
  topic: string;
  referenceTexts: EnemReferenceTextJson[];
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const enemThemesDir = join(__dirname, "seed-data", "enem-temas");

function loadEnemThemes(): EnemThemeJson[] {
  return readdirSync(enemThemesDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => JSON.parse(readFileSync(join(enemThemesDir, file), "utf-8")) as EnemThemeJson);
}

async function main() {
  const now = new Date();
  const enemThemesJson = loadEnemThemes();

  const topicNames = [...new Set(enemThemesJson.map((theme) => theme.topic))];
  const topicsByName = new Map<string, ThemeTopic>();
  for (const name of topicNames) {
    const color = TOPIC_COLORS[name];
    if (!color) throw new Error(`Cor não definida para o eixo "${name}" — atualize TOPIC_COLORS.`);
    topicsByName.set(name, ThemeTopic.reconstitute({ id: await id(), title: name, color, createdAt: now, updatedAt: now }));
  }
  const topics = [...topicsByName.values()];

  const themes: Theme[] = [];
  const referenceTexts: ReferenceText[] = [];

  for (const themeJson of enemThemesJson) {
    const topic = topicsByName.get(themeJson.topic);
    if (!topic) throw new Error(`Eixo "${themeJson.topic}" não encontrado para o tema "${themeJson.title}".`);

    const theme = Theme.reconstitute({
      id: await id(),
      title: themeJson.title,
      enemYear: themeJson.enemYear,
      topicId: topic.id,
      createdAt: now,
      updatedAt: now,
    });
    themes.push(theme);

    for (const referenceTextJson of themeJson.referenceTexts) {
      referenceTexts.push(
        ReferenceText.reconstitute({
          id: await id(),
          title: referenceTextJson.title,
          font: referenceTextJson.font ?? "",
          paragraphs: referenceTextJson.paragraphs,
          themeId: theme.id,
          createdAt: now,
          updatedAt: now,
        }),
      );
    }
  }

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
