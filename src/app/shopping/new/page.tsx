// Path: src/app/shopping/new/page.tsx
// Description: 새 장보기 생성 - 품목 추가 기능

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2, Loader2 } from 'lucide-react';
import { supabase, TABLE_SHOPPING_TRIPS, TABLE_SHOPPING_ITEMS } from '@/lib/supabase';

const categories = ['채소', '육류', '해산물', '양념', '주류', '과일', '곡물', '유제품', '기타'];
const units = ['kg', 'g', '개', '박스', '팩', '봉', '병', '캔', 'L', 'ml'];

interface ItemForm {
    name: string;
    category: string;
    expected_quantity: number;
    expected_price: number;
    unit: string;
}

export default function NewShoppingPage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const [tripData, setTripData] = useState({
        date: new Date().toISOString().split('T')[0],
        place: '',
        notes: ''
    });

    const [items, setItems] = useState<ItemForm[]>([
        { name: '', category: '기타', expected_quantity: 1, expected_price: 0, unit: '개' }
    ]);

    function addItem() {
        setItems(prev => [...prev, { name: '', category: '기타', expected_quantity: 1, expected_price: 0, unit: '개' }]);
    }

    function removeItem(index: number) {
        if (items.length <= 1) return;
        setItems(prev => prev.filter((_, i) => i !== index));
    }

    function updateItem(index: number, field: keyof ItemForm, value: string | number) {
        setItems(prev => {
            const newItems = [...prev];
            newItems[index] = { ...newItems[index], [field]: value };
            return newItems;
        });
    }

    // 가격 포맷팅 (천 단위 콤마)
    function formatMoney(amount: number): string {
        return new Intl.NumberFormat('ko-KR').format(amount);
    }

    // 콤마 제거하고 숫자만 추출
    function parseMoney(value: string): number {
        return parseInt(value.replace(/[^0-9]/g, '')) || 0;
    }

    // 예상 총액 계산
    const totalExpected = items.reduce((sum, item) => sum + (item.expected_price || 0), 0);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!supabase) return;
        if (!tripData.place.trim()) {
            alert('구매처를 입력해주세요.');
            return;
        }
        if (items.length === 0 || !items[0].name.trim()) {
            alert('최소 1개 이상의 품목을 입력해주세요.');
            return;
        }

        setIsSaving(true);
        try {
            // 1. 장보기 일정 생성
            const { data: tripResult, error: tripError } = await supabase
                .from(TABLE_SHOPPING_TRIPS)
                .insert([{
                    date: tripData.date,
                    place: tripData.place,
                    notes: tripData.notes,
                    status: '계획',
                    total_expected: totalExpected,
                    total_actual: 0
                }])
                .select()
                .single();

            if (tripError) throw tripError;

            // 2. 품목들 생성
            const validItems = items.filter(item => item.name.trim());
            if (validItems.length > 0) {
                const { error: itemsError } = await supabase
                    .from(TABLE_SHOPPING_ITEMS)
                    .insert(validItems.map(item => ({
                        trip_id: tripResult.id,
                        name: item.name,
                        category: item.category,
                        expected_quantity: item.expected_quantity,
                        expected_price: item.expected_price,
                        actual_quantity: 0,
                        actual_price: 0,
                        unit: item.unit,
                        is_purchased: false
                    })));

                if (itemsError) throw itemsError;
            }

            router.push(`/shopping/${tripResult.id}`);
        } catch (err: any) {
            console.error('저장 실패:', err);
            alert(`저장 중 문제가 발생했어요: ${err.message || '알 수 없는 오류'}`);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* 상단 */}
            <div className="flex items-center justify-between mb-6">
                <Link
                    href="/shopping"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>취소</span>
                </Link>

                <button
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-xl font-medium transition-colors"
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    저장
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 기본 정보 */}
                <div className="bg-white rounded-2xl border border-wood-200 p-6 space-y-4">
                    <h2 className="font-bold text-gray-800 text-lg">📅 장보기 정보</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">날짜 *</label>
                            <input
                                type="date"
                                value={tripData.date}
                                onChange={(e) => setTripData(prev => ({ ...prev, date: e.target.value }))}
                                className="w-full px-4 py-3 border border-wood-200 rounded-xl outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">구매처 *</label>
                            <input
                                type="text"
                                value={tripData.place}
                                onChange={(e) => setTripData(prev => ({ ...prev, place: e.target.value }))}
                                className="w-full px-4 py-3 border border-wood-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                placeholder="예: 가락시장, 거래처A"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
                        <input
                            type="text"
                            value={tripData.notes}
                            onChange={(e) => setTripData(prev => ({ ...prev, notes: e.target.value }))}
                            className="w-full px-4 py-3 border border-wood-200 rounded-xl outline-none"
                            placeholder="예: 주말 영업용 재료"
                        />
                    </div>
                </div>

                {/* 품목 리스트 */}
                <div className="bg-white rounded-2xl border border-wood-200 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-gray-800 text-lg">🛒 품목 리스트</h2>
                        <p className="text-sm text-orange-600 font-medium">
                            예상 총액: ₩{new Intl.NumberFormat('ko-KR').format(totalExpected)}
                        </p>
                    </div>

                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-xl space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-500">품목 {index + 1}</span>
                                    {items.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {/* 품목명 - 50% */}
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                                        className="px-3 py-2 border border-wood-200 rounded-lg text-sm"
                                        placeholder="품목명"
                                    />

                                    {/* 카테고리 - 50% */}
                                    <select
                                        value={item.category}
                                        onChange={(e) => updateItem(index, 'category', e.target.value)}
                                        className="px-3 py-2 border border-wood-200 rounded-lg text-sm bg-white"
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>

                                    {/* 수량 + 단위 - 50% */}
                                    <div className="flex gap-1">
                                        <input
                                            type="number"
                                            value={item.expected_quantity}
                                            onChange={(e) => updateItem(index, 'expected_quantity', parseFloat(e.target.value) || 0)}
                                            className="w-16 px-2 py-2 border border-wood-200 rounded-lg text-sm"
                                            placeholder="수량"
                                        />
                                        <select
                                            value={item.unit}
                                            onChange={(e) => updateItem(index, 'unit', e.target.value)}
                                            className="flex-1 px-2 py-2 border border-wood-200 rounded-lg text-sm bg-white"
                                        >
                                            {units.map(u => <option key={u} value={u}>{u}</option>)}
                                        </select>
                                    </div>

                                    {/* 예상가격 - 50% */}
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={item.expected_price ? formatMoney(item.expected_price) : ''}
                                            onChange={(e) => updateItem(index, 'expected_price', parseMoney(e.target.value))}
                                            className="flex-1 px-3 py-2 border border-wood-200 rounded-lg text-sm text-right"
                                            placeholder="0"
                                        />
                                        <span className="text-sm text-gray-500">원</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={addItem}
                        className="w-full py-3 border-2 border-dashed border-orange-300 text-orange-600 rounded-xl flex items-center justify-center gap-2 hover:bg-orange-50 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        품목 추가
                    </button>
                </div>
            </form>
        </div>
    );
}
