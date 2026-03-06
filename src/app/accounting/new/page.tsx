// Path: src/app/accounting/new/page.tsx
// Description: 세무/회계 노트 작성 페이지

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Camera, X, Loader2, Calendar } from 'lucide-react';
import { supabase, uploadRecipeImage, TABLE_ACCOUNTING } from '@/lib/supabase';
import { resizeImage } from '@/lib/imageUtils';
import Link from 'next/link';

const categories = {
    '수입': ['매출', '기타 수입'],
    '지출': ['식자재', '임대료', '인건비', '공과금', '마케팅', '기타 지출']
};

export default function NewAccountingPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // 폼 상태
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<'수입' | '지출'>('지출');
    const [category, setCategory] = useState('식자재');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [receiptImage, setReceiptImage] = useState<{ blob: Blob; previewUrl: string } | null>(null);

    // 타입 변경 시 카테고리 초기화
    const handleTypeChange = (newType: '수입' | '지출') => {
        setType(newType);
        setCategory(categories[newType][0]);
    };

    // 이미지 선택 핸들러
    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];

        try {
            const resized = await resizeImage(file);
            setReceiptImage(resized);
        } catch (error) {
            console.error('이미지 처리 실패:', error);
            alert('이미지를 처리하는 중 오류가 발생했습니다.');
        }
    };

    // 저장 핸들러
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || isNaN(Number(amount))) return alert('금액을 올바르게 입력해주세요.');

        setIsLoading(true);

        try {
            // 1. 영수증 이미지 업로드
            let receiptUrl = null;
            if (receiptImage) {
                receiptUrl = await uploadRecipeImage(receiptImage.blob);
            }

            // 2. 장부 저장
            if (supabase) {
                const { error } = await supabase
                    .from(TABLE_ACCOUNTING)
                    .insert([{
                        date,
                        type,
                        category,
                        amount: Number(amount),
                        description,
                        receipt_url: receiptUrl
                    }]);

                if (error) throw error;

                // 성공 시 목록으로 이동
                router.push('/accounting');
            } else {
                alert('데이터베이스 연결에 실패했습니다.');
            }
        } catch (error) {
            console.error('저장 실패:', error);
            alert('저장 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto pb-20">
            {/* 헤더 */}
            <div className="flex items-center gap-3 mb-6">
                <Link href="/accounting" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">새 내역 쓰기</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. 수입/지출 선택 */}
                <div className="flex p-1 bg-gray-100 rounded-xl">
                    {['지출', '수입'].map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => handleTypeChange(t as any)}
                            className={`flex-1 py-3 text-lg font-bold rounded-lg transition-all
                                ${type === t
                                    ? (t === '수입' ? 'bg-white text-red-500 shadow-sm' : 'bg-white text-blue-500 shadow-sm')
                                    : 'text-gray-400'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* 2. 날짜 */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">날짜</label>
                    <div className="relative">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full p-4 bg-white border border-wood-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                        />
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* 3. 금액 */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">금액</label>
                    <div className="relative">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0"
                            className="w-full p-4 text-right bg-white border border-wood-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-2xl font-bold"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">원</span>
                    </div>
                </div>

                {/* 4. 분류 */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">분류</label>
                    <div className="grid grid-cols-3 gap-2">
                        {categories[type].map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setCategory(c)}
                                className={`py-2 px-1 text-sm rounded-lg border transition-all
                                    ${category === c
                                        ? 'border-purple-500 bg-purple-50 text-purple-700 font-bold'
                                        : 'border-wood-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 5. 내용 (적요) */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">내용</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="예: 마트 장보기"
                        className="w-full p-4 bg-white border border-wood-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                {/* 6. 영수증 사진 */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">영수증 첨부</label>
                    {receiptImage ? (
                        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 group">
                            <img src={receiptImage.previewUrl} alt="영수증 미리보기" className="w-full h-full object-contain bg-gray-50" />
                            <button
                                type="button"
                                onClick={() => setReceiptImage(null)}
                                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <label className="w-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors text-gray-400 hover:text-purple-500">
                            <Camera className="w-8 h-8 mb-2" />
                            <span className="font-medium">영수증 찍기 / 업로드</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>

                {/* 하단 고정 버튼 */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-lg font-bold text-white transition-all
                            ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-xl'}`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                저장 중...
                            </>
                        ) : (
                            <>
                                <Save className="w-6 h-6" />
                                내역 저장하기
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
