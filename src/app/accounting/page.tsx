// Path: src/app/accounting/page.tsx
// Description: 세무/회계 노트 목록 - 월별 수입/지출 관리

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Calculator, TrendingUp, TrendingDown, Receipt, Calendar } from 'lucide-react';
import { supabase, TABLE_ACCOUNTING } from '@/lib/supabase';

interface AccountingRecord {
    id: string;
    date: string;
    type: '수입' | '지출';
    amount: number;
    category: string;
    description: string;
    receipt_url: string | null;
}

export default function AccountingPage() {
    const [records, setRecords] = useState<AccountingRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterType, setFilterType] = useState<'전체' | '수입' | '지출'>('전체');

    // 이번 달 기준 날짜
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    useEffect(() => {
        fetchRecords();
    }, []);

    async function fetchRecords() {
        if (!supabase) {
            setIsLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from(TABLE_ACCOUNTING)
                .select('*')
                .order('date', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRecords(data || []);
        } catch (error) {
            console.error('장부 불러오기 실패:', error);
        } finally {
            setIsLoading(false);
        }
    }

    // 통계 계산
    const stats = useMemo(() => {
        let income = 0;
        let expense = 0;

        records.forEach(record => {
            // 이번 달 데이터만 계산 (날짜 문자열 비교 "YYYY-MM")
            if (record.date.startsWith(`${currentYear}-${String(currentMonth).padStart(2, '0')}`)) {
                if (record.type === '수입') income += record.amount;
                else expense += record.amount;
            }
        });

        return { income, expense, total: income - expense };
    }, [records, currentYear, currentMonth]);

    // 필터링된 목록
    const filteredRecords = useMemo(() => {
        if (filterType === '전체') return records;
        return records.filter(r => r.type === filterType);
    }, [records, filterType]);

    function formatCurrency(amount: number) {
        return new Intl.NumberFormat('ko-KR').format(amount) + '원';
    }

    return (
        <div className="space-y-6 pb-20">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Calculator className="w-7 h-7 text-purple-600" />
                        세무/회계 노트
                    </h1>
                    <p className="text-gray-500 mt-1">꼼꼼한 장부 관리로 세금 폭탄 예방!</p>
                </div>
            </div>

            {/* 월별 요약 카드 */}
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-4 opacity-80">
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium text-lg">{currentMonth}월 현황</span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center divide-x divide-white/20">
                    <div>
                        <p className="text-sm text-purple-100 mb-1">수입</p>
                        <p className="text-xl font-bold">{formatCurrency(stats.income)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-purple-100 mb-1">지출</p>
                        <p className="text-xl font-bold">{formatCurrency(stats.expense)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-purple-100 mb-1">잔액</p>
                        <p className={`text-xl font-bold ${stats.total >= 0 ? 'text-white' : 'text-red-300'}`}>
                            {formatCurrency(stats.total)}
                        </p>
                    </div>
                </div>
            </div>

            {/* 필터 탭 */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
                {['전체', '수입', '지출'].map(type => (
                    <button
                        key={type}
                        onClick={() => setFilterType(type as any)}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all
                            ${filterType === type
                                ? 'bg-white text-gray-800 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* 거래 내역 목록 */}
            <div className="space-y-3">
                {filteredRecords.map(record => (
                    <div
                        key={record.id}
                        className="bg-white p-4 rounded-xl border border-wood-100 flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center
                                ${record.type === '수입' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                {record.type === '수입' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">{record.description || record.category}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                                    <span>{record.date}</span>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <span>{record.category}</span>
                                    {record.receipt_url && <Receipt className="w-3.5 h-3.5 text-purple-500" />}
                                </div>
                            </div>
                        </div>
                        <span className={`font-bold text-lg
                            ${record.type === '수입' ? 'text-red-500' : 'text-blue-500'}`}>
                            {record.type === '수입' ? '+' : '-'}{formatCurrency(record.amount)}
                        </span>
                    </div>
                ))}

                {!isLoading && filteredRecords.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        기록된 내역이 없습니다.
                    </div>
                )}
            </div>

            {/* 플로팅 버튼 (작성) */}
            <Link
                href="/accounting/new"
                className="fixed bottom-6 right-6 w-14 h-14 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-purple-700 transition-colors z-50"
            >
                <Plus className="w-8 h-8" />
            </Link>
        </div>
    );
}
