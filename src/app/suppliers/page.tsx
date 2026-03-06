// Path: src/app/suppliers/page.tsx
// Description: 거래처 관리 목록 - 식자재, 설비 등 업체 연락처 관리

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Search, Phone, MapPin, Truck, Utensils, Beer, Hammer, Building, MoreHorizontal, User } from 'lucide-react';
import { supabase, TABLE_SUPPLIERS } from '@/lib/supabase';

interface Supplier {
    id: string;
    name: string; // 거래처명
    contact_name: string; // 담당자
    phone: string; // 연락처
    email: string;
    category: string; // 식자재, 주류 등
    address: string;
    notes: string;
    created_at: string;
}

const categories = ['전체', '식자재', '주류', '인테리어/설비', '배달대행', '기타'];

function getCategoryIcon(category: string) {
    switch (category) {
        case '식자재': return { icon: Utensils, color: 'text-green-500', bg: 'bg-green-50' };
        case '주류': return { icon: Beer, color: 'text-amber-500', bg: 'bg-amber-50' };
        case '인테리어/설비': return { icon: Hammer, color: 'text-blue-500', bg: 'bg-blue-50' };
        case '배달대행': return { icon: Truck, color: 'text-purple-500', bg: 'bg-purple-50' };
        default: return { icon: Building, color: 'text-gray-500', bg: 'bg-gray-50' };
    }
}

export default function SuppliersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    async function fetchSuppliers() {
        if (!supabase) {
            setIsLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from(TABLE_SUPPLIERS)
                .select('*')
                .order('name', { ascending: true }); // 이름순 정렬

            if (error) throw error;
            setSuppliers(data || []);
        } catch (error) {
            console.error('거래처 불러오기 실패:', error);
        } finally {
            setIsLoading(false);
        }
    }

    // 검색 및 필터링
    const filteredSuppliers = useMemo(() => {
        return suppliers.filter(s => {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                s.name.toLowerCase().includes(searchLower) ||
                s.contact_name?.toLowerCase().includes(searchLower) ||
                s.notes?.toLowerCase().includes(searchLower);

            const matchesCategory = selectedCategory === '전체' || s.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [suppliers, searchQuery, selectedCategory]);

    // 전화 걸기 (모바일 대응)
    const handleCall = (phone: string) => {
        window.location.href = `tel:${phone}`;
    };

    return (
        <div className="space-y-6 pb-20">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Building className="w-7 h-7 text-teal-600" />
                        거래처 관리
                    </h1>
                    <p className="text-gray-500 mt-1">사장님의 든든한 파트너들</p>
                </div>
                <Link
                    href="/suppliers/new"
                    className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">거래처 등록</span>
                </Link>
            </div>

            {/* 검색 및 필터 */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="거래처명, 담당자 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-wood-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                                ${selectedCategory === category
                                    ? 'bg-teal-500 text-white'
                                    : 'bg-white border border-wood-200 text-gray-600 hover:border-teal-300'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* 거래처 목록 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSuppliers.map(supplier => {
                    const style = getCategoryIcon(supplier.category);
                    const Icon = style.icon;
                    return (
                        <div key={supplier.id} className="bg-white rounded-2xl p-5 border border-wood-100 hover:border-teal-300 hover:shadow-md transition-all group relative">
                            {/* 상단: 카테고리 & 메뉴 */}
                            <div className="flex justify-between items-start mb-3">
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${style.bg} ${style.color}`}>
                                    <Icon className="w-3.5 h-3.5" />
                                    {supplier.category}
                                </span>
                                <Link href={`/suppliers/${supplier.id}`} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
                                    <MoreHorizontal className="w-5 h-5" />
                                </Link>
                            </div>

                            {/* 본문: 업체 정보 */}
                            <Link href={`/suppliers/${supplier.id}`} className="block mb-4">
                                <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-teal-600 transition-colors">
                                    {supplier.name}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                    <User className="w-3.5 h-3.5" />
                                    {supplier.contact_name || '담당자 미정'}
                                </div>
                                {supplier.address && (
                                    <div className="flex items-start gap-2 text-xs text-gray-400 line-clamp-1">
                                        <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                        {supplier.address}
                                    </div>
                                )}
                            </Link>

                            {/* 하단: 액션 버튼 */}
                            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-50">
                                <button
                                    onClick={() => handleCall(supplier.phone)}
                                    className="flex items-center justify-center gap-2 py-2 bg-teal-50 text-teal-600 rounded-xl hover:bg-teal-100 transition-colors font-medium text-sm"
                                >
                                    <Phone className="w-4 h-4" />
                                    전화걸기
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${supplier.name} ${supplier.phone} ${supplier.address}`);
                                        alert('정보가 복사되었습니다!');
                                    }}
                                    className="flex items-center justify-center gap-2 py-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors font-medium text-sm"
                                >
                                    복사하기
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {!isLoading && filteredSuppliers.length === 0 && (
                <div className="text-center py-16">
                    <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                        {searchQuery || selectedCategory !== '전체'
                            ? '검색된 거래처가 없습니다.'
                            : '아직 등록된 거래처가 없습니다.'}
                    </p>
                    <Link
                        href="/suppliers/new"
                        className="inline-flex items-center gap-2 mt-4 text-teal-600 hover:text-teal-700 font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        첫 거래처 등록하기
                    </Link>
                </div>
            )}
        </div>
    );
}
