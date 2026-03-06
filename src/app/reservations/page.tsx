// Path: src/app/reservations/page.tsx
// Description: 예약 관리 - 캘린더 뷰

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Users, Clock, Loader2 } from 'lucide-react';
import { supabase, TABLE_RESERVATIONS } from '@/lib/supabase';

interface Reservation {
    id: string;
    customer_name: string;
    customer_phone: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM:SS
    people: number;
    status: string;
    notes: string;
}

export default function ReservationsPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 년, 월 계산
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0 ~ 11

    // 이번 달의 첫 날과 마지막 날
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // 달력에 표시할 날짜들 계산
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0(일) ~ 6(토)
    const daysInMonth = lastDayOfMonth.getDate();

    useEffect(() => {
        fetchReservations();
    }, [currentDate]);

    async function fetchReservations() {
        if (!supabase) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            // 이번 달 1일부터 마지막 날까지의 예약만 가져옴 (로컬 시간 기준)
            // toISOString() 사용 시 시차로 인해 날짜가 하루 밀릴 수 있음 -> 수동 포맷팅
            const startYear = firstDayOfMonth.getFullYear();
            const startMonth = String(firstDayOfMonth.getMonth() + 1).padStart(2, '0');
            const startDay = String(firstDayOfMonth.getDate()).padStart(2, '0');
            const startStr = `${startYear}-${startMonth}-${startDay}`;

            const endYear = lastDayOfMonth.getFullYear();
            const endMonth = String(lastDayOfMonth.getMonth() + 1).padStart(2, '0');
            const endDay = String(lastDayOfMonth.getDate()).padStart(2, '0');
            const endStr = `${endYear}-${endMonth}-${endDay}`;

            console.log(`Fetching reservations from ${startStr} to ${endStr}`);

            const { data, error } = await supabase
                .from(TABLE_RESERVATIONS)
                .select('*')
                .gte('date', startStr)
                .lte('date', endStr)
                .order('date', { ascending: true })
                .order('time', { ascending: true });

            if (error) {
                console.error('Supabase query error:', error);
                throw error;
            }
            setReservations(data || []);
        } catch (error) {
            console.error('예약 불러오기 실패 (상세):', error);
        } finally {
            setIsLoading(false);
        }
    }

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    // 해당 날짜의 예약 필터링
    const getReservationsForDay = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return reservations.filter(r => r.date === dateStr);
    };

    return (
        <div className="space-y-6 pb-20">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <CalendarIcon className="w-7 h-7 text-indigo-600" />
                        예약 관리
                    </h1>
                    <p className="text-gray-500 mt-1">소중한 손님들의 방문 일정</p>
                </div>
                <Link
                    href="/reservations/new"
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">예약 등록</span>
                </Link>
            </div>

            {/* 달력 컨트롤 */}
            <div className="bg-white rounded-2xl shadow-sm border border-wood-100 overflow-hidden">
                <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <span className="text-lg font-bold text-gray-800">
                        {year}년 {month + 1}월
                    </span>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* 요일 헤더 */}
                <div className="grid grid-cols-7 border-b border-gray-100">
                    {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                        <div key={day} className={`py-3 text-center text-sm font-bold ${idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-gray-500'}`}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* 날짜 그리드 */}
                <div className="grid grid-cols-7 auto-rows-fr bg-gray-50">
                    {/* 빈 칸 (지난 달) */}
                    {Array.from({ length: startDayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} className="min-h-[100px] p-2 border-b border-r border-gray-100 bg-gray-50/50" />
                    ))}

                    {/* 날짜 */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dayReservations = getReservationsForDay(day);
                        const isToday =
                            new Date().getDate() === day &&
                            new Date().getMonth() === month &&
                            new Date().getFullYear() === year;

                        return (
                            <div key={day} className="min-h-[100px] p-2 border-b border-r border-gray-100 bg-white hover:bg-indigo-50/30 transition-colors relative group">
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold
                                        ${isToday ? 'bg-indigo-600 text-white' : 'text-gray-700'}`}>
                                        {day}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    {dayReservations.map(res => (
                                        <Link
                                            key={res.id}
                                            href={`/reservations/${res.id}`}
                                            className="block p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors border border-indigo-100 text-xs"
                                        >
                                            <div className="font-bold text-indigo-700 truncate">
                                                {res.time.slice(0, 5)} {res.customer_name}
                                            </div>
                                            <div className="text-indigo-500 flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {res.people}명
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 로딩 표시 */}
            {isLoading && (
                <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                </div>
            )}
        </div>
    );
}
