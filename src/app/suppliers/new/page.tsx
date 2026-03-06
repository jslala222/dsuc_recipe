// Path: src/app/suppliers/new/page.tsx
// Description: 거래처 등록 페이지 (명함 추가 기능 포함)

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Building, User, Phone, MapPin, FileText, Mail, Contact, Camera, X } from 'lucide-react';
import { supabase, uploadRecipeImage, TABLE_SUPPLIERS } from '@/lib/supabase';
import { resizeImage } from '@/lib/imageUtils';
import { formatPhoneNumber } from '@/lib/format';
import Link from 'next/link';

const categories = ['식자재', '주류', '인테리어/설비', '배달대행', '기타'];

export default function NewSupplierPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // 폼 상태
    const [name, setName] = useState('');
    const [category, setCategory] = useState('식자재');
    const [contactName, setContactName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [notes, setNotes] = useState('');

    // 명함 이미지 상태
    const [businessCard, setBusinessCard] = useState<{ blob: Blob; previewUrl: string } | null>(null);

    // 명함 이미지 선택 핸들러
    const handleCardSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];

        try {
            // 명함은 글씨가 잘 보여야 하므로 해상도를 높이고(1200px), 품질을 0.8로 설정
            // 300KB 내외 목표
            const resized = await resizeImage(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.8 });
            setBusinessCard(resized);
        } catch (error) {
            console.error('이미지 처리 실패:', error);
            alert('이미지를 처리하는 중 오류가 발생했습니다.');
        }
    };

    // 저장 핸들러
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return alert('거래처명을 입력해주세요.');
        if (!phone.trim()) return alert('연락처를 입력해주세요.');

        setIsLoading(true);

        try {
            // 1. 명함 이미지 업로드 (있을 경우)
            let businessCardUrl = null;
            if (businessCard) {
                // 기존 레시피 이미지 업로드 함수 재사용 (같은 버킷 사용)
                businessCardUrl = await uploadRecipeImage(businessCard.blob);
            }

            // 2. 거래처 정보 저장
            if (supabase) {
                const { error } = await supabase
                    .from(TABLE_SUPPLIERS)
                    .insert([{
                        name,
                        category,
                        contact_name: contactName,
                        phone,
                        email,
                        address,
                        notes,
                        business_card_url: businessCardUrl
                    }]);

                if (error) throw error;

                // 성공 시 목록으로 이동
                router.push('/suppliers');
            } else {
                alert('데이터베이스 연결에 실패했습니다.');
            }
        } catch (error) {
            console.error('저장 실패:', error);
            alert('저장 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto pb-20">
            {/* 헤더 */}
            <div className="flex items-center gap-3 mb-6">
                <Link href="/suppliers" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">거래처 등록</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-wood-100">

                {/* 1. 명함 사진 (최상단 강조) */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <Contact className="w-4 h-4 text-teal-500" />
                        명함 사진 (선택)
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        {businessCard ? (
                            <div className="relative w-full max-w-sm mx-auto aspect-[1.58/1] rounded-lg overflow-hidden border border-gray-200 shadow-sm group">
                                <img src={businessCard.previewUrl} alt="명함 미리보기" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => setBusinessCard(null)}
                                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <label className="w-full h-40 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-colors text-gray-400 hover:text-teal-500">
                                <Camera className="w-8 h-8 mb-2" />
                                <span className="font-medium">명함 촬영 또는 업로드</span>
                                <span className="text-xs mt-1 text-gray-400">(자동으로 선명하게 보정됩니다)</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCardSelect}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>
                </div>

                {/* 2. 기본 정보 */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            <Building className="w-4 h-4 text-gray-400" />
                            거래처명 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="예: 청정 야채 도매"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                            lang="ko"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">카테고리</label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setCategory(c)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border
                                        ${category === c
                                            ? 'bg-teal-500 text-white border-teal-600 shadow-md'
                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. 연락처 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            <User className="w-4 h-4 text-gray-400" />
                            담당자 이름
                        </label>
                        <input
                            type="text"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder="예: 김철수 과장"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                            lang="ko"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            <Phone className="w-4 h-4 text-gray-400" />
                            전화번호 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                            placeholder="예: 010-1234-5678"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                        />
                    </div>
                </div>

                {/* 4. 추가 정보 */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            주소
                        </label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="거래처 주소 입력"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                            lang="ko"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            <FileText className="w-4 h-4 text-gray-400" />
                            메모 / 특이사항
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="예: 매주 월요일 휴무, 오전 배송 선호"
                            className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none transition-all"
                            lang="ko"
                        />
                    </div>
                </div>

                {/* 하단 고정 버튼 */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-lg font-bold text-white transition-all
                            ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 shadow-lg hover:shadow-xl'}`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                저장 중...
                            </>
                        ) : (
                            <>
                                <Save className="w-6 h-6" />
                                거래처 저장하기
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
