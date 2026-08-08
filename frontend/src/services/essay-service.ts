import axios from "axios";
import { Service } from "./service";

export interface PresignedUpload {
  url: string;
  fields: Record<string, string>;
}

export interface UploadEssayResponse {
  essayId: string;
  upload: PresignedUpload;
}

export type EssayStatus =
  | "UPLOADING"
  | "QUEUED"
  | "UPLOAD_FAILED"
  | "VALIDATING"
  | "VALIDATION_FAILED"
  | "REJECTED"
  | "VALIDATED"
  | "EVALUATING"
  | "EVALUATION_FAILED"
  | "SUCCESS";

export interface Essay {
  id: string;
  status: EssayStatus;
  rejectionReasons: string[];
  themeId: string;
  themeTitle: string;
  topicColor: string;
  finalScore: number | null;
  createdAt: string;
}

export type CompetencyId = "C1" | "C2" | "C3" | "C4" | "C5";

export interface CompetencyScore {
  score: number;
  evaluationText: string;
}

export type EssayEvaluationScores = Record<CompetencyId, CompetencyScore> & { final: CompetencyScore };

export interface EssayHighlight {
  type: CompetencyId;
  anchorIndex: number;
  endIndex: number;
  /** Comentário do avaliador explicando por que esse trecho tirou nota ou merece atenção — mostrado ao passar o mouse sobre o destaque. */
  textContent: string;
}

export interface EssayEvaluation {
  scores: EssayEvaluationScores;
  highlights: EssayHighlight[];
}

export interface EssayDetail extends Essay {
  textContent: string | null;
  evaluation: EssayEvaluation | null;
}

export interface GetEssayDetailResponse {
  essay: EssayDetail;
}

export interface ListUserEssaysResponse {
  essays: Essay[];
}

export const REJECTION_REASON_LABELS: Record<string, string> = {
  NOT_AN_ESSAY: "A foto não é de uma redação",
  ILLEGIBLE_HANDWRITING: "Letra ilegível",
  LOW_LIGHTING: "Iluminação baixa",
  BLURRY_PHOTO: "Foto desfocada",
  INCOMPLETE_PHOTO: "Foto corta parte do texto",
  TOO_FEW_LINES: "Menos de 7 linhas",
  TOO_MANY_LINES: "Mais de 30 linhas",
};

// EVALUATION_FAILED is deliberately excluded — its credit isn't refunded (ADR-0001), so the fix is a DLQ
// redrive by the team, not a user resend.
export const RESENDABLE_STATUSES: EssayStatus[] = ["UPLOADING", "REJECTED", "UPLOAD_FAILED", "VALIDATION_FAILED"];

// The Correção result page (ticket 07) is only reachable while the essay is still going through the
// pipeline or once it succeeded — these 4 terminal non-success statuses redirect to Home instead (the
// Homepage card is where the user acts on them: resend, or nothing for EVALUATION_FAILED).
export const BLOCKED_ESSAY_RESULT_STATUSES: EssayStatus[] = ["REJECTED", "UPLOAD_FAILED", "VALIDATION_FAILED", "EVALUATION_FAILED"];

// Still going through the fila de Revisão.
export const VALIDATING_STATUSES: EssayStatus[] = ["UPLOADING", "QUEUED", "VALIDATING"];
// Revisão passed, still going through the fila de Avaliação.
export const EVALUATING_STATUSES: EssayStatus[] = ["VALIDATED", "EVALUATING"];
export const PENDING_STATUSES: EssayStatus[] = [...VALIDATING_STATUSES, ...EVALUATING_STATUSES];

// Score bands (0–1000, in steps of 200 — one per competência) mapped to the evaluated essay card's color,
// per the Figma mock. Colors match the DS tokens: primary-100, info-300, alert-100, pink-300, error-100.
const SCORE_BAND_COLORS: readonly [min: number, color: string][] = [
  [800, "#81EEB7"],
  [600, "#7AD3FF"],
  [400, "#FFED7A"],
  [200, "#EF80BD"],
  [0, "#EF8D80"],
];

export const COMPETENCY_IDS: CompetencyId[] = ["C1", "C2", "C3", "C4", "C5"];

// One color per competência, reused for its tag, its highlights in the essay text, and its evaluation
// card — matches the DS tokens (primary-100/alert-100/error-100/info-300/pink-300) per the Figma mock.
export const COMPETENCY_COLORS: Record<CompetencyId, string> = {
  C1: "#81EEB7",
  C2: "#FFED7A",
  C3: "#EF8D80",
  C4: "#7AD3FF",
  C5: "#EF80BD",
};

export const COMPETENCY_ROMAN_NUMERALS: Record<CompetencyId, string> = {
  C1: "I",
  C2: "II",
  C3: "III",
  C4: "IV",
  C5: "V",
};

export function scoreCardColor(score: number): string {
  return SCORE_BAND_COLORS.find(([min]) => score >= min)![1];
}

class EssayService extends Service {
  async upload(themeId: string): Promise<UploadEssayResponse> {
    const { data } = await this.client.post<UploadEssayResponse>("/essays", { themeId });
    return data;
  }

  async resend(essayId: string): Promise<UploadEssayResponse> {
    const { data } = await this.client.post<UploadEssayResponse>(`/essays/${essayId}`);
    return data;
  }

  async getById(essayId: string): Promise<GetEssayDetailResponse> {
    const { data } = await this.client.get<GetEssayDetailResponse>(`/essays/${essayId}`);
    return data;
  }

  async list(): Promise<ListUserEssaysResponse> {
    const { data } = await this.client.get<ListUserEssaysResponse>("/essays");
    return data;
  }

  /** Uploads the photo straight to S3 using the presigned POST — never goes through our API. */
  async uploadPhoto(upload: PresignedUpload, file: File): Promise<void> {
    const formData = new FormData();
    for (const [field, value] of Object.entries(upload.fields)) {
      formData.append(field, value);
    }
    formData.append("file", file);

    await axios.post(upload.url, formData);
  }
}

export const essayService = new EssayService();
