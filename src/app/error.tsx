
'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅
    console.error('Next.js Global Error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10" />
      </div>
      
      <h1 className="text-2xl font-bold text-gray-800 mb-2">문제가 발생했습니다</h1>
      <p className="text-gray-500 mb-8 max-w-md">
        서버 내부 오류가 발생했습니다. 아래 버튼을 눌러 다시 시도하거나 홈으로 이동해 주세요.
      </p>

      {/* 개발 단계에서 에러 확인을 위한 섹션 (운영 시 삭제 권장) */}
      <div className="mb-8 p-4 bg-gray-50 rounded-xl text-left overflow-auto max-w-full text-xs font-mono text-gray-600 border border-gray-200">
        <p className="font-bold mb-1">[Error Message]</p>
        <p>{error.message || '알 수 없는 오류'}</p>
        {error.digest && <p className="mt-2 text-[10px] text-gray-400">Digest: {error.digest}</p>}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => reset()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-sm"
        >
          <RefreshCcw className="w-4 h-4" />
          다시 시도
        </button>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm"
        >
          <Home className="w-4 h-4" />
          홈으로 가기
        </Link>
      </div>
    </div>
  );
}
