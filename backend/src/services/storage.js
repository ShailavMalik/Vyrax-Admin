import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env, hasR2Config } from "../config/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_UPLOAD_DIR = path.resolve(__dirname, "../../uploads");

let r2Client = null;

async function ensureLocalUploadDir() {
  await fs.mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
}

function createR2Client() {
  if (!hasR2Config()) {
    return null;
  }

  if (!r2Client) {
    r2Client = new S3Client({
      region: "auto",
      endpoint: env.cloudflareR2Endpoint,
      credentials: {
        accessKeyId: env.cloudflareR2AccessKeyId,
        secretAccessKey: env.cloudflareR2SecretAccessKey,
      },
    });
  }

  return r2Client;
}

function createStorageKey({ sessionId, emotion, timestamp }) {
  return `sessions/${sessionId}/snapshots/${timestamp}-${emotion}-${crypto.randomUUID()}.webp`;
}

export async function storeSnapshotAsset({
  buffer,
  sessionId,
  emotion,
  timestamp,
  baseUrl,
}) {
  const compressedBuffer = await sharp(buffer)
    .rotate()
    .resize({ width: 960, withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();

  const storageKey = createStorageKey({ sessionId, emotion, timestamp });
  const publicBaseUrl = env.cloudflareR2PublicUrl.replace(/\/$/, "");
  const remoteClient = createR2Client();

  if (remoteClient) {
    await remoteClient.send(
      new PutObjectCommand({
        Bucket: env.cloudflareR2Bucket,
        Key: storageKey,
        Body: compressedBuffer,
        ContentType: "image/webp",
      }),
    );

    return {
      storageProvider: "r2",
      storageKey,
      imageUrl: `${publicBaseUrl}/${storageKey}`,
    };
  }

  await ensureLocalUploadDir();
  const localFileName = storageKey.replace(/\//g, "__");
  const localFilePath = path.resolve(LOCAL_UPLOAD_DIR, localFileName);
  await fs.writeFile(localFilePath, compressedBuffer);

  const localBaseUrl = baseUrl.replace(/\/$/, "");
  return {
    storageProvider: "local",
    storageKey: localFileName,
    imageUrl: `${localBaseUrl}/uploads/${localFileName}`,
  };
}
