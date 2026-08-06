import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import type {
  CreatePresignedUploadInput,
  EssayStorageGateway,
  PresignedUpload,
} from "../../domain/contracts/gateways/essay-storage-gateway.js";

const PRESIGNED_UPLOAD_EXPIRES_IN_SECONDS = 300;

export class S3EssayStorageGateway implements EssayStorageGateway {
  constructor(
    private readonly bucketName: string = process.env.ESSAYS_BUCKET_NAME ?? "",
    private readonly client: S3Client = new S3Client({}),
  ) {}

  async createPresignedUpload({ key, maxSizeInBytes }: CreatePresignedUploadInput): Promise<PresignedUpload> {
    const { url, fields } = await createPresignedPost(this.client, {
      Bucket: this.bucketName,
      Key: key,
      Conditions: [["content-length-range", 0, maxSizeInBytes]],
      Expires: PRESIGNED_UPLOAD_EXPIRES_IN_SECONDS,
    });

    return { url, fields };
  }
}
