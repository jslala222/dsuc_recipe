// Path: src/app/reservations/new/page.tsx
// Description: 예약 등록 페이지

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Calendar, Clock, User, Phone, Users, FileText } from 'lucide-react';
import { supabase, TABLE_RESERVATIONS } from '@/lib/supabase';
import { formatPhoneNumber } from '@/lib/format';
import Link from 'next/link';

export default function NewReservationPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // 폼 상태
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('18:00');
    const [people, setPeople] = useState('2');
    const [notes, setNotes] = useState('');

    // 저장 핸들러
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerName.trim()) return alert('예약자 성함을 입력해주세요.');
        if (!customerPhone.trim()) return alert('연락처를 입력해주세요.');

        setIsLoading(true);

        try {
            if (supabase) {
                const { error } = await supabase
                    .from(TABLE_RESERVATIONS)
                    .insert([{
                        customer_name: customerName,
                        customer_phone: customerPhone,
                        date,
                        time,
                        people: Number(people),
                        notes,
                        status: '예약'
                    }]);

                if (error) throw error;

                // 성공 시 목록(달력)으로 이동
                router.push('/reservations');
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
                <Link href="/reservations" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">새 예약 등록</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-wood-100">

                {/* 1. 예약 일시 */}
                <div className="space-y-4 border-b border-gray-100 pb-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-500" />
                        날짜 및 시간
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">날짜</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">시간</label>
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. 예약자 정보 */}
                <div className="space-y-4 border-b border-gray-100 pb-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <User className="w-5 h-5 text-indigo-500" />
                        예약자 정보
                    </h3>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">성함</label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="홍길동"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            lang="ko"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">연락처</label>
                        <input
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(formatPhoneNumber(e.target.value))}
                            placeholder="010-1234-5678"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            <Users className="w-4 h-4 text-gray-400" />
                            인원 수
                        </label>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setPeople(String(Math.max(1, Number(people) - 1)))}
                                className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200"
                            >
                                -
                            </button>
                            <input
                                type="number"
                                value={people}
                                onChange={(e) => setPeople(e.target.value)}
                                className="flex-1 p-3 text-center font-bold text-lg bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                                type="button"
                                onClick={() => setPeople(String(Number(people) + 1))}
                                className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. 요청사항 */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-500" />
                        요청사항 / 메모
                    </h3>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="예: 창가 자리 선호, 알러지 있음"
                        className="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        lang="ko"
                    />
                </div>

                {/* 하단 고정 버튼 */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-lg font-bold text-white transition-all
                            ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl'}`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                저장 중...
                            </>
                        ) : (
                            <>
                                <Save className="w-6 h-6" />
                                예약 저장하기
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
