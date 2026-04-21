import "dotenv/config";

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 8080),
  host: process.env.HOST ?? "0.0.0.0",
  mongoUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/vyrax-admin",
  publicAppUrl: process.env.PUBLIC_APP_URL ?? "",
  apiBaseUrl: process.env.API_BASE_URL ?? "",
  storageProvider: process.env.STORAGE_PROVIDER ?? "azure",
  azureStorageConnectionString:
    process.env.AZURE_STORAGE_CONNECTION_STRING ?? "",
  azureStorageContainerName: process.env.AZURE_STORAGE_CONTAINER_NAME ?? "",
  azureStoragePublicUrl: process.env.AZURE_STORAGE_PUBLIC_URL ?? "",
  cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID ?? "",
  cloudflareR2AccessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ?? "",
  cloudflareR2SecretAccessKey:
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ?? "",
  cloudflareR2Bucket: process.env.CLOUDFLARE_R2_BUCKET ?? "",
  cloudflareR2PublicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL ?? "",
  cloudflareR2Endpoint: process.env.CLOUDFLARE_R2_ENDPOINT ?? "",
};

export function hasAzureBlobConfig() {
  return Boolean(
    env.azureStorageConnectionString &&
    env.azureStorageContainerName &&
    env.azureStoragePublicUrl,
  );
}

export function hasR2Config() {
  return Boolean(
    env.cloudflareAccountId &&
    env.cloudflareR2AccessKeyId &&
    env.cloudflareR2SecretAccessKey &&
    env.cloudflareR2Bucket &&
    env.cloudflareR2PublicUrl &&
    env.cloudflareR2Endpoint,
  );
}
