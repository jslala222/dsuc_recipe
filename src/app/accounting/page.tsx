// Path: src/app/accounting/page.tsx
// Description: 세무/회계 노트 - 일일 수입/지출 기록

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Calculator, Loader2, TrendingUp, TrendingDown, Trash2, X, Receipt } from 'lucide-react';
import { supabase, AccountingRecord } from '@/lib/supabase';

const categories = ['전체', '식자재', '인건비', '임대료', '공과금', '마케팅', '기타'];

export default function AccountingPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<'전체' | '수입' | '지출'>('전체');
    const [records, setRecords] = useState<AccountingRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        type: '지출' as '수입' | '지출',
        category: '기타',
        amount: '',
        description: ''
    });

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
                .from('recipe_accounting')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;
            setRecords(data || []);
        } catch (err) {
            console.error('기록 불러오기 실패:', err);
        } finally {
            setIsLoading(false);
        }
    }

    async function addRecord() {
        if (!supabase || !formData.amount) return;

        try {
            const { data, error } = await supabase
                .from('recipe_accounting')
                .insert([{
                    ...formData,
                    amount: parseInt(formData.amount)
                }])
                .select()
                .single();

            if (error) throw error;
            setRecords(prev => [data, ...prev]);
            setFormData({
                date: new Date().toISOString().split('T')[0],
                type: '지출',
                category: '기타',
                amount: '',
                description: ''
            });
            setShowModal(false);
        } catch (err) {
            console.error('추가 실패:', err);
            alert('추가 중 문제가 발생했어요.');
        }
    }

    async function deleteRecord(id: string) {
        if (!supabase) return;

        try {
            await supabase.from('recipe_accounting').delete().eq('id', id);
            setRecords(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            console.error('삭제 실패:', err);
        }
    }

    const filteredRecords = useMemo(() => {
        return records.filter(record => {
            const matchesSearch = record.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                record.category.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = selectedType === '전체' || record.type === selectedType;
            return matchesSearch && matchesType;
        });
    }, [records, searchQuery, selectedType]);

    // 합계 계산
    const totalIncome = records.filter(r => r.type === '수입').reduce((sum, r) => sum + r.amount, 0);
    const totalExpense = records.filter(r => r.type === '지출').reduce((sum, r) => sum + r.amount, 0);
    const balance = totalIncome - totalExpense;

    function formatMoney(amount: number) {
        return new Intl.NumberFormat('ko-KR').format(amount);
    }

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Calculator className="w-7 h-7 text-purple-600" />
                        세무/회계 노트
                    </h1>
                    <p className="text-gray-500 mt-1">수입과 지출을 기록하세요</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">기록</span>
                </button>
            </div>

            {/* 요약 카드 */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-2 text-green-600 text-sm mb-1">
                        <TrendingUp className="w-4 h-4" />
                        수입
                    </div>
                    <p className="text-xl font-bold text-green-700">₩{formatMoney(totalIncome)}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                    <div className="flex items-center gap-2 text-red-600 text-sm mb-1">
                        <TrendingDown className="w-4 h-4" />
                        지출
                    </div>
                    <p className="text-xl font-bold text-red-700">₩{formatMoney(totalExpense)}</p>
                </div>
                <div className={`rounded-xl p-4 border ${balance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className={`flex items-center gap-2 text-sm mb-1 ${balance >= 0 ? 'text-blue-600' : 'text-gray-600'}`}>
                        <Receipt className="w-4 h-4" />
                        잔액
                    </div>
                    <p className={`text-xl font-bold ${balance >= 0 ? 'text-blue-700' : 'text-gray-700'}`}>
                        ₩{formatMoney(balance)}
                    </p>
                </div>
            </div>

            {/* 검색 및 필터 */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="내용 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-wood-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                <div className="flex gap-2">
                    {(['전체', '수입', '지출'] as const).map(type => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                                ${selectedType === type
                                    ? type === '수입' ? 'bg-green-500 text-white' :
                                        type === '지출' ? 'bg-red-500 text-white' :
                                            'bg-purple-500 text-white'
                                    : 'bg-white border border-wood-200 text-gray-600'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* 로딩 */}
            {isLoading && (
                <div className="text-center py-16">
                    <Loader2 className="w-10 h-10 text-purple-500 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-500">기록을 불러오는 중...</p>
                </div>
            )}

            {/* 목록 */}
            {!isLoading && filteredRecords.length > 0 && (
                <div className="space-y-2">
                    {filteredRecords.map(record => (
                        <div
                            key={record.id}
                            className="bg-white rounded-xl p-4 border border-wood-200 flex items-center gap-4"
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${record.type === '수입' ? 'bg-green-100' : 'bg-red-100'
                                }`}>
                                {record.type === '수입'
                                    ? <TrendingUp className="w-5 h-5 text-green-600" />
                                    : <TrendingDown className="w-5 h-5 text-red-600" />
                                }
                            </div>

                            <div className="flex-1">
                                <p className="font-medium text-gray-800">
                                    {record.description || record.category}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {record.date} · {record.category}
                                </p>
                            </div>

                            <p className={`font-bold ${record.type === '수입' ? 'text-green-600' : 'text-red-600'}`}>
                                {record.type === '수입' ? '+' : '-'}₩{formatMoney(record.amount)}
                            </p>

                            <button
                                onClick={() => deleteRecord(record.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* 빈 상태 */}
            {!isLoading && filteredRecords.length === 0 && (
                <div className="text-center py-16">
                    <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">기록이 없어요</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 mt-4 text-purple-600 hover:text-purple-700 font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        첫 기록 추가하기
                    </button>
                </div>
            )}

            {/* 모달 */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800">수입/지출 기록</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* 수입/지출 선택 */}
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, type: '수입' }))}
                                    className={`py-3 rounded-xl font-medium transition-all ${formData.type === '수입'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}
                                >
                                    <TrendingUp className="w-5 h-5 inline mr-2" />
                                    수입
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, type: '지출' }))}
                                    className={`py-3 rounded-xl font-medium transition-all ${formData.type === '지출'
                                        ? 'bg-red-500 text-white'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}
                                >
                                    <TrendingDown className="w-5 h-5 inline mr-2" />
                                    지출
                                </button>
                            </div>

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
                                <label className="block text-sm font-medium text-gray-700 mb-1">금액 (원) *</label>
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                    className="w-full px-4 py-3 border border-wood-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="10000"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full px-4 py-3 border border-wood-200 rounded-xl bg-white outline-none"
                                >
                                    {categories.filter(c => c !== '전체').map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-4 py-3 border border-wood-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="예: 가락시장 식자재 구입"
                                />
                            </div>

                            <button
                                onClick={addRecord}
                                className={`w-full py-3 text-white font-bold rounded-xl transition-colors ${formData.type === '수입'
                                    ? 'bg-green-500 hover:bg-green-600'
                                    : 'bg-red-500 hover:bg-red-600'
                                    }`}
                            >
                                기록하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
