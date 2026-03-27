// Path: src/app/api/upload/route.ts
// Description: 서버에서 Cloudflare R2에 이미지를 업로드하는 API 라우트
// 브라우저(클라이언트)는 이 API를 호출하고, 서버가 실제 R2 업로드를 처리합니다.

import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

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
        // 클라이언트에서 전송한 파일 데이터를 읽습니다.
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folder = (formData.get('folder') as string) || 'dsuc-recipe/steps';

        if (!file) {
            return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
        }

        // 파일명 생성 (타임스탬프 + 랜덤 문자열)
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
        const key = `${folder}/${fileName}`;

        // 파일을 ArrayBuffer로 변환 후 업로드
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            Body: uint8Array,
            ContentType: file.type,
        });

        await r2Client.send(command);

        // 업로드된 파일의 공개 URL 생성
        const publicUrl = process.env.R2_PUBLIC_URL
            ? `${process.env.R2_PUBLIC_URL}/${key}`
            : `https://${process.env.R2_BUCKET_NAME}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;

        return NextResponse.json({ url: publicUrl });

    } catch (error) {
        console.error('R2 업로드 API 에러:', error);
        return NextResponse.json({ error: '업로드 실패' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: '삭제할 파일 URL이 없습니다.' }, { status: 400 });
        }

        // URL에서 파일 키(Key) 추출
        // 예: https://pub-[id].r2.dev/dsuc-recipe/steps/177...jpg -> dsuc-recipe/steps/177...jpg
        const publicUrlPrefix = process.env.R2_PUBLIC_URL || '';
        let key = '';

        if (publicUrlPrefix && url.startsWith(publicUrlPrefix)) {
            key = url.slice(publicUrlPrefix.length + 1); // +1은 슬래시('/') 제거
        } else {
            // R2 기본 도메인이거나 다른 형식일 경우 URL 파싱 (간단한 폴백)
            try {
                const parsedUrl = new URL(url);
                key = parsedUrl.pathname.slice(1); // 앞에 붙은 '/' 제거
            } catch (e) {
                key = url;
            }
        }

        if (!key) {
            return NextResponse.json({ error: '유효하지 않은 URL입니다.' }, { status: 400 });
        }

        const command = new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: decodeURIComponent(key),
        });

        await r2Client.send(command);

        return NextResponse.json({ success: true, message: '파일이 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error('R2 삭제 API 에러:', error);
        return NextResponse.json({ error: '파일 삭제 실패' }, { status: 500 });
    }
}
