// Path: src/app/api/upload/route.ts
// Description: 서버에서 Cloudflare R2에 이미지를 업로드하는 API 라우트
// 브라우저(클라이언트)는 이 API를 호출하고, 서버가 실제 R2 업로드를 처리합니다.

import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// R2 클라이언트는 서버에서만 실행되므로 환경변수에 안전하게 접근 가능
const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
});

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folder = (formData.get('folder') as string) || 'dsuc-recipe/steps';

        if (!file) {
            return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
        }

        const fileExtension = file.name.split('.').pop() || 'jpg';
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

        await r2Client.send(command);

        const publicUrl = process.env.R2_PUBLIC_URL
            ? `${process.env.R2_PUBLIC_URL}/${key}`
            : `https://${process.env.R2_BUCKET_NAME}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;

        return NextResponse.json({ url: publicUrl });

    } catch (error) {
        console.error('R2 업로드 API 에러:', error);
        return NextResponse.json({ error: '업로드 실패' }, { status: 500 });
    }
}
