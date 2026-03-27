// Path: scripts/test-r2-direct.js
// Description: Cloudflare R2 연결 확인용 간단한 테스트 스크립트

const { S3Client, ListBucketsCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

async function testR2Connection() {
  console.log('🚀 Cloudflare R2 연결 테스트를 시작합니다...');

  // 1. 설정값 읽어오기
  const config = {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME,
  };

  if (!config.accountId || !config.accessKeyId || !config.secretAccessKey || !config.bucketName) {
    console.error('❌ 설정값(.env)이 부족합니다. 다음 항목을 확인하세요:');
    console.log(config);
    return;
  }

  // 2. R2 클라이언트(창고 도우미) 생성
  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  try {
    console.log('📦 R2 창고에 접속 시도 중...');
    
    // 3. 테스트용 파일 업로드 시도 (test-connection.txt)
    const command = new PutObjectCommand({
      Bucket: config.bucketName,
      Key: 'test-connection.txt',
      Body: 'Connection Test Success: ' + new Date().toISOString(),
      ContentType: 'text/plain',
    });

    await client.send(command);
    
    console.log('✅ 연결 성공! 창고 비어있는 공간에 테스트 파일을 업로드했습니다.');
    console.log(`🔗 버킷 이름: ${config.bucketName}`);
    console.log(`🌐 서비스 주소: ${process.env.R2_PUBLIC_URL}`);
    console.log('\n이제 이 창고를 실제로 사용해서 레시피 사진을 보관할 수 있습니다!');

  } catch (err) {
    console.error('❌ 연결 실패! 다음과 같은 문제가 발생했습니다:');
    console.error(err.message);
    if (err.name === 'InvalidAccessKeyId' || err.name === 'SignatureDoesNotMatch') {
      console.log('👉 힌트: .env 파일의 Access Key ID 또는 Secret Access Key가 틀린 것 같습니다.');
    } else if (err.name === 'NoSuchBucket') {
      console.log('👉 힌트: R2_BUCKET_NAME(' + config.bucketName + ')이 실제 R2 대시보드에 있는 이름과 다릅니다.');
    }
  }
}

testR2Connection();
