// Path: src/app/reservations/page.tsx
// Description: 예약 시스템 - 예약 현황 확인 및 관리

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, CalendarDays, Loader2, Users, Clock, Phone, Trash2, X, Check, XCircle, AlertCircle } from 'lucide-react';
import { supabase, Reservation } from '@/lib/supabase';

const statusOptions = ['예약완료', '방문완료', '취소', '노쇼'];

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    '예약완료': { color: 'bg-blue-100 text-blue-700', icon: <Clock className="w-3 h-3" /> },
    '방문완료': { color: 'bg-green-100 text-green-700', icon: <Check className="w-3 h-3" /> },
    '취소': { color: 'bg-gray-100 text-gray-600', icon: <XCircle className="w-3 h-3" /> },
    '노쇼': { color: 'bg-red-100 text-red-700', icon: <AlertCircle className="w-3 h-3" /> },
};

export default function ReservationsPage() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        customer_name: '',
        phone: '',
        date: new Date().toISOString().split('T')[0],
        time: '18:00',
        party_size: 2,
        notes: '',
        status: '예약완료'
    });

    useEffect(() => {
        fetchReservations();
    }, []);

    async function fetchReservations() {
        if (!supabase) {
            setIsLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('recipe_reservations')
                .select('*')
                .order('date', { ascending: true })
                .order('time', { ascending: true });

            if (error) throw error;
            setReservations(data || []);
        } catch (err) {
            console.error('예약 불러오기 실패:', err);
        } finally {
            setIsLoading(false);
        }
    }

    async function addReservation() {
        if (!supabase || !formData.customer_name.trim()) return;

        try {
            const { data, error } = await supabase
                .from('recipe_reservations')
                .insert([formData])
                .select()
                .single();

            if (error) throw error;
            setReservations(prev => [...prev, data].sort((a, b) =>
                a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
            ));
            setFormData({
                customer_name: '',
                phone: '',
                date: new Date().toISOString().split('T')[0],
                time: '18:00',
                party_size: 2,
                notes: '',
                status: '예약완료'
            });
            setShowModal(false);
        } catch (err) {
            console.error('추가 실패:', err);
            alert('추가 중 문제가 발생했어요.');
        }
    }

    async function updateStatus(id: string, newStatus: string) {
        if (!supabase) return;

        try {
            await supabase
                .from('recipe_reservations')
                .update({ status: newStatus })
                .eq('id', id);
            setReservations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus as any } : r));
        } catch (err) {
            console.error('상태 변경 실패:', err);
        }
    }

    async function deleteReservation(id: string) {
        if (!supabase) return;
        if (!confirm('정말 삭제할까요?')) return;

        try {
            await supabase.from('recipe_reservations').delete().eq('id', id);
            setReservations(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            console.error('삭제 실패:', err);
        }
    }

    // 선택한 날짜의 예약만 필터링
    const filteredReservations = useMemo(() => {
        return reservations.filter(r => r.date === selectedDate);
    }, [reservations, selectedDate]);

    // 날짜별 예약 수 계산 (캘린더 표시용)
    const reservationCountByDate = useMemo(() => {
        const counts: Record<string, number> = {};
        reservations.forEach(r => {
            if (r.status !== '취소') {
                counts[r.date] = (counts[r.date] || 0) + 1;
            }
        });
        return counts;
    }, [reservations]);

    // 월 달력 날짜 생성
    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        // 해당 월의 첫날과 마지막날
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days: (Date | null)[] = [];

        // 첫 주 빈 칸 채우기 (일요일 시작)
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }

        // 해당 월의 모든 날짜
        for (let d = 1; d <= lastDay.getDate(); d++) {
            days.push(new Date(year, month, d));
        }

        return days;
    }, [currentMonth]);

    // 이전/다음 달 이동
    const goToPrevMonth = () => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const todayStr = new Date().toISOString().split('T')[0];

    // 총 인원수
    const totalGuests = filteredReservations
        .filter(r => r.status === '예약완료' || r.status === '방문완료')
        .reduce((sum, r) => sum + r.party_size, 0);

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <CalendarDays className="w-7 h-7 text-pink-600" />
                        예약 시스템
                    </h1>
                    <p className="text-gray-500 mt-1">예약 현황을 한눈에 확인하세요</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-medium transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">예약 추가</span>
                </button>
            </div>

            {/* 월 달력 */}
            <div className="bg-white rounded-2xl border border-wood-200 p-4">
                {/* 월 네비게이션 */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={goToPrevMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                    >
                        ◀
                    </button>
                    <h2 className="font-bold text-gray-800">
                        {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
                    </h2>
                    <button
                        onClick={goToNextMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                    >
                        ▶
                    </button>
                </div>

                {/* 요일 헤더 */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                        <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* 달력 그리드 */}
                <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((date, idx) => {
                        if (!date) {
                            return <div key={`empty-${idx}`} className="aspect-square" />;
                        }

                        const dateStr = date.toISOString().split('T')[0];
                        const count = reservationCountByDate[dateStr] || 0;
                        const isSelected = dateStr === selectedDate;
                        const isToday = dateStr === todayStr;
                        const isSunday = date.getDay() === 0;
                        const isSaturday = date.getDay() === 6;

                        return (
                            <button
                                key={dateStr}
                                onClick={() => setSelectedDate(dateStr)}
                                className={`aspect-square p-1 rounded-lg flex flex-col items-center justify-center text-sm transition-all ${isSelected
                                    ? 'bg-pink-500 text-white'
                                    : isToday
                                        ? 'bg-pink-100 text-pink-700 border border-pink-300'
                                        : 'hover:bg-gray-100'
                                    } ${isSunday && !isSelected ? 'text-red-500' : ''} ${isSaturday && !isSelected ? 'text-blue-500' : ''}`}
                            >
                                <span className="font-medium">{date.getDate()}</span>
                                {count > 0 && (
                                    <span className={`text-[10px] px-1 rounded ${isSelected ? 'bg-white/30' : 'bg-pink-100 text-pink-700'
                                        }`}>
                                        {count}건
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 요약 */}
            <div className="bg-pink-50 rounded-xl p-4 border border-pink-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-pink-600" />
                    <span className="font-medium text-gray-800">{selectedDate}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-pink-700">
                        <Clock className="w-4 h-4" />
                        {filteredReservations.filter(r => r.status === '예약완료').length}건 예약
                    </span>
                    <span className="flex items-center gap-1 text-gray-600">
                        <Users className="w-4 h-4" />
                        총 {totalGuests}명
                    </span>
                </div>
            </div>

            {/* 로딩 */}
            {isLoading && (
                <div className="text-center py-16">
                    <Loader2 className="w-10 h-10 text-pink-500 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-500">예약을 불러오는 중...</p>
                </div>
            )}

            {/* 목록 */}
            {!isLoading && filteredReservations.length > 0 && (
                <div className="space-y-3">
                    {filteredReservations.map(reservation => (
                        <div
                            key={reservation.id}
                            className="bg-white rounded-xl p-4 border border-wood-200"
                        >
                            <div className="flex items-center gap-4">
                                <div className="text-center min-w-[60px]">
                                    <p className="text-2xl font-bold text-gray-800">{reservation.time.slice(0, 5)}</p>
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-gray-800">{reservation.customer_name}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${statusConfig[reservation.status]?.color}`}>
                                            {statusConfig[reservation.status]?.icon}
                                            {reservation.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            {reservation.party_size}명
                                        </span>
                                        {reservation.phone && (
                                            <a
                                                href={`tel:${reservation.phone}`}
                                                className="flex items-center gap-1 hover:text-pink-600"
                                            >
                                                <Phone className="w-4 h-4" />
                                                {reservation.phone}
                                            </a>
                                        )}
                                    </div>
                                    {reservation.notes && (
                                        <p className="text-xs text-gray-400 mt-1">{reservation.notes}</p>
                                    )}
                                </div>

                                {/* 빠른 상태 변경 */}
                                <div className="flex items-center gap-2">
                                    {reservation.status === '예약완료' && (
                                        <button
                                            onClick={() => updateStatus(reservation.id, '방문완료')}
                                            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                            title="방문완료"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteReservation(reservation.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 빈 상태 */}
            {!isLoading && filteredReservations.length === 0 && (
                <div className="text-center py-16">
                    <CalendarDays className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">이 날은 예약이 없어요</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 mt-4 text-pink-600 hover:text-pink-700 font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        예약 추가하기
                    </button>
                </div>
            )}

            {/* 모달 */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800">예약 추가</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">예약자명 *</label>
                                <input
                                    type="text"
                                    value={formData.customer_name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                                    className="w-full px-4 py-3 border border-wood-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                                    placeholder="홍길동"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => {
                                        // 숫자만 추출
                                        const digits = e.target.value.replace(/[^0-9]/g, '');
                                        // 000-0000-0000 형식으로 포맷팅
                                        let formatted = '';
                                        if (digits.length <= 3) {
                                            formatted = digits;
                                        } else if (digits.length <= 7) {
                                            formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
                                        } else {
                                            formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
                                        }
                                        setFormData(prev => ({ ...prev, phone: formatted }));
                                    }}
                                    className="w-full px-4 py-3 border border-wood-200 rounded-xl outline-none"
                                    placeholder="010-1234-5678"
                                    maxLength={13}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                        className="w-full px-4 py-3 border border-wood-200 rounded-xl outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">시간</label>
                                    <select
                                        value={formData.time}
                                        onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                                        className="w-full px-4 py-3 border border-wood-200 rounded-xl bg-white outline-none"
                                    >
                                        {/* 30분 단위 시간 옵션 (09:00 ~ 22:00) */}
                                        {Array.from({ length: 27 }, (_, i) => {
                                            const hour = Math.floor(i / 2) + 9;
                                            const minute = (i % 2) * 30;
                                            const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                                            return <option key={timeStr} value={timeStr}>{timeStr}</option>;
                                        })}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">인원</label>
                                <select
                                    value={formData.party_size}
                                    onChange={(e) => setFormData(prev => ({ ...prev, party_size: parseInt(e.target.value) }))}
                                    className="w-full px-4 py-3 border border-wood-200 rounded-xl bg-white outline-none"
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                        <option key={n} value={n}>{n}명</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
                                <input
                                    type="text"
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    className="w-full px-4 py-3 border border-wood-200 rounded-xl outline-none"
                                    placeholder="예: 창가자리 요청"
                                />
                            </div>

                            <button
                                onClick={addReservation}
                                className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl transition-colors"
                            >
                                예약 등록
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
