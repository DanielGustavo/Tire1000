import type {
  CreatePresignedUploadInput,
  EssayStorageGateway,
  PresignedUpload,
} from "../../../domain/contracts/gateways/essay-storage-gateway.js";

export class InMemoryEssayStorageGateway implements EssayStorageGateway {
  readonly createdUploads: CreatePresignedUploadInput[] = [];
  readonly deletedKeys: string[] = [];
  readonly objectsByKey = new Map<string, Buffer>();

  async createPresignedUpload(input: CreatePresignedUploadInput): Promise<PresignedUpload> {
    this.createdUploads.push(input);
    return { url: `https://s3.test/${input.key}`, fields: { key: input.key } };
  }

  async getObject(key: string): Promise<Buffer> {
    return this.objectsByKey.get(key) ?? Buffer.from(`fake-photo-bytes:${key}`);
  }

  async deleteObject(key: string): Promise<void> {
    this.deletedKeys.push(key);
    this.objectsByKey.delete(key);
  }
}
