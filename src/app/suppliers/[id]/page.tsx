// Path: src/app/suppliers/[id]/page.tsx
// Description: 거래처 상세 정보 및 삭제 (명함 보기 포함)

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, Phone, MapPin, Mail, User, FileText, Loader2, Contact } from 'lucide-react';
import { supabase, TABLE_SUPPLIERS } from '@/lib/supabase';

interface Supplier {
    id: string;
    name: string;
    contact_name: string;
    phone: string;
    email: string;
    category: string;
    address: string;
    notes: string;
    business_card_url: string | null;
    created_at: string;
}

export default function SupplierDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchSupplierDetail();
    }, [params.id]);

    async function fetchSupplierDetail() {
        if (!supabase) return;

        try {
            const { data, error } = await supabase
                .from(TABLE_SUPPLIERS)
                .select('*')
                .eq('id', params.id)
                .single();

            if (error) throw error;
            setSupplier(data);
        } catch (error) {
            console.error('상세 정보 로딩 실패:', error);
            alert('거래처 정보를 불러올 수 없습니다.');
            router.push('/suppliers');
        } finally {
            setIsLoading(false);
        }
    }

    const handleDelete = async () => {
        if (!confirm('정말로 이 거래처를 삭제하시겠습니까?')) return;

        setIsDeleting(true);
        try {
            if (supabase) {
                const { error } = await supabase
                    .from(TABLE_SUPPLIERS)
                    .delete()
                    .eq('id', params.id);

                if (error) throw error;
                router.push('/suppliers');
            }
        } catch (error) {
            console.error('삭제 실패:', error);
            alert('삭제 중 오류가 발생했습니다.');
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
            </div>
        );
    }

    if (!supplier) return null;

    return (
        <div className="max-w-xl mx-auto pb-20">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
                <Link href="/suppliers" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <div className="flex gap-2">
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="삭제하기"
                    >
                        {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* 본문 카드 */}
            <article className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-wood-100 space-y-6">

                {/* 상단 타이틀 */}
                <div>
                    <span className="inline-block px-3 py-1 bg-teal-50 text-teal-600 font-bold rounded-lg text-sm mb-2">
                        {supplier.category}
                    </span>
                    <h1 className="text-3xl font-bold text-gray-800 leading-tight">
                        {supplier.name}
                    </h1>
                </div>

                {/* 명함 이미지 (있을 경우만 표시) */}
                {supplier.business_card_url && (
                    <div className="mb-6">
                        <p className="text-sm font-bold text-gray-700 flex items-center gap-1 mb-2">
                            <Contact className="w-4 h-4 text-teal-500" />
                            명함
                        </p>
                        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                            <img
                                src={supplier.business_card_url}
                                alt="명함 사진"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </div>
                )}

                {/* 연락처 정보 */}
                <div className="space-y-4 border-t border-b border-gray-100 py-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">담당자</p>
                            <p className="text-lg font-bold text-gray-700">{supplier.contact_name || '-'}</p>
                        </div>
                    </div>

                    <a href={`tel:${supplier.phone}`} className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500 group-hover:bg-green-100 transition-colors">
                            <Phone className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">전화번호 (터치하여 통화)</p>
                            <p className="text-lg font-bold text-green-600 group-hover:underline">{supplier.phone}</p>
                        </div>
                    </a>

                    {supplier.email && (
                        <a href={`mailto:${supplier.email}`} className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 group-hover:bg-purple-100 transition-colors">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">이메일</p>
                                <p className="text-lg font-medium text-gray-700 group-hover:underline">{supplier.email}</p>
                            </div>
                        </a>
                    )}
                </div>

                {/* 주소 및 메모 */}
                <div className="space-y-6">
                    {supplier.address && (
                        <div>
                            <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-2">
                                <MapPin className="w-5 h-5 text-gray-400" />
                                주소
                            </h3>
                            <p className="pl-7 text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                                {supplier.address}
                            </p>
                        </div>
                    )}

                    {supplier.notes && (
                        <div>
                            <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-2">
                                <FileText className="w-5 h-5 text-gray-400" />
                                메모
                            </h3>
                            <div className="pl-7 text-gray-600 whitespace-pre-wrap leading-relaxed bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                                {supplier.notes}
                            </div>
                        </div>
                    )}
                </div>

            </article>
        </div>
    );
}
