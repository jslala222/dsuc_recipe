// Path: src/app/reservations/[id]/page.tsx
// Description: 예약 상세 및 관리 (상태 변경, 취소)

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, Phone, Calendar, Clock, Users, FileText, CheckCircle, XCircle, Loader2, User } from 'lucide-react';
import { supabase, TABLE_RESERVATIONS } from '@/lib/supabase';

interface Reservation {
    id: string;
    customer_name: string;
    customer_phone: string;
    date: string;
    time: string;
    people: number;
    status: string;
    notes: string;
}

export default function ReservationDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchReservation();
    }, [params.id]);

    async function fetchReservation() {
        if (!supabase) return;

        try {
            const { data, error } = await supabase
                .from(TABLE_RESERVATIONS)
                .select('*')
                .eq('id', params.id)
                .single();

            if (error) throw error;
            setReservation(data);
        } catch (error) {
            console.error('예약 정보 로딩 실패:', error);
            alert('예약 정보를 불러올 수 없습니다.');
            router.push('/reservations');
        } finally {
            setIsLoading(false);
        }
    }

    // 상태 변경 핸들러
    const updateStatus = async (newStatus: string) => {
        if (!reservation) return;
        setIsUpdating(true);
        try {
            if (supabase) {
                const { error } = await supabase
                    .from(TABLE_RESERVATIONS)
                    .update({ status: newStatus })
                    .eq('id', reservation.id);

                if (error) throw error;
                setReservation({ ...reservation, status: newStatus });
            }
        } catch (error) {
            console.error('상태 변경 실패:', error);
            alert('상태 변경 중 오류가 발생했습니다.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('정말로 이 예약을 삭제하시겠습니까?')) return;

        setIsUpdating(true);
        try {
            if (supabase) {
                const { error } = await supabase
                    .from(TABLE_RESERVATIONS)
                    .delete()
                    .eq('id', params.id);

                if (error) throw error;
                router.push('/reservations');
            }
        } catch (error) {
            console.error('삭제 실패:', error);
            alert('삭제 중 오류가 발생했습니다.');
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (!reservation) return null;

    return (
        <div className="max-w-xl mx-auto pb-20">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
                <Link href="/reservations" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <div className="flex gap-2">
                    <button
                        onClick={handleDelete}
                        disabled={isUpdating}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="삭제하기"
                    >
                        {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* 본문 카드 */}
            <article className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-wood-100 space-y-8">

                {/* 1. 상태 및 타이틀 */}
                <div className="text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-3
                        ${reservation.status === '예약' ? 'bg-indigo-100 text-indigo-700' :
                            reservation.status === '방문완료' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {reservation.status}
                    </span>
                    <h1 className="text-3xl font-bold text-gray-800">
                        {reservation.customer_name} 님
                    </h1>
                    <p className="text-gray-500 mt-1 flex items-center justify-center gap-1">
                        <Users className="w-4 h-4" />
                        {reservation.people}명 예약
                    </p>
                </div>

                {/* 2. 핵심 정보 (날짜/시간) */}
                <div className="flex justify-center gap-4">
                    <div className="bg-indigo-50 px-6 py-4 rounded-2xl text-center min-w-[120px]">
                        <p className="text-xs text-indigo-400 font-bold mb-1">DATE</p>
                        <p className="text-xl font-bold text-indigo-700">{reservation.date}</p>
                    </div>
                    <div className="bg-indigo-50 px-6 py-4 rounded-2xl text-center min-w-[120px]">
                        <p className="text-xs text-indigo-400 font-bold mb-1">TIME</p>
                        <p className="text-xl font-bold text-indigo-700">{reservation.time.slice(0, 5)}</p>
                    </div>
                </div>

                {/* 3. 연락처 및 메모 */}
                <div className="space-y-4 border-t border-gray-100 pt-6">
                    <a href={`tel:${reservation.customer_phone}`} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group">
                        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-500 group-hover:bg-green-100 transition-colors">
                            <Phone className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold">CONTACT</p>
                            <p className="text-lg font-bold text-gray-700 group-hover:underline">{reservation.customer_phone}</p>
                        </div>
                    </a>

                    {reservation.notes && (
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-yellow-50/50">
                            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 flex-shrink-0">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-yellow-500 font-bold mb-1">NOTE</p>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{reservation.notes}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. 상태 변경 버튼 (하단) */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                    <button
                        onClick={() => updateStatus('방문완료')}
                        disabled={isUpdating || reservation.status === '방문완료'}
                        className={`py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all
                            ${reservation.status === '방문완료'
                                ? 'bg-green-100 text-green-700 cursor-default'
                                : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'}`}
                    >
                        <CheckCircle className="w-5 h-5" />
                        방문 완료
                    </button>
                    <button
                        onClick={() => updateStatus('취소')}
                        disabled={isUpdating || reservation.status === '취소'}
                        className={`py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all
                            ${reservation.status === '취소'
                                ? 'bg-red-100 text-red-700 cursor-default'
                                : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'}`}
                    >
                        <XCircle className="w-5 h-5" />
                        예약 취소
                    </button>
                </div>

            </article>
        </div>
    );
}
