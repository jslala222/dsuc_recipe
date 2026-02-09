// Path: src/lib/imageUtils.ts
// Description: 이미지 리사이즈 및 압축 유틸리티
// - 업로드 전 브라우저에서 이미지를 600px로 리사이즈하여 용량 절약

/**
 * 이미지 리사이즈 설정
 */
const IMAGE_CONFIG = {
    maxWidth: 600,       // 최대 가로 픽셀
    maxHeight: 600,      // 최대 세로 픽셀
    quality: 0.75,       // JPEG 품질 (0~1)
    mimeType: 'image/jpeg' as const,
};

/**
 * 파일을 받아서 리사이즈된 Blob을 반환합니다.
 * 
 * @param file - 원본 이미지 파일
 * @returns 리사이즈된 이미지 Blob과 미리보기 URL
 * 
 * @example
 * const { blob, previewUrl } = await resizeImage(file);
 * console.log(`원본: ${file.size} → 리사이즈: ${blob.size}`);
 */
export async function resizeImage(file: File): Promise<{
    blob: Blob;
    previewUrl: string;
    originalSize: number;
    newSize: number;
}> {
    return new Promise((resolve, reject) => {
        // 1. 파일을 읽어서 이미지로 변환
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                try {
                    // 2. 캔버스에 리사이즈해서 그리기
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    if (!ctx) {
                        reject(new Error('캔버스 생성에 실패했습니다.'));
                        return;
                    }

                    // 3. 비율 유지하면서 크기 계산
                    let { width, height } = img;

                    if (width > IMAGE_CONFIG.maxWidth) {
                        height = (height * IMAGE_CONFIG.maxWidth) / width;
                        width = IMAGE_CONFIG.maxWidth;
                    }

                    if (height > IMAGE_CONFIG.maxHeight) {
                        width = (width * IMAGE_CONFIG.maxHeight) / height;
                        height = IMAGE_CONFIG.maxHeight;
                    }

                    // 4. 캔버스 크기 설정 및 이미지 그리기
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    // 5. JPEG로 압축하여 Blob 생성
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error('이미지 압축에 실패했습니다.'));
                                return;
                            }

                            const previewUrl = URL.createObjectURL(blob);

                            resolve({
                                blob,
                                previewUrl,
                                originalSize: file.size,
                                newSize: blob.size,
                            });
                        },
                        IMAGE_CONFIG.mimeType,
                        IMAGE_CONFIG.quality
                    );
                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = () => {
                reject(new Error('이미지를 불러올 수 없습니다.'));
            };

            img.src = e.target?.result as string;
        };

        reader.onerror = () => {
            reject(new Error('파일을 읽을 수 없습니다.'));
        };

        reader.readAsDataURL(file);
    });
}

/**
 * 파일 크기를 읽기 좋은 형식으로 변환
 * 
 * @example
 * formatFileSize(1024) // "1.0 KB"
 * formatFileSize(1048576) // "1.0 MB"
 */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

/**
 * 이미지 파일인지 확인
 */
export function isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
}
