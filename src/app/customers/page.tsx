// Path: src/app/customers/page.tsx
// Description: 고객 관리 - 단골 고객 성향, 선호도, 특이사항 기록

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Users, Loader2, Phone, Star, Trash2, X, Crown } from 'lucide-react';
import { supabase, Customer } from '@/lib/supabase';

export default function CustomersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showVipOnly, setShowVipOnly] = useState(false);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        preferences: '',
        notes: '',
        is_vip: false
    });

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
                .from('recipe_customers')
                .select('*')
                .order('is_vip', { ascending: false })
                .order('visit_count', { ascending: false });

            if (error) throw error;
            setCustomers(data || []);
        } catch (err) {
            console.error('고객 불러오기 실패:', err);
        } finally {
            setIsLoading(false);
        }
    }

    function openAddModal() {
        setEditingCustomer(null);
        setFormData({ name: '', phone: '', email: '', preferences: '', notes: '', is_vip: false });
        setShowModal(true);
    }

    function openEditModal(customer: Customer) {
        setEditingCustomer(customer);
        setFormData({
            name: customer.name,
            phone: customer.phone || '',
            email: customer.email || '',
            preferences: customer.preferences || '',
            notes: customer.notes || '',
            is_vip: customer.is_vip
        });
        setShowModal(true);
    }

    async function saveCustomer() {
        if (!supabase || !formData.name.trim()) return;

        try {
            if (editingCustomer) {
                const { error } = await supabase
                    .from('recipe_customers')
                    .update(formData)
                    .eq('id', editingCustomer.id);
                if (error) throw error;
                setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? { ...c, ...formData } : c));
            } else {
                const { data, error } = await supabase
                    .from('recipe_customers')
                    .insert([{ ...formData, visit_count: 0 }])
                    .select()
                    .single();
                if (error) throw error;
                setCustomers(prev => [data, ...prev]);
            }
            setShowModal(false);
        } catch (err) {
            console.error('저장 실패:', err);
            alert('저장 중 문제가 발생했어요.');
        }
    }

    async function toggleVip(id: string, currentState: boolean) {
        if (!supabase) return;

        try {
            await supabase.from('recipe_customers').update({ is_vip: !currentState }).eq('id', id);
            setCustomers(prev => prev.map(c => c.id === id ? { ...c, is_vip: !currentState } : c));
        } catch (err) {
            console.error('VIP 상태 변경 실패:', err);
        }
    }

    async function incrementVisit(id: string, currentCount: number) {
        if (!supabase) return;

        try {
            await supabase.from('recipe_customers').update({ visit_count: currentCount + 1 }).eq('id', id);
            setCustomers(prev => prev.map(c => c.id === id ? { ...c, visit_count: currentCount + 1 } : c));
        } catch (err) {
            console.error('방문 횟수 증가 실패:', err);
        }
    }

    async function deleteCustomer(id: string) {
        if (!supabase) return;
        if (!confirm('정말 삭제할까요?')) return;

        try {
            await supabase.from('recipe_customers').delete().eq('id', id);
            setCustomers(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error('삭제 실패:', err);
        }
    }

    const filteredCustomers = useMemo(() => {
        return customers.filter(customer => {
            const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                customer.phone?.includes(searchQuery);
            const matchesVip = !showVipOnly || customer.is_vip;
            return matchesSearch && matchesVip;
        });
    }, [customers, searchQuery, showVipOnly]);

    const vipCount = customers.filter(c => c.is_vip).length;

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Users className="w-7 h-7 text-indigo-600" />
                        고객 관리
                    </h1>
                    <p className="text-gray-500 mt-1">단골 고객 정보를 관리하세요</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">고객 추가</span>
                </button>
            </div>

            {/* 요약 */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                    <p className="text-sm text-indigo-600 mb-1">전체 고객</p>
                    <p className="text-2xl font-bold text-indigo-700">{customers.length}명</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                    <p className="text-sm text-yellow-600 mb-1 flex items-center gap-1">
                        <Crown className="w-4 h-4" />
                        VIP 고객
                    </p>
                    <p className="text-2xl font-bold text-yellow-700">{vipCount}명</p>
                </div>
            </div>

            {/* 검색 및 필터 */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="이름 또는 전화번호 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-wood-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setShowVipOnly(false)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                            ${!showVipOnly ? 'bg-indigo-500 text-white' : 'bg-white border border-wood-200 text-gray-600'
                            }`}
                    >
                        전체
                    </button>
                    <button
                        onClick={() => setShowVipOnly(true)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1
                            ${showVipOnly ? 'bg-yellow-500 text-white' : 'bg-white border border-wood-200 text-gray-600'
                            }`}
                    >
                        <Crown className="w-4 h-4" />
                        VIP만
                    </button>
                </div>
            </div>

            {/* 로딩 */}
            {isLoading && (
                <div className="text-center py-16">
                    <Loader2 className="w-10 h-10 text-indigo-500 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-500">고객을 불러오는 중...</p>
                </div>
            )}

            {/* 목록 */}
            {!isLoading && filteredCustomers.length > 0 && (
                <div className="space-y-3">
                    {filteredCustomers.map(customer => (
                        <div
                            key={customer.id}
                            className={`bg-white rounded-xl p-4 border transition-all cursor-pointer hover:shadow-md ${customer.is_vip ? 'border-yellow-300 bg-yellow-50/30' : 'border-wood-200'
                                }`}
                            onClick={() => openEditModal(customer)}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${customer.is_vip ? 'bg-yellow-200 text-yellow-700' : 'bg-indigo-100 text-indigo-600'
                                    }`}>
                                    {customer.name.charAt(0)}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-gray-800">{customer.name}</h3>
                                        {customer.is_vip && (
                                            <span className="text-xs px-2 py-0.5 bg-yellow-200 text-yellow-700 rounded-full flex items-center gap-1">
                                                <Crown className="w-3 h-3" />
                                                VIP
                                            </span>
                                        )}
                                    </div>
                                    {customer.phone && (
                                        <a
                                            href={`tel:${customer.phone}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="text-sm text-gray-500 flex items-center gap-1 hover:text-indigo-600"
                                        >
                                            <Phone className="w-3 h-3" />
                                            {customer.phone}
                                        </a>
                                    )}
                                    {customer.preferences && (
                                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                                            선호: {customer.preferences}
                                        </p>
                                    )}
                                </div>

                                <div className="text-center">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); incrementVisit(customer.id, customer.visit_count); }}
                                        className="text-2xl font-bold text-indigo-600 hover:text-indigo-700"
                                    >
                                        {customer.visit_count}
                                    </button>
                                    <p className="text-xs text-gray-400">방문</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleVip(customer.id, customer.is_vip); }}
                                        className={`p-2 rounded-lg transition-colors ${customer.is_vip
                                            ? 'bg-yellow-200 text-yellow-700'
                                            : 'bg-gray-100 text-gray-400 hover:text-yellow-600'
                                            }`}
                                        title="VIP 토글"
                                    >
                                        <Star className="w-4 h-4" fill={customer.is_vip ? 'currentColor' : 'none'} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteCustomer(customer.id); }}
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
            {!isLoading && filteredCustomers.length === 0 && (
                <div className="text-center py-16">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">등록된 고객이 없어요</p>
                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        첫 고객 등록하기
                    </button>
                </div>
            )}

            {/* 모달 */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800">
                                {editingCustomer ? '고객 정보 수정' : '고객 추가'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-3 border border-wood-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="홍길동"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full px-4 py-3 border border-wood-200 rounded-xl outline-none"
                                    placeholder="010-1234-5678"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full px-4 py-3 border border-wood-200 rounded-xl outline-none"
                                    placeholder="example@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">선호도 / 취향</label>
                                <input
                                    type="text"
                                    value={formData.preferences}
                                    onChange={(e) => setFormData(prev => ({ ...prev, preferences: e.target.value }))}
                                    className="w-full px-4 py-3 border border-wood-200 rounded-xl outline-none"
                                    placeholder="예: 매운 음식 선호, 창가 자리"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-wood-200 rounded-xl outline-none resize-none"
                                    placeholder="특이사항이나 기억할 점..."
                                />
                            </div>

                            <label className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_vip}
                                    onChange={(e) => setFormData(prev => ({ ...prev, is_vip: e.target.checked }))}
                                    className="w-5 h-5 text-yellow-500"
                                />
                                <div>
                                    <p className="font-medium text-gray-800 flex items-center gap-1">
                                        <Crown className="w-4 h-4 text-yellow-600" />
                                        VIP 고객으로 등록
                                    </p>
                                    <p className="text-xs text-gray-500">단골 고객을 VIP로 관리하세요</p>
                                </div>
                            </label>

                            <button
                                onClick={saveCustomer}
                                className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-colors"
                            >
                                {editingCustomer ? '수정하기' : '추가하기'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
