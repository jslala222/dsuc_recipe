// Path: src/app/reservations/error.tsx
// Description: 예약 페이지 전용 에러 핸들링

'use client';

import { useEffect } from 'react';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Reservation Error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
                예약 정보를 불러오는데 실패했습니다.
            </h2>
            <p className="text-gray-500 mb-6 max-w-sm">
                일시적인 오류일 수 있습니다.<br />
                잠시 후 다시 시도해 주세요.
            </p>
            <button
                onClick={() => reset()}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
            >
                <RefreshCcw className="w-5 h-5" />
                다시 시도하기
            </button>
        </div>
    );
}
