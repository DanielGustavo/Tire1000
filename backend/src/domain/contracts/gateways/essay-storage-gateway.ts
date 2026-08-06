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
}
