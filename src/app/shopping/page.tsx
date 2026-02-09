// Path: src/app/shopping/page.tsx
// Description: 장보기 목록 - 날짜별 장보기 기록 (식당용)

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Search, ShoppingCart, Loader2, Calendar, MapPin, Check, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase, ShoppingTrip } from '@/lib/supabase';

export default function ShoppingPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'전체' | '계획' | '완료'>('전체');
    const [trips, setTrips] = useState<ShoppingTrip[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchTrips();
    }, []);

    async function fetchTrips() {
        if (!supabase) {
            setIsLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('recipe_shopping_trips')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;
            setTrips(data || []);
        } catch (err) {
            console.error('장보기 목록 불러오기 실패:', err);
        } finally {
            setIsLoading(false);
        }
    }

    const filteredTrips = useMemo(() => {
        return trips.filter(trip => {
            const matchesSearch = trip.place.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === '전체' || trip.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [trips, searchQuery, statusFilter]);

    // 이번 달 합계 계산
    const thisMonth = new Date().toISOString().slice(0, 7); // 2024-02
    const monthlyStats = useMemo(() => {
        const monthTrips = trips.filter(t => t.date.startsWith(thisMonth) && t.status === '완료');
        return {
            expected: monthTrips.reduce((sum, t) => sum + (t.total_expected || 0), 0),
            actual: monthTrips.reduce((sum, t) => sum + (t.total_actual || 0), 0),
            count: monthTrips.length
        };
    }, [trips, thisMonth]);

    function formatDate(dateStr: string) {
        const date = new Date(dateStr);
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        return {
            month: date.getMonth() + 1,
            day: date.getDate(),
            weekday: days[date.getDay()]
        };
    }

    function formatMoney(amount: number) {
        return new Intl.NumberFormat('ko-KR').format(amount);
    }

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <ShoppingCart className="w-7 h-7 text-orange-600" />
                        장보기
                    </h1>
                    <p className="text-gray-500 mt-1">날짜별 장보기 기록</p>
                </div>
                <Link
                    href="/shopping/new"
                    className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">새 장보기</span>
                </Link>
            </div>

            {/* 이번 달 요약 */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
                <p className="text-sm text-orange-600 mb-2 font-medium">📅 이번 달 장보기 ({monthlyStats.count}회)</p>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500">예상</p>
                        <p className="text-lg font-bold text-gray-700">₩{formatMoney(monthlyStats.expected)}</p>
                    </div>
                    <div className="text-2xl">→</div>
                    <div>
                        <p className="text-xs text-gray-500">실제</p>
                        <p className="text-lg font-bold text-orange-600">₩{formatMoney(monthlyStats.actual)}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${monthlyStats.actual <= monthlyStats.expected
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                        {monthlyStats.actual <= monthlyStats.expected
                            ? <TrendingDown className="w-4 h-4" />
                            : <TrendingUp className="w-4 h-4" />
                        }
                        {monthlyStats.expected > 0
                            ? `${Math.abs(Math.round((monthlyStats.actual - monthlyStats.expected) / monthlyStats.expected * 100))}%`
                            : '0%'
                        }
                    </div>
                </div>
            </div>

            {/* 검색 및 필터 */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="구매처 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-wood-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>

                <div className="flex gap-2">
                    {(['전체', '계획', '완료'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1
                                ${statusFilter === status
                                    ? status === '완료' ? 'bg-green-500 text-white' :
                                        status === '계획' ? 'bg-blue-500 text-white' :
                                            'bg-orange-500 text-white'
                                    : 'bg-white border border-wood-200 text-gray-600'
                                }`}
                        >
                            {status === '완료' && <Check className="w-4 h-4" />}
                            {status === '계획' && <Clock className="w-4 h-4" />}
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* 로딩 */}
            {isLoading && (
                <div className="text-center py-16">
                    <Loader2 className="w-10 h-10 text-orange-500 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-500">장보기 목록을 불러오는 중...</p>
                </div>
            )}

            {/* 목록 */}
            {!isLoading && filteredTrips.length > 0 && (
                <div className="space-y-3">
                    {filteredTrips.map(trip => {
                        const { month, day, weekday } = formatDate(trip.date);
                        const diff = (trip.total_actual || 0) - (trip.total_expected || 0);

                        return (
                            <Link
                                key={trip.id}
                                href={`/shopping/${trip.id}`}
                                className="block bg-white rounded-xl p-4 border border-wood-200 hover:shadow-md transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    {/* 날짜 */}
                                    <div className="text-center min-w-[50px]">
                                        <p className="text-xs text-gray-400">{month}월</p>
                                        <p className="text-2xl font-bold text-gray-800">{day}</p>
                                        <p className="text-xs text-gray-500">{weekday}</p>
                                    </div>

                                    {/* 구매처 */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${trip.status === '완료'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {trip.status === '완료' ? <Check className="w-3 h-3 inline" /> : <Clock className="w-3 h-3 inline" />}
                                                {trip.status}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-gray-800 flex items-center gap-1">
                                            <MapPin className="w-4 h-4 text-orange-500" />
                                            {trip.place}
                                        </h3>
                                    </div>

                                    {/* 금액 */}
                                    <div className="text-right">
                                        {trip.status === '완료' ? (
                                            <>
                                                <p className="text-lg font-bold text-orange-600">
                                                    ₩{formatMoney(trip.total_actual || 0)}
                                                </p>
                                                <p className={`text-xs ${diff <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {diff <= 0 ? '↓' : '↑'} ₩{formatMoney(Math.abs(diff))}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-lg font-bold text-gray-400">
                                                ₩{formatMoney(trip.total_expected || 0)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* 빈 상태 */}
            {!isLoading && filteredTrips.length === 0 && (
                <div className="text-center py-16">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">장보기 기록이 없어요</p>
                    <Link
                        href="/shopping/new"
                        className="inline-flex items-center gap-2 mt-4 text-orange-600 hover:text-orange-700 font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        첫 장보기 계획하기
                    </Link>
                </div>
            )}
        </div>
    );
}
