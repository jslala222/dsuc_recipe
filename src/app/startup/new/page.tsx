// Path: src/app/startup/new/page.tsx
// Description: 새 창업 준비 로그 작성 페이지

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Camera, X, Loader2, Calendar } from 'lucide-react';
import { supabase, uploadRecipeImage, TABLE_STARTUP_LOGS } from '@/lib/supabase';
import { resizeImage } from '@/lib/imageUtils';
import Link from 'next/link';

const categories = ['상권', '인테리어', '아이디어', '행정', '기타'];

interface ImageFile {
    blob: Blob;
    previewUrl: string;
}

export default function NewStartupLogPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // 폼 상태
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('상권');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [content, setContent] = useState('');
    const [images, setImages] = useState<ImageFile[]>([]);

    // 이미지 선택 핸들러
    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        const files = Array.from(e.target.files);

        // 이미지 리사이즈 및 미리보기 생성
        for (const file of files) {
            try {
                const { blob, previewUrl } = await resizeImage(file);
                setImages(prev => [...prev, { blob, previewUrl }]);
            } catch (error) {
                console.error('이미지 처리 실패:', error);
                alert('이미지를 처리하는 중 오류가 발생했습니다.');
            }
        }
    };

    // 이미지 삭제 핸들러
    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    // 저장 핸들러
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return alert('제목을 입력해주세요.');

        setIsLoading(true);

        try {
            // 1. 이미지 업로드
            const uploadedUrls: string[] = [];
            for (const img of images) {
                const url = await uploadRecipeImage(img.blob);
                if (url) uploadedUrls.push(url);
            }

            // 2. 로그 저장
            if (supabase) {
                const { error } = await supabase
                    .from(TABLE_STARTUP_LOGS)
                    .insert([{
                        title,
                        category,
                        date,
                        content,
                        images: uploadedUrls
                    }]);

                if (error) throw error;

                // 성공 시 목록으로 이동
                router.push('/startup');
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
        <div className="max-w-2xl mx-auto pb-20">
            {/* 헤더 */}
            <div className="flex items-center gap-3 mb-6">
                <Link href="/startup" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">새 기록 남기기</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. 카테고리 & 날짜 */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">분류</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full p-3 bg-white border border-wood-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {categories.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">날짜</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full p-3 bg-white border border-wood-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* 2. 제목 */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">제목</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="예: 강남역 10번 출구 상권 분석"
                        className="w-full p-3 bg-white border border-wood-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* 3. 사진 업로드 */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">사진 기록</label>
                    <div className="flex flex-wrap gap-2">
                        {images.map((img, idx) => (
                            <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group">
                                <img src={img.previewUrl} alt="미리보기" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(idx)}
                                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}

                        <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors text-gray-400 hover:text-blue-500">
                            <Camera className="w-6 h-6 mb-1" />
                            <span className="text-xs">사진 추가</span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>

                {/* 4. 내용 */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">세부 내용</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="자세한 내용을 기록해주세요..."
                        className="w-full h-40 p-3 bg-white border border-wood-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                </div>

                {/* 하단 고정 버튼 */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 md:static md:bg-transparent md:border-0 md:p-0">
                    <div className="max-w-2xl mx-auto">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-lg font-bold text-white transition-all
                                ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'}`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    저장하는 중...
                                </>
                            ) : (
                                <>
                                    <Save className="w-6 h-6" />
                                    기록 저장하기
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
