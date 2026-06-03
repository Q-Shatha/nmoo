import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { extname } from "path";
import { Readable } from "stream";

type UploadedProductAsset = {
  key: string;
  url: string;
};

type UploadedAssetStream = {
  body: Readable;
  contentType: string;
};

@Injectable()
export class ProductAssetsService {
  private readonly bucket = process.env.AWS_S3_BUCKET;
  private readonly region = process.env.AWS_REGION;
  private readonly publicBaseUrl = process.env.PUBLIC_ASSET_BASE_URL ?? process.env.BACKEND_PUBLIC_URL;
  private readonly s3 =
    this.region && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? new S3Client({
          region: this.region,
          requestChecksumCalculation: "WHEN_REQUIRED",
          responseChecksumValidation: "WHEN_REQUIRED",
        })
      : null;

  async uploadProductImage(file: Express.Multer.File, vendorId: string): Promise<UploadedProductAsset> {
    return this.uploadImage(file, `products/${vendorId}`);
  }

  async uploadUserAvatar(file: Express.Multer.File, userId: string): Promise<UploadedProductAsset> {
    return this.uploadImage(file, `avatars/${userId}`);
  }

  private async uploadImage(file: Express.Multer.File, directory: string): Promise<UploadedProductAsset> {
    if (!file) {
      throw new BadRequestException("Image file is required");
    }

    if (!this.s3 || !this.bucket || !this.region) {
      throw new ServiceUnavailableException("S3 upload is not configured");
    }

    const extension = extname(file.originalname).toLowerCase() || this.extensionFromMimeType(file.mimetype);
    const key = `${directory}/${randomUUID()}${extension}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return {
      key,
      url: this.buildProxyUrl(key),
    };
  }

  async resolveAssetUrl(value: string | null | undefined) {
    if (!value) {
      return value ?? null;
    }

    const key = this.extractAssetKey(value);

    if (!key) {
      return value;
    }

    return this.buildProxyUrl(key);
  }

  async createPresignedAssetUrl(key: string) {
    if (!this.s3 || !this.bucket) {
      return this.buildProxyUrl(key);
    }

    return getSignedUrl(
      this.s3,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
      {
        expiresIn: Number(process.env.S3_PRESIGNED_URL_EXPIRES_SECONDS ?? 3600),
      },
    );
  }

  async getUploadedAsset(encodedKey: string): Promise<UploadedAssetStream> {
    if (!this.s3 || !this.bucket) {
      throw new ServiceUnavailableException("S3 asset delivery is not configured");
    }

    const key = this.decodeAssetKey(encodedKey);

    try {
      const signedUrl = await this.createPresignedAssetUrl(key);
      const object = await fetch(signedUrl);
      const body = object.body ? Readable.fromWeb(object.body as Parameters<typeof Readable.fromWeb>[0]) : undefined;

      if (!object.ok || !body) {
        throw new NotFoundException("Asset was not found");
      }

      return {
        body,
        contentType: object.headers.get("content-type") ?? "application/octet-stream",
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new NotFoundException("Asset was not found");
    }
  }

  private buildProxyUrl(key: string) {
    if (this.publicBaseUrl) {
      return `${this.publicBaseUrl.replace(/\/$/, "")}/${this.encodeAssetKey(key)}`;
    }

    const port = process.env.PORT ?? 5000;
    return `http://localhost:${port}/api/assets/${this.encodeAssetKey(key)}`;
  }

  private extractAssetKey(value: string) {
    const directS3Key = this.extractS3Key(value);

    if (directS3Key) {
      return directS3Key;
    }

    const proxyKey = this.extractProxyKey(value);

    if (proxyKey) {
      return proxyKey;
    }

    return null;
  }

  private extractS3Key(value: string) {
    if (!this.bucket || !this.region) {
      return null;
    }

    const s3BaseUrls = [
      `https://${this.bucket}.s3.${this.region}.amazonaws.com/`,
      `https://s3.${this.region}.amazonaws.com/${this.bucket}/`,
    ];

    const matchingBaseUrl = s3BaseUrls.find((baseUrl) => value.startsWith(baseUrl));

    if (!matchingBaseUrl) {
      return null;
    }

    return decodeURIComponent(value.slice(matchingBaseUrl.length).split("?")[0] ?? "");
  }

  private extractProxyKey(value: string) {
    const marker = "/api/assets/";
    const markerIndex = value.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    const encodedKey = value.slice(markerIndex + marker.length).split("?")[0];
    return this.decodeAssetKey(encodedKey);
  }

  private encodeAssetKey(key: string) {
    return Buffer.from(key, "utf8").toString("base64url");
  }

  private decodeAssetKey(encodedKey: string) {
    try {
      const key = Buffer.from(encodedKey, "base64url").toString("utf8");

      if (!key || key.includes("..")) {
        throw new Error("Invalid key");
      }

      return key;
    } catch {
      throw new BadRequestException("Invalid asset key");
    }
  }

  private extensionFromMimeType(mimeType: string) {
    if (mimeType === "image/png") {
      return ".png";
    }

    if (mimeType === "image/webp") {
      return ".webp";
    }

    return ".jpg";
  }
}
