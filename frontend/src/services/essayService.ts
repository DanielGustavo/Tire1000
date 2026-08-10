import axios from "axios";
import { Service } from "./service";
import type { CompetencyId, Essay, EssayDetail, EssayStatus } from "../types/essay";

export interface PresignedUpload {
  url: string;
  fields: Record<string, string>;
}

export interface UploadEssayResponse {
  essayId: string;
  upload: PresignedUpload;
}

export interface GetEssayDetailResponse {
  essay: EssayDetail;
}

export interface ListUserEssaysResponse {
  essays: Essay[];
  nextCursor?: string;
}

export interface ListEssaysParams {
  cursor?: string;
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

// The backend refunds ESSAY_CREDIT_COST when the fila de Revisão rejects the photo or gives up
// retrying it (`validate-essay.ts`). EVALUATION_FAILED is deliberately excluded — no refund there
// (ADR-0001), same reasoning as `RESENDABLE_STATUSES` above.
export const REFUNDING_STATUSES: EssayStatus[] = ["REJECTED", "VALIDATION_FAILED"];

// Whether the essay's status transition means the `/me` credits balance may now be stale. The debit
// itself happens out-of-band (an S3 upload-completed event, not the `POST /essays`/`POST /essays/:id`
// response), so it can't be invalidated right when the submit/resend mutation resolves — that fires
// before the event even reaches the backend. Instead this is checked against the essay's *polled*
// status: leaving UPLOADING is when the backend attempts the debit (`enqueue-essay-validation.ts`,
// either succeeding into QUEUED or failing into UPLOAD_FAILED with no debit applied — invalidating
// either way is harmless), and a pending essay reaching a `REFUNDING_STATUSES` status is a refund.
export function essayCreditsMayHaveChanged(previousStatus: EssayStatus, currentStatus: EssayStatus): boolean {
  if (previousStatus === currentStatus) return false;
  if (previousStatus === "UPLOADING") return true;
  return PENDING_STATUSES.includes(previousStatus) && REFUNDING_STATUSES.includes(currentStatus);
}

// Short heading for the Correção result page while pending — used by PendingResult's sticky note and,
// on desktop (ticket 13), repeated by the score sidebar's skeleton placeholder next to each "???".
export function pendingResultHeading(status: EssayStatus): string {
  return VALIDATING_STATUSES.includes(status) ? "Analisando a foto" : "Corrigindo sua redação";
}

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

  async list(params: ListEssaysParams = {}): Promise<ListUserEssaysResponse> {
    const { data } = await this.client.get<ListUserEssaysResponse>("/essays", { params });
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
