// Path: src/app/error.tsx
// Description: 전역 에러 처리 컴포넌트

'use client';

import { useEffect } from 'react';
import { ChefHat } from 'lucide-react';

export default function Error({
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
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <ChefHat className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                문제가 발생했어요! 😢
            </h2>
            <p className="text-gray-600 mb-6 max-w-md">
                페이지를 불러오는 중에 오류가 생겼습니다.<br />
                잠시 후 다시 시도해 주세요.
            </p>
            <div className="flex gap-3">
                <button
                    onClick={() => reset()}
                    className="px-6 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
                >
                    다시 시도하기
                </button>
                <button
                    onClick={() => window.location.href = '/'}
                    className="px-6 py-2.5 bg-white border border-wood-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                    홈으로 가기
                </button>
            </div>
        </div>
    );
}
