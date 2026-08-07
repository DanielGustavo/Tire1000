export interface PresignedUpload {
  url: string;
  fields: Record<string, string>;
}

export interface CreatePresignedUploadInput {
  key: string;
  maxSizeInBytes: number;
}

export interface EssayStorageGateway {
  /** A presigned S3 POST the client uploads the essay photo to directly — Lambda never sees the file. */
  createPresignedUpload(input: CreatePresignedUploadInput): Promise<PresignedUpload>;
  /** Fetches the essay photo's bytes — ValidateEssay's input to the Gemini gateway. */
  getObject(key: string): Promise<Buffer>;
  /** Removes the essay photo once Revisão finishes, with or without success (spec's story 20). */
  deleteObject(key: string): Promise<void>;
}
