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
  createdAt: string;
}

export interface GetEssayDetailResponse {
  essay: Essay;
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
