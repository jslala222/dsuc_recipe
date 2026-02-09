// Path: src/app/suppliers/page.tsx
// Description: 거래처 관리 - 식자재 업체 연락처 및 거래 조건 관리

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Handshake, Loader2, Phone, Mail, MapPin, Trash2, X, Star } from 'lucide-react';
import { supabase, Supplier } from '@/lib/supabase';

const categories = ['전체', '채소', '육류', '해산물', '양념', '주류', '포장재', '기타'];

export default function SuppliersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        contact_name: '',
        phone: '',
        email: '',
        address: '',
        category: '기타',
        notes: ''
    });

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
                .from('recipe_suppliers')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            setSuppliers(data || []);
        } catch (err) {
            console.error('거래처 불러오기 실패:', err);
        } finally {
            setIsLoading(false);
        }
    }

    function openAddModal() {
        setEditingSupplier(null);
        setFormData({ name: '', contact_name: '', phone: '', email: '', address: '', category: '기타', notes: '' });
        setShowModal(true);
    }

    function openEditModal(supplier: Supplier) {
        setEditingSupplier(supplier);
        setFormData({
            name: supplier.name,
            contact_name: supplier.contact_name || '',
            phone: supplier.phone || '',
            email: supplier.email || '',
            address: supplier.address || '',
            category: supplier.category || '기타',
            notes: supplier.notes || ''
        });
        setShowModal(true);
    }

    async function saveSupplier() {
        if (!supabase || !formData.name.trim()) return;

        try {
            if (editingSupplier) {
                const { error } = await supabase
                    .from('recipe_suppliers')
                    .update(formData)
                    .eq('id', editingSupplier.id);
                if (error) throw error;
                setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? { ...s, ...formData } : s));
            } else {
                const { data, error } = await supabase
                    .from('recipe_suppliers')
                    .insert([formData])
                    .select()
                    .single();
                if (error) throw error;
                setSuppliers(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
            }
            setShowModal(false);
        } catch (err) {
            console.error('저장 실패:', err);
            alert('저장 중 문제가 발생했어요.');
        }
    }

    async function deleteSupplier(id: string) {
        if (!supabase) return;
        if (!confirm('정말 삭제할까요?')) return;

        try {
            await supabase.from('recipe_suppliers').delete().eq('id', id);
            setSuppliers(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            console.error('삭제 실패:', err);
        }
    }

    const filteredSuppliers = useMemo(() => {
        return suppliers.filter(supplier => {
            const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                supplier.contact_name?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === '전체' || supplier.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [suppliers, searchQuery, selectedCategory]);

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Handshake className="w-7 h-7 text-teal-600" />
                        거래처 관리
                    </h1>
                    <p className="text-gray-500 mt-1">식자재 업체 정보를 관리하세요</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">거래처 추가</span>
                </button>
            </div>

            {/* 검색 및 필터 */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="거래처 검색..."
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

            {/* 로딩 */}
            {isLoading && (
                <div className="text-center py-16">
                    <Loader2 className="w-10 h-10 text-teal-500 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-500">거래처를 불러오는 중...</p>
                </div>
            )}

            {/* 목록 */}
            {!isLoading && filteredSuppliers.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredSuppliers.map(supplier => (
                        <div
                            key={supplier.id}
                            className="bg-white rounded-xl p-5 border border-wood-200 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => openEditModal(supplier)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded-full">
                                            {supplier.category}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-lg">{supplier.name}</h3>
                                    {supplier.contact_name && (
                                        <p className="text-sm text-gray-600 mt-1">담당: {supplier.contact_name}</p>
                                    )}

                                    <div className="mt-3 space-y-1">
                                        {supplier.phone && (
                                            <a
                                                href={`tel:${supplier.phone}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600"
                                            >
                                                <Phone className="w-4 h-4" />
                                                {supplier.phone}
                                            </a>
                                        )}
                                        {supplier.address && (
                                            <p className="flex items-center gap-2 text-sm text-gray-500">
                                                <MapPin className="w-4 h-4" />
                                                {supplier.address}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteSupplier(supplier.id); }}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 빈 상태 */}
            {!isLoading && filteredSuppliers.length === 0 && (
                <div className="text-center py-16">
                    <Handshake className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">등록된 거래처가 없어요</p>
                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 mt-4 text-teal-600 hover:text-teal-700 font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        첫 거래처 등록하기
                    </button>
                </div>
            )}

            {/* 모달 */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800">
                                {editingSupplier ? '거래처 수정' : '거래처 추가'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">업체명 *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-3 border border-wood-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                                    placeholder="예: 가락시장 채소도매"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">담당자</label>
                                    <input
                                        type="text"
                                        value={formData.contact_name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                                        className="w-full px-4 py-3 border border-wood-200 rounded-xl outline-none"
                                        placeholder="예: 김사장님"
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
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full px-4 py-3 border border-wood-200 rounded-xl outline-none"
                                    placeholder="02-1234-5678"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                    className="w-full px-4 py-3 border border-wood-200 rounded-xl outline-none"
                                    placeholder="서울시 송파구 가락동..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">메모 (거래조건 등)</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-wood-200 rounded-xl outline-none resize-none"
                                    placeholder="예: 매주 화/금 배송, 최소주문 10만원"
                                />
                            </div>

                            <button
                                onClick={saveSupplier}
                                className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl transition-colors"
                            >
                                {editingSupplier ? '수정하기' : '추가하기'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
