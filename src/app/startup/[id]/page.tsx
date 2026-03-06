// Path: src/app/startup/[id]/page.tsx
// Description: 창업 준비 로그 상세 보기 및 삭제

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, Calendar, MapPin, Building2, Camera, FileText, Loader2 } from 'lucide-react';
import { supabase, TABLE_STARTUP_LOGS } from '@/lib/supabase';

// 카테고리별 아이콘/색상 매핑 (목록 페이지와 동일)
function getCategoryIcon(category: string) {
    switch (category) {
        case '상권': return MapPin;
        case '인테리어': return Building2;
        case '아이디어': return Camera;
        case '행정': return FileText;
        default: return Building2;
    }
}

interface StartupLog {
    id: string;
    title: string;
    category: string;
    content: string;
    images: string[] | null;
    date: string;
    created_at: string;
}

export default function StartupDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [log, setLog] = useState<StartupLog | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchLogDetail();
    }, [params.id]);

    async function fetchLogDetail() {
        if (!supabase) return;

        try {
            const { data, error } = await supabase
                .from(TABLE_STARTUP_LOGS)
                .select('*')
                .eq('id', params.id)
                .single();

            if (error) throw error;
            setLog(data);
        } catch (error) {
            console.error('상세 정보 로딩 실패:', error);
            alert('로그를 불러올 수 없습니다.');
            router.push('/startup');
        } finally {
            setIsLoading(false);
        }
    }

    const handleDelete = async () => {
        if (!confirm('정말로 이 기록을 삭제하시겠습니까?')) return;

        setIsDeleting(true);
        try {
            if (supabase) {
                const { error } = await supabase
                    .from(TABLE_STARTUP_LOGS)
                    .delete()
                    .eq('id', params.id);

                if (error) throw error;
                router.push('/startup');
            }
        } catch (error) {
            console.error('삭제 실패:', error);
            alert('삭제 중 오류가 발생했습니다.');
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!log) return null;

    const CategoryIcon = getCategoryIcon(log.category);

    return (
        <div className="max-w-3xl mx-auto pb-20">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
                <Link href="/startup" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <div className="flex gap-2">
                    {/* 수정 버튼 (추후 구현) */}
                    {/* <Link href={`/startup/${log.id}/edit`} className="...">수정</Link> */}

                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="삭제하기"
                    >
                        {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* 본문 */}
            <article className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-wood-100">
                {/* 상단 정보 */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 font-bold rounded-lg text-sm flex items-center gap-1.5">
                        <CategoryIcon className="w-4 h-4" />
                        {log.category}
                    </span>
                    <span className="text-gray-400 text-sm flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {log.date}
                    </span>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 leading-tight">
                    {log.title}
                </h1>

                {/* 이미지 갤러리 */}
                {log.images && log.images.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        {log.images.map((img, idx) => (
                            <div key={idx} className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                                <img
                                    src={img}
                                    alt={`사진 ${idx + 1}`}
                                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* 내용 */}
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {log.content}
                </div>
            </article>
        </div>
    );
}
