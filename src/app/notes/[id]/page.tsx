// Path: src/app/notes/[id]/page.tsx
// Description: 특이사항 상세 보기 - 이미지 갤러리 및 내용 표시

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, Loader2, StickyNote, Calendar } from 'lucide-react';
import { supabase, Note } from '@/lib/supabase';

export default function NoteDetailPage() {
    const router = useRouter();
    const params = useParams();
    const noteId = params.id as string;

    const [note, setNote] = useState<Note | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        if (noteId) fetchNote();
    }, [noteId]);

    async function fetchNote() {
        if (!supabase) {
            setIsLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('recipe_notes')
                .select('*')
                .eq('id', noteId)
                .single();

            if (error) throw error;
            setNote(data);
        } catch (err) {
            console.error('메모 불러오기 실패:', err);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDelete() {
        if (!supabase || !note) return;
        if (!confirm('정말 삭제할까요? 이 작업은 되돌릴 수 없어요.')) return;

        try {
            await supabase.from('recipe_notes').delete().eq('id', note.id);
            router.push('/notes');
        } catch (err) {
            console.error('삭제 실패:', err);
            alert('삭제 중 문제가 발생했어요.');
        }
    }

    function formatDate(dateString: string) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    if (isLoading) {
        return (
            <div className="text-center py-20">
                <Loader2 className="w-10 h-10 text-amber-500 mx-auto mb-4 animate-spin" />
                <p className="text-gray-500">메모를 불러오는 중...</p>
            </div>
        );
    }

    if (!note) {
        return (
            <div className="text-center py-20">
                <StickyNote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">메모를 찾을 수 없어요</p>
                <Link href="/notes" className="inline-block mt-4 text-amber-600 hover:text-amber-700 font-medium">
                    목록으로 돌아가기
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* 상단 네비게이션 */}
            <div className="flex items-center justify-between mb-6">
                <Link
                    href="/notes"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>목록으로</span>
                </Link>

                <div className="flex items-center gap-2">
                    <Link
                        href={`/notes/${note.id}/edit`}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                        수정
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl font-medium transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        삭제
                    </button>
                </div>
            </div>

            {/* 메모 내용 */}
            <article className="bg-white rounded-2xl border border-wood-200 overflow-hidden">
                {/* 이미지 갤러리 */}
                {note.images && note.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4 bg-gray-50">
                        {note.images.map((img, idx) => (
                            <div
                                key={idx}
                                className="aspect-square rounded-xl overflow-hidden cursor-pointer"
                                onClick={() => setSelectedImage(img)}
                            >
                                <img
                                    src={img}
                                    alt={`사진 ${idx + 1}`}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* 본문 */}
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                            {note.category}
                        </span>
                        <span className="text-sm text-gray-400 flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(note.updated_at || note.created_at)}
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-800 mb-4">{note.title}</h1>

                    {note.content && (
                        <div className="prose prose-gray max-w-none">
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {note.content}
                            </p>
                        </div>
                    )}
                </div>
            </article>

            {/* 이미지 라이트박스 */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <img
                        src={selectedImage}
                        alt="확대 이미지"
                        className="max-w-full max-h-full object-contain"
                    />
                    <button
                        className="absolute top-4 right-4 text-white text-2xl"
                        onClick={() => setSelectedImage(null)}
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
}
