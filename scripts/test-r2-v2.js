require('dotenv').config();
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require('fs');

async function testR2() {
  console.log("--- Cloudflare R2 연결 테스트 시작 ---");
  
  const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });

  const bucketName = process.env.R2_BUCKET_NAME;
  const testKey = `test-upload-${Date.now()}.txt`;
  
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: testKey,
      Body: "Hello R2! This is a test upload from Antigravity.",
      ContentType: "text/plain",
    });

    await r2Client.send(command);
    console.log("✅ 성공: 파일이 R2 버킷에 업로드되었습니다.");
    
    const publicUrl = process.env.R2_PUBLIC_URL 
      ? `${process.env.R2_PUBLIC_URL}/${testKey}`
      : `https://${process.env.R2_BUCKET_NAME}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${testKey}`;
    
    console.log("🔗 공개 URL:", publicUrl);
  } catch (error) {
    console.error("❌ 실패: R2 업로드 중 오류가 발생했습니다.");
    console.error(error);
  }
}

testR2();
