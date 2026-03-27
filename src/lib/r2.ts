import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * Cloudflare R2 클라이언트 설정
 * R2는 S3와 호환되는 API를 제공하므로 AWS SDK를 사용합니다.
 */
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

/**
 * 파일을 Cloudflare R2에 업로드합니다.
 * @param file 업로드할 파일 객체
 * @param folder 저장할 폴더 경로 (예: 'recipes/images')
 * @returns 업로드된 파일의 공개 URL
 */
export async function uploadToR2(file: File, folder: string = "uploads"): Promise<string> {
  const fileExtension = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
  const key = `${folder}/${fileName}`;

  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: uint8Array,
    ContentType: file.type,
  });

  try {
    await r2Client.send(command);
    // R2 버킷의 공개 도메인 또는 사용자 정의 도메인을 사용하여 URL 생성
    const publicUrl = process.env.R2_PUBLIC_URL 
      ? `${process.env.R2_PUBLIC_URL}/${key}`
      : `https://${process.env.R2_BUCKET_NAME}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
    
    return publicUrl;
  } catch (error) {
    console.error("R2 Upload Error:", error);
    throw error;
  }
}
