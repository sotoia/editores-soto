import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
export const R2_BUCKET = process.env.R2_BUCKET || "editores-soto";
export const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL || "";

function getClient() {
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("Missing R2 env vars (R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY)");
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export async function signUploadUrl(key: string, contentType: string, expiresIn = 600) {
  const cmd = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(getClient(), cmd, { expiresIn });
}

export async function signDownloadUrl(key: string, expiresIn = 3600) {
  const cmd = new GetObjectCommand({ Bucket: R2_BUCKET, Key: key });
  return getSignedUrl(getClient(), cmd, { expiresIn });
}
