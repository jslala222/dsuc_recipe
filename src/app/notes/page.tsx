// Path: src/app/notes/page.tsx
// Description: 특이사항 목록 - 레시피와 동일한 구조 (목록/검색/카테고리)

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Search, StickyNote, Loader2, Calendar, ImageIcon } from 'lucide-react';
import { supabase, Note } from '@/lib/supabase';

const categories = ['전체', '일상', '아이디어', '중요', '가족', '여행', '기타'];

export default function NotesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchNotes();
    }, []);

    async function fetchNotes() {
        if (!supabase) {
            setIsLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('recipe_notes')
                .select('*')
                .order('updated_at', { ascending: false });

            if (error) throw error;
            setNotes(data || []);
        } catch (err) {
            console.error('메모 불러오기 실패:', err);
        } finally {
            setIsLoading(false);
        }
    }

    const filteredNotes = useMemo(() => {
        return notes.filter(note => {
            const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.content?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === '전체' || note.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [notes, searchQuery, selectedCategory]);

    function formatDate(dateString: string) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    }

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <StickyNote className="w-7 h-7 text-amber-600" />
                        특이사항
                    </h1>
                    <p className="text-gray-500 mt-1">무엇이든 기록하세요 ✨</p>
                </div>
                <Link
                    href="/notes/new"
                    className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">새 메모</span>
                </Link>
            </div>

            {/* 검색 및 필터 */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="메모 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-wood-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                                ${selectedCategory === category
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-white border border-wood-200 text-gray-600 hover:border-amber-300'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* 로딩 */}
            {isLoading && (
                <div className="text-center py-16">
                    <Loader2 className="w-10 h-10 text-amber-500 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-500">메모를 불러오는 중...</p>
                </div>
            )}

            {/* 메모 목록 (카드 그리드) */}
            {!isLoading && filteredNotes.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredNotes.map(note => (
                        <Link
                            key={note.id}
                            href={`/notes/${note.id}`}
                            className="bg-white rounded-xl border border-wood-200 overflow-hidden hover:shadow-lg transition-all group"
                        >
                            {/* 썸네일 이미지 */}
                            {note.images && note.images.length > 0 ? (
                                <div className="h-40 bg-gray-100">
                                    <img
                                        src={note.images[0]}
                                        alt={note.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                </div>
                            ) : (
                                <div className="h-40 bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
                                    <StickyNote className="w-12 h-12 text-amber-300" />
                                </div>
                            )}

                            {/* 콘텐츠 */}
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                                        {note.category}
                                    </span>
                                    {note.images && note.images.length > 1 && (
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <ImageIcon className="w-3 h-3" />
                                            +{note.images.length - 1}
                                        </span>
                                    )}
                                </div>

                                <h3 className="font-bold text-gray-800 line-clamp-1">{note.title}</h3>
                                {note.content && (
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{note.content}</p>
                                )}

                                <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(note.updated_at || note.created_at)}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* 빈 상태 */}
            {!isLoading && filteredNotes.length === 0 && (
                <div className="text-center py-16">
                    <StickyNote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">아직 메모가 없어요</p>
                    <Link
                        href="/notes/new"
                        className="inline-flex items-center gap-2 mt-4 text-amber-600 hover:text-amber-700 font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        첫 메모 작성하기
                    </Link>
                </div>
            )}
        </div>
    );
}
