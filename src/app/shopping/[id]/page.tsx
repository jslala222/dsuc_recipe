// Path: src/app/shopping/[id]/page.tsx
// Description: 장보기 상세 - 예상/실제 비교, 품목 체크, 완료 처리

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, Loader2, Check, MapPin, Calendar, Plus, Save, X } from 'lucide-react';
import { supabase, ShoppingTrip, ShoppingItem } from '@/lib/supabase';

const categories = ['채소', '육류', '해산물', '양념', '주류', '과일', '곡물', '유제품', '기타'];
const units = ['kg', 'g', '개', '박스', '팩', '봉', '병', '캔', 'L', 'ml'];

export default function ShoppingDetailPage() {
    const router = useRouter();
    const params = useParams();
    const tripId = params.id as string;

    const [trip, setTrip] = useState<ShoppingTrip | null>(null);
    const [items, setItems] = useState<ShoppingItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showAddItem, setShowAddItem] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '', category: '기타', expected_quantity: 1, expected_price: 0, unit: '개'
    });

    useEffect(() => {
        if (tripId) fetchData();
    }, [tripId]);

    async function fetchData() {
        if (!supabase) {
            setIsLoading(false);
            return;
        }

        try {
            // 장보기 일정
            const { data: tripData, error: tripError } = await supabase
                .from('recipe_shopping_trips')
                .select('*')
                .eq('id', tripId)
                .single();
            if (tripError) throw tripError;
            setTrip(tripData);

            // 품목 리스트
            const { data: itemsData, error: itemsError } = await supabase
                .from('recipe_shopping_items')
                .select('*')
                .eq('trip_id', tripId)
                .order('created_at', { ascending: true });
            if (itemsError) throw itemsError;
            setItems(itemsData || []);
        } catch (err) {
            console.error('데이터 불러오기 실패:', err);
        } finally {
            setIsLoading(false);
        }
    }

    // 품목 구매 토글 + 실제 값 입력
    async function togglePurchase(item: ShoppingItem) {
        if (!supabase) return;

        const newPurchased = !item.is_purchased;
        const actualQty = newPurchased ? (item.actual_quantity || item.expected_quantity) : 0;
        const actualPrice = newPurchased ? (item.actual_price || item.expected_price) : 0;

        try {
            await supabase
                .from('recipe_shopping_items')
                .update({
                    is_purchased: newPurchased,
                    actual_quantity: actualQty,
                    actual_price: actualPrice
                })
                .eq('id', item.id);

            setItems(prev => prev.map(i =>
                i.id === item.id
                    ? { ...i, is_purchased: newPurchased, actual_quantity: actualQty, actual_price: actualPrice }
                    : i
            ));
        } catch (err) {
            console.error('상태 변경 실패:', err);
        }
    }

    // 실제 가격 수정 + 합계 자동 재계산
    async function updateActualPrice(item: ShoppingItem, newPrice: number) {
        if (!supabase) return;

        try {
            // 1. 품목 가격 업데이트
            await supabase
                .from('recipe_shopping_items')
                .update({ actual_price: newPrice })
                .eq('id', item.id);

            // 2. 로컬 상태 업데이트 및 새 합계 계산
            const updatedItems = items.map(i =>
                i.id === item.id ? { ...i, actual_price: newPrice } : i
            );
            setItems(updatedItems);

            // 3. 장보기 합계도 자동 재계산하여 저장
            const newTotalActual = updatedItems.reduce((sum, i) => sum + (i.actual_price || 0), 0);
            const newTotalExpected = updatedItems.reduce((sum, i) => sum + (i.expected_price || 0), 0);

            await supabase
                .from('recipe_shopping_trips')
                .update({
                    total_actual: newTotalActual,
                    total_expected: newTotalExpected
                })
                .eq('id', tripId);

            setTrip(prev => prev ? { ...prev, total_actual: newTotalActual, total_expected: newTotalExpected } : null);
        } catch (err) {
            console.error('가격 수정 실패:', err);
        }
    }

    // 장보기 상태를 다시 '계획'으로 되돌리기
    async function reopenTrip() {
        if (!supabase || !trip) return;

        try {
            await supabase
                .from('recipe_shopping_trips')
                .update({ status: '계획' })
                .eq('id', tripId);

            setTrip(prev => prev ? { ...prev, status: '계획' } : null);
        } catch (err) {
            console.error('상태 변경 실패:', err);
        }
    }

    // 품목 삭제
    async function deleteItem(id: string) {
        if (!supabase) return;
        if (!confirm('이 품목을 삭제할까요?')) return;

        try {
            await supabase.from('recipe_shopping_items').delete().eq('id', id);
            setItems(prev => prev.filter(i => i.id !== id));
        } catch (err) {
            console.error('삭제 실패:', err);
        }
    }

    // 새 품목 추가
    async function addNewItem() {
        if (!supabase || !newItem.name.trim()) return;

        try {
            const { data, error } = await supabase
                .from('recipe_shopping_items')
                .insert([{
                    trip_id: tripId,
                    name: newItem.name,
                    category: newItem.category,
                    expected_quantity: newItem.expected_quantity,
                    expected_price: newItem.expected_price,
                    actual_quantity: 0,
                    actual_price: 0,
                    unit: newItem.unit,
                    is_purchased: false
                }])
                .select()
                .single();

            if (error) throw error;
            setItems(prev => [...prev, data]);
            setNewItem({ name: '', category: '기타', expected_quantity: 1, expected_price: 0, unit: '개' });
            setShowAddItem(false);
        } catch (err) {
            console.error('품목 추가 실패:', err);
        }
    }

    // 장보기 완료 처리
    async function completeTrip() {
        if (!supabase || !trip) return;

        const totalActual = items.reduce((sum, item) => sum + (item.actual_price || 0), 0);
        const totalExpected = items.reduce((sum, item) => sum + (item.expected_price || 0), 0);

        setIsSaving(true);
        try {
            await supabase
                .from('recipe_shopping_trips')
                .update({
                    status: '완료',
                    total_actual: totalActual,
                    total_expected: totalExpected
                })
                .eq('id', tripId);

            setTrip(prev => prev ? { ...prev, status: '완료', total_actual: totalActual, total_expected: totalExpected } : null);
        } catch (err) {
            console.error('완료 처리 실패:', err);
        } finally {
            setIsSaving(false);
        }
    }

    // 장보기 삭제
    async function deleteTrip() {
        if (!supabase) return;
        if (!confirm('이 장보기 기록을 삭제할까요?')) return;

        try {
            await supabase.from('recipe_shopping_trips').delete().eq('id', tripId);
            router.push('/shopping');
        } catch (err) {
            console.error('삭제 실패:', err);
        }
    }

    function formatMoney(amount: number) {
        return new Intl.NumberFormat('ko-KR').format(amount);
    }

    // 콤마 제거하고 숫자만 추출
    function parseMoney(value: string): number {
        return parseInt(value.replace(/[^0-9]/g, '')) || 0;
    }

    function formatDate(dateStr: string) {
        const date = new Date(dateStr);
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`;
    }

    // 합계 계산
    const totalExpected = items.reduce((sum, item) => sum + (item.expected_price || 0), 0);
    const totalActual = items.reduce((sum, item) => sum + (item.actual_price || 0), 0);
    const diff = totalActual - totalExpected;

    if (isLoading) {
        return (
            <div className="text-center py-20">
                <Loader2 className="w-10 h-10 text-orange-500 mx-auto mb-4 animate-spin" />
                <p className="text-gray-500">불러오는 중...</p>
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-500">장보기 기록을 찾을 수 없어요</p>
                <Link href="/shopping" className="text-orange-600 mt-4 inline-block">목록으로 가기</Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* 상단 네비게이션 */}
            <div className="flex items-center justify-between">
                <Link
                    href="/shopping"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                >
                    <ArrowLeft className="w-5 h-5" />
                    목록
                </Link>

                <div className="flex items-center gap-2">
                    {trip.status === '계획' && (
                        <button
                            onClick={completeTrip}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium"
                        >
                            <Check className="w-4 h-4" />
                            완료
                        </button>
                    )}
                    {trip.status === '완료' && (
                        <button
                            onClick={reopenTrip}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium"
                        >
                            <Edit className="w-4 h-4" />
                            다시 편집
                        </button>
                    )}
                    <button
                        onClick={deleteTrip}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl font-medium"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* 장보기 정보 */}
            <div className="bg-white rounded-2xl border border-wood-200 p-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${trip.status === '완료' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {trip.status}
                    </span>
                </div>
                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-orange-500" />
                    {trip.place}
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(trip.date)}
                </p>
                {trip.notes && <p className="text-sm text-gray-600 mt-2">{trip.notes}</p>}
            </div>

            {/* 요약 */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center justify-between">
                    <div className="text-center">
                        <p className="text-xs text-gray-500">예상</p>
                        <p className="text-lg font-bold text-gray-700">₩{formatMoney(totalExpected)}</p>
                    </div>
                    <div className="text-2xl text-gray-400">→</div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500">실제</p>
                        <p className="text-lg font-bold text-orange-600">₩{formatMoney(totalActual)}</p>
                    </div>
                    <div className={`text-center px-3 py-1 rounded-full ${diff <= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        <p className="text-sm font-bold">{diff <= 0 ? '↓' : '↑'} ₩{formatMoney(Math.abs(diff))}</p>
                    </div>
                </div>
            </div>

            {/* 품목 리스트 */}
            <div className="bg-white rounded-2xl border border-wood-200 overflow-hidden">
                <div className="p-4 border-b border-wood-100 flex items-center justify-between">
                    <h2 className="font-bold text-gray-800">🛒 품목 ({items.length}개)</h2>
                    <button
                        onClick={() => setShowAddItem(true)}
                        className="text-orange-600 text-sm flex items-center gap-1"
                    >
                        <Plus className="w-4 h-4" /> 추가
                    </button>
                </div>

                {/* 새 품목 추가 폼 */}
                {showAddItem && (
                    <div className="p-4 bg-orange-50 border-b border-orange-100 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-orange-700">새 품목 추가</span>
                            <button onClick={() => setShowAddItem(false)} className="text-gray-400">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                value={newItem.name}
                                onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                                className="col-span-2 px-3 py-2 border border-wood-200 rounded-lg text-sm"
                                placeholder="품목명"
                            />
                            <select
                                value={newItem.category}
                                onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                                className="px-3 py-2 border border-wood-200 rounded-lg text-sm bg-white"
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <div className="flex gap-1">
                                <input
                                    type="number"
                                    value={newItem.expected_quantity}
                                    onChange={(e) => setNewItem(prev => ({ ...prev, expected_quantity: parseFloat(e.target.value) || 0 }))}
                                    className="w-16 px-2 py-2 border border-wood-200 rounded-lg text-sm"
                                />
                                <select
                                    value={newItem.unit}
                                    onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
                                    className="flex-1 px-2 py-2 border border-wood-200 rounded-lg text-sm bg-white"
                                >
                                    {units.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </div>
                            <div className="col-span-2 flex items-center gap-2">
                                <input
                                    type="number"
                                    value={newItem.expected_price}
                                    onChange={(e) => setNewItem(prev => ({ ...prev, expected_price: parseInt(e.target.value) || 0 }))}
                                    className="flex-1 px-3 py-2 border border-wood-200 rounded-lg text-sm"
                                    placeholder="예상가격"
                                />
                                <button onClick={addNewItem} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm">
                                    추가
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 품목 목록 */}
                <div className="divide-y divide-wood-100">
                    {items.map(item => {
                        // 배경색 결정: 구매완료 > 예상가격있음 > 예상가격없음
                        let bgColor = '';
                        if (item.is_purchased) {
                            bgColor = 'bg-green-50'; // 구매 완료: 연한 초록
                        } else if (item.expected_price > 0) {
                            bgColor = 'bg-white'; // 예상가격 있음: 흰색
                        } else {
                            bgColor = 'bg-blue-50 border-l-4 border-l-blue-400'; // 예상가격 없음: 연한 파란색 + 왼쪽 강조선
                        }
                        return (
                            <div key={item.id} className={`p-4 ${bgColor}`}>
                                <div className="flex items-start gap-3">
                                    {/* 체크박스 */}
                                    <button
                                        onClick={() => togglePurchase(item)}
                                        className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${item.is_purchased
                                            ? 'bg-green-500 border-green-500 text-white'
                                            : 'border-gray-300 hover:border-orange-500'
                                            }`}
                                    >
                                        {item.is_purchased && <Check className="w-4 h-4" />}
                                    </button>

                                    {/* 품목 정보 */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm ${item.is_purchased ? 'line-through text-gray-400' : 'font-medium text-gray-800'}`}>
                                                {item.name}
                                            </span>
                                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded">
                                                {item.category}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {item.expected_quantity}{item.unit} / 예상 ₩{formatMoney(item.expected_price)}
                                        </p>
                                    </div>

                                    {/* 실제 가격 입력 - 완료 상태에서도 수정 가능 */}
                                    {(item.is_purchased || trip.status === '완료') && (
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs text-gray-500">실제:</span>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                value={item.actual_price ? formatMoney(item.actual_price) : ''}
                                                onChange={(e) => updateActualPrice(item, parseMoney(e.target.value))}
                                                className="w-24 px-2 py-1 border border-wood-200 rounded text-sm text-right"
                                                placeholder="0"
                                            />
                                            <span className="text-xs text-gray-500">원</span>
                                        </div>
                                    )}

                                    {/* 삭제 */}
                                    <button
                                        onClick={() => deleteItem(item.id)}
                                        className="text-gray-300 hover:text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {items.length === 0 && (
                    <div className="p-8 text-center text-gray-400">
                        품목이 없어요
                    </div>
                )}
            </div>
        </div>
    );
}
