// Path: src/app/customers/page.tsx
// Description: 고객 관리 (CRM) - 목록 조회

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Users, Crown, Phone, ArrowRight, Loader2 } from 'lucide-react';
import { supabase, TABLE_CUSTOMERS } from '@/lib/supabase';

interface Customer {
    id: string;
    name: string;
    phone: string;
    visit_count: number;
    is_vip: boolean;
    notes: string;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterVip, setFilterVip] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, []);

    async function fetchCustomers() {
        if (!supabase) {
            setIsLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from(TABLE_CUSTOMERS)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCustomers(data || []);
        } catch (error) {
            console.error('고객 목록 로딩 실패:', error);
        } finally {
            setIsLoading(false);
        }
    }

    // 검색 및 필터링
    const filteredCustomers = customers.filter(customer => {
        // 데이터가 비어있을 경우를 대비한 안전장치 (Defensive Coding)
        const name = customer.name || '';
        const phone = customer.phone || '';

        const matchesSearch =
            name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            phone.includes(searchTerm);
        const matchesVip = filterVip ? customer.is_vip : true;
        return matchesSearch && matchesVip;
    });

    return (
        <div className="space-y-6 pb-20">
            {/* 헤더 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Users className="w-7 h-7 text-indigo-600" />
                        고객 관리
                    </h1>
                    <p className="text-gray-500 mt-1">단골 손님을 편리하게 관리하세요</p>
                </div>
                <Link
                    href="/customers/new"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    <span>고객 등록</span>
                </Link>
            </div>

            {/* 검색 및 필터 */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="이름 또는 전화번호 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                </div>
                <button
                    onClick={() => setFilterVip(!filterVip)}
                    className={`px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border
                        ${filterVip
                            ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                >
                    <Crown className={`w-5 h-5 ${filterVip ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'}`} />
                    VIP만 보기
                </button>
            </div>

            {/* 목록 */}
            {isLoading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">등록된 고객이 없습니다.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredCustomers.map(customer => (
                        <Link
                            key={customer.id}
                            href={`/customers/${customer.id}`}
                            className="bg-white p-5 rounded-2xl shadow-sm border border-wood-100 hover:shadow-md transition-shadow group relative overflow-hidden"
                        >
                            {customer.is_vip && (
                                <div className="absolute top-0 right-0 bg-yellow-400 w-12 h-12 flex items-center justify-center rounded-bl-2xl shadow-sm">
                                    <Crown className="w-6 h-6 text-white fill-white" />
                                </div>
                            )}

                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0
                                    ${customer.is_vip ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {(customer.name || '고').slice(0, 1)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-gray-800 truncate pr-8">
                                        {customer.name || '이름 없음'}
                                    </h3>
                                    <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                                        <Phone className="w-3.5 h-3.5" />
                                        {customer.phone}
                                    </p>
                                    <div className="flex items-center gap-2 mt-3 text-xs font-medium">
                                        <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md">
                                            방문 {customer.visit_count}회
                                        </span>
                                        {customer.notes && (
                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md max-w-[120px] truncate">
                                                {customer.notes}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="self-center">
                                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
