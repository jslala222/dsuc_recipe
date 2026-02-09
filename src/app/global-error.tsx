// Path: src/app/global-error.tsx
// Description: 최상위 전역 에러 처리 컴포넌트 (html, body 포함)

'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen bg-wood-50 text-center p-4">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        치명적인 오류가 발생했습니다 😱
                    </h2>
                    <button
                        onClick={() => reset()}
                        className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
                    >
                        다시 시도하기
                    </button>
                </div>
            </body>
        </html>
    );
}
