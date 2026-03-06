// Path: src/app/customers/[id]/page.tsx
// Description: 고객 상세 정보 및 수정

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, Phone, Mail, Crown, FileText, Star, Plus, Minus, Save, Loader2 } from 'lucide-react';
import { supabase, TABLE_CUSTOMERS } from '@/lib/supabase';

interface Customer {
    id: string;
    name: string;
    phone: string;
    email: string;
    visit_count: number;
    is_vip: boolean;
    preferences: string;
    notes: string;
    created_at: string;
}

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // 수정 가능한 필드 상태
    const [editNotes, setEditNotes] = useState('');
    const [editPreferences, setEditPreferences] = useState('');

    useEffect(() => {
        fetchCustomer();
    }, [params.id]);

    async function fetchCustomer() {
        if (!supabase) return;
        try {
            const { data, error } = await supabase
                .from(TABLE_CUSTOMERS)
                .select('*')
                .eq('id', params.id)
                .single();

            if (error) throw error;
            setCustomer(data);
            setEditNotes(data.notes || '');
            setEditPreferences(data.preferences || '');
        } catch (error) {
            console.error('고객 정보 로딩 실패:', error);
            router.push('/customers');
        } finally {
            setIsLoading(false);
        }
    }

    // 간단 업데이트 (VIP, 방문횟수 등 즉시 반영)
    const updateField = async (field: string, value: any) => {
        if (!customer || !supabase) return;

        try {
            const { error } = await supabase
                .from(TABLE_CUSTOMERS)
                .update({ [field]: value })
                .eq('id', customer.id);

            if (error) throw error;
            setCustomer({ ...customer, [field]: value });
        } catch (error) {
            console.error('업데이트 실패:', error);
            alert('정보 수정 중 오류가 발생했습니다.');
        }
    };

    // 메모/취향 저장
    const handleSaveMemo = async () => {
        if (!customer || !supabase) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from(TABLE_CUSTOMERS)
                .update({
                    notes: editNotes,
                    preferences: editPreferences
                })
                .eq('id', customer.id);

            if (error) throw error;
            setCustomer({ ...customer, notes: editNotes, preferences: editPreferences });
            alert('메모가 저장되었습니다.');
        } catch (error) {
            console.error('저장 실패:', error);
            alert('저장 실패');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('정말로 이 고객 정보를 삭제하시겠습니까?')) return;

        try {
            if (supabase) {
                const { error } = await supabase
                    .from(TABLE_CUSTOMERS)
                    .delete()
                    .eq('id', params.id);

                if (error) throw error;
                router.push('/customers');
            }
        } catch (error) {
            console.error('삭제 실패:', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
    if (!customer) return null;

    return (
        <div className="max-w-xl mx-auto pb-20">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
                <Link href="/customers" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <div className="flex gap-2">
                    <button
                        onClick={handleDelete}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {/* 1. 프로필 카드 */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-wood-100 relative overflow-hidden">
                    {/* VIP 토글 버튼 */}
                    <button
                        onClick={() => updateField('is_vip', !customer.is_vip)}
                        className={`absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all
                            ${customer.is_vip
                                ? 'bg-yellow-400 text-white shadow-md'
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                    >
                        <Crown className={`w-4 h-4 ${customer.is_vip ? 'fill-white' : ''}`} />
                        {customer.is_vip ? 'VIP 회원' : '일반 회원'}
                    </button>

                    <div className="text-center mt-4">
                        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl font-bold mb-4
                            ${customer.is_vip ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'}`}>
                            {(customer.name || '고').slice(0, 1)}
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">{customer.name}</h1>
                        <a href={`tel:${customer.phone}`} className="inline-flex items-center gap-2 text-indigo-600 font-medium mt-2 hover:underline">
                            <Phone className="w-4 h-4" />
                            {customer.phone}
                        </a>
                        {customer.email && (
                            <p className="text-gray-500 text-sm mt-1 flex items-center justify-center gap-1">
                                <Mail className="w-3.5 h-3.5" />
                                {customer.email}
                            </p>
                        )}
                    </div>
                </div>

                {/* 2. 방문 횟수 카운터 */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-wood-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-bold mb-1">총 방문 횟수</p>
                        <p className="text-3xl font-bold text-indigo-600">{customer.visit_count}회</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => updateField('visit_count', Math.max(0, customer.visit_count - 1))}
                            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                        >
                            <Minus className="w-5 h-5 text-gray-600" />
                        </button>
                        <button
                            onClick={() => updateField('visit_count', customer.visit_count + 1)}
                            className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center hover:bg-indigo-200 transition-colors"
                        >
                            <Plus className="w-5 h-5 text-indigo-600" />
                        </button>
                    </div>
                </div>

                {/* 3. 상세 메모 (수정 가능) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-wood-100 space-y-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-indigo-500" />
                        상세 정보 (수정 가능)
                    </h3>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500">선호 / 취향</label>
                        <input
                            type="text"
                            value={editPreferences}
                            onChange={(e) => setEditPreferences(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            placeholder="예: 조용한 자리 선호"
                            lang="ko"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500">관리자 메모</label>
                        <textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            className="w-full h-32 p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                            placeholder="특이사항을 기록하세요"
                            lang="ko"
                        />
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleSaveMemo}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-bold transition-all"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            변경사항 저장
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
