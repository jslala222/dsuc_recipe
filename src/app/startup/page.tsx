// Path: src/app/startup/page.tsx
// Description: 창업 준비 로그 목록 - 상권 분석, 인테리어 등 기록 모음

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Search, Building2, MapPin, Calendar, Camera, FileText, Loader2 } from 'lucide-react';
import { supabase, TABLE_STARTUP_LOGS } from '@/lib/supabase';

// 로그 데이터 타입 정의
interface StartupLog {
    id: string;
    title: string;
    category: string;
    content: string;
    images: string[] | null;
    date: string;
    created_at: string;
}

const categories = ['전체', '상권', '인테리어', '아이디어', '행정', '기타'];

// 카테고리별 아이콘/색상 매핑
function getCategoryStyle(category: string) {
    switch (category) {
        case '상권': return { icon: MapPin, color: 'text-red-500', bg: 'bg-red-50' };
        case '인테리어': return { icon: Building2, color: 'text-blue-500', bg: 'bg-blue-50' };
        case '아이디어': return { icon: Camera, color: 'text-yellow-500', bg: 'bg-yellow-50' };
        case '행정': return { icon: FileText, color: 'text-purple-500', bg: 'bg-purple-50' };
        default: return { icon: Building2, color: 'text-gray-500', bg: 'bg-gray-50' };
    }
}

export default function StartupPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [logs, setLogs] = useState<StartupLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    async function fetchLogs() {
        if (!supabase) {
            setIsLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from(TABLE_STARTUP_LOGS)
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;
            setLogs(data || []);
        } catch (err) {
            console.error('로그 불러오기 실패:', err);
        } finally {
            setIsLoading(false);
        }
    }

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesSearch = log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (log.content?.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCategory = selectedCategory === '전체' || log.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [logs, searchQuery, selectedCategory]);

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Building2 className="w-7 h-7 text-blue-600" />
                        창업 준비 로그
                    </h1>
                    <p className="text-gray-500 mt-1">미래의 내 가게를 위한 꼼꼼한 기록</p>
                </div>
                <Link
                    href="/startup/new"
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">새 기록</span>
                </Link>
            </div>

            {/* 검색 및 필터 */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="기록 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-wood-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                                ${selectedCategory === category
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white border border-wood-200 text-gray-600 hover:border-blue-300'
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
                    <Loader2 className="w-10 h-10 text-blue-500 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-500">기록을 불러오는 중...</p>
                </div>
            )}

            {/* 목록 */}
            {!isLoading && filteredLogs.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredLogs.map(log => {
                        const style = getCategoryStyle(log.category);
                        const Icon = style.icon;
                        return (
                            <Link
                                key={log.id}
                                href={`/startup/${log.id}`}
                                className="block bg-white rounded-2xl p-5 border border-wood-100 hover:border-blue-300 hover:shadow-md transition-all group"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${style.bg} ${style.color}`}>
                                        <Icon className="w-3.5 h-3.5" />
                                        {log.category}
                                    </span>
                                    <span className="text-sm text-gray-400 flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {log.date}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                                    {log.title}
                                </h3>
                                <p className="text-gray-600 text-sm line-clamp-2 mb-4 h-10">
                                    {log.content}
                                </p>

                                {/* 이미지 썸네일 (있을 경우) */}
                                {log.images && log.images.length > 0 && (
                                    <div className="flex gap-2 mt-3 overflow-hidden">
                                        {log.images.slice(0, 3).map((img, idx) => (
                                            <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-100 relative">
                                                <img src={img} alt="썸네일" className="w-full h-full object-cover" />
                                                {/* 3장 이상일 때 마지막에 더보기 표시 */}
                                                {idx === 2 && log.images!.length > 3 && (
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold">
                                                        +{log.images!.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* 빈 상태 */}
            {!isLoading && filteredLogs.length === 0 && (
                <div className="text-center py-16">
                    <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                        {searchQuery || selectedCategory !== '전체'
                            ? '검색 결과가 없어요'
                            : '아직 기록된 내용이 없어요'}
                    </p>
                    <Link
                        href="/startup/new"
                        className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        첫 기록 남기기
                    </Link>
                </div>
            )}
        </div>
    );
}
