import type {
  CreatePresignedUploadInput,
  EssayStorageGateway,
  PresignedUpload,
} from "../../../domain/contracts/gateways/essay-storage-gateway.js";

export class InMemoryEssayStorageGateway implements EssayStorageGateway {
  readonly createdUploads: CreatePresignedUploadInput[] = [];

  async createPresignedUpload(input: CreatePresignedUploadInput): Promise<PresignedUpload> {
    this.createdUploads.push(input);
    return { url: `https://s3.test/${input.key}`, fields: { key: input.key } };
  }
}
