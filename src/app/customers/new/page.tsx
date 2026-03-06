// Path: src/app/customers/new/page.tsx
// Description: 신규 고객 등록

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, User, Phone, Mail, FileText, Crown } from 'lucide-react';
import { supabase, TABLE_CUSTOMERS } from '@/lib/supabase';
import { formatPhoneNumber } from '@/lib/format';

export default function NewCustomerPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [notes, setNotes] = useState('');
    const [isVip, setIsVip] = useState(false);
    const [preferences, setPreferences] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) return alert('고객 이름을 입력해주세요.');
        if (!phone.trim()) return alert('전화번호를 입력해주세요.');

        setIsLoading(true);

        try {
            if (supabase) {
                const { error } = await supabase
                    .from(TABLE_CUSTOMERS)
                    .insert([{
                        name,
                        phone,
                        email,
                        notes,
                        is_vip: isVip,
                        preferences,
                        visit_count: 0 // 초기값
                    }]);

                if (error) throw error;
                router.push('/customers');
            } else {
                alert('데이터베이스 연결 실패');
            }
        } catch (error: any) {
            console.error('등록 실패:', error);
            alert(`고객 등록 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto pb-20">
            {/* 헤더 */}
            <div className="flex items-center gap-3 mb-6">
                <Link href="/customers" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">새 고객 등록</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-wood-100 space-y-6">

                {/* 1. 기본 정보 */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                        <User className="w-5 h-5 text-indigo-500" />
                        기본 정보
                    </h3>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-600">이름 *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="고객명 입력"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            lang="ko"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-600">전화번호 *</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                            placeholder="010-0000-0000"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-600">이메일 (선택)</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="customer@email.com"
                                className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. 관리 정보 */}
                <div className="space-y-4 pt-2">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                        <Crown className="w-5 h-5 text-yellow-500" />
                        관리 정보
                    </h3>

                    {/* VIP 토글 */}
                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl">
                        <div className="flex items-center gap-2">
                            <Crown className={`w-5 h-5 ${isVip ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'}`} />
                            <span className="font-bold text-gray-700">VIP 고객으로 등록</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsVip(!isVip)}
                            className={`relative w-12 h-7 rounded-full transition-colors duration-200 ease-in-out focus:outline-none
                                ${isVip ? 'bg-yellow-400' : 'bg-gray-300'}`}
                        >
                            <span
                                className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out shadow-sm
                                    ${isVip ? 'translate-x-5' : 'translate-x-0'}`}
                            />
                        </button>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-600">선호 / 취향</label>
                        <input
                            type="text"
                            value={preferences}
                            onChange={(e) => setPreferences(e.target.value)}
                            placeholder="예: 조용한 창가 자리, 매운 음식 비선호"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            lang="ko"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-600">관리자 메모</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="특이사항, 알러지 정보 등"
                            className="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            lang="ko"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-lg font-bold text-white transition-all
                            ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg'}`}
                    >
                        {isLoading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <Save className="w-6 h-6" />
                                저장하기
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
