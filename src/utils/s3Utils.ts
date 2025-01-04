import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import sharp from "sharp";
import AppError from "@utils/appError";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function ensureEnvVars() {
  const { BUCKET_REGION, ACCESS_KEY, SECRET_ACCESS_KEY, BUCKET_NAME } =
    process.env;
  if (!BUCKET_REGION || !ACCESS_KEY || !SECRET_ACCESS_KEY || !BUCKET_NAME) {
    throw new AppError("AWS credentials and bucket name are required", 400);
  }
}

export async function getPhotoUrl(key: string) {
  const s3 = getS3Client();
  const command = new GetObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: key,
  });
  return getSignedUrl(s3, command, { expiresIn: 86400 });
}

function getS3Client(): S3Client {
  ensureEnvVars();
  return new S3Client({
    region: process.env.BUCKET_REGION!,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY!,
      secretAccessKey: process.env.SECRET_ACCESS_KEY!,
    },
  });
}

export async function deleteS3Object(key: string) {
  ensureEnvVars();
  const { BUCKET_NAME } = process.env;
  if (!BUCKET_NAME) {
    throw new AppError("Bucket name is missing!", 500);
  }
  const s3 = getS3Client();
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
}

export async function uploadResizedImage(
  file: Express.Multer.File,
  id: string
) {
  ensureEnvVars();
  const s3 = getS3Client();
  const { BUCKET_NAME } = process.env;

  const buffer = await sharp(file.buffer)
    .resize({ width: 500, height: 500, fit: "cover" })
    .toBuffer();

  const photo = `user-${id}-${Date.now()}.jpeg`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME!,
      Key: photo,
      Body: buffer,
      ContentType: file.mimetype,
    })
  );

  return { photo };
}
