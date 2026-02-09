// Path: src/app/not-found.tsx
// Description: 404 페이지 컴포넌트

import Link from 'next/link';
import { ChefHat, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-4">
            <div className="w-20 h-20 bg-wood-100 rounded-full flex items-center justify-center mb-6">
                <ChefHat className="w-10 h-10 text-wood-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
                페이지를 찾을 수 없어요
            </h2>
            <p className="text-gray-600 mb-8">
                요청하신 페이지가 사라졌거나 잘못된 주소입니다.
            </p>
            <Link
                href="/"
                className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
            >
                <Home className="w-5 h-5" />
                홈으로 돌아가기
            </Link>
        </div>
    );
}
