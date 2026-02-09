// Path: src/app/startup/page.tsx
// Description: 창업 준비 로그 - 입지 분석, 인테리어, 행정 절차 기록

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Building2, Loader2, Calendar, CheckCircle, Clock, Pause, Trash2, X, Edit } from 'lucide-react';
import { supabase, StartupLog } from '@/lib/supabase';

const categories = ['전체', '입지분석', '인테리어', '행정절차', '자금계획', '메뉴개발', '기타'];
const statusOptions = ['진행중', '완료', '보류'];

const statusConfig: Record<string, { icon: React.ReactNode; color: string }> = {
    '진행중': { icon: <Clock className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700' },
    '완료': { icon: <CheckCircle className="w-4 h-4" />, color: 'bg-green-100 text-green-700' },
    '보류': { icon: <Pause className="w-4 h-4" />, color: 'bg-gray-100 text-gray-600' },
};

export default function StartupPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [logs, setLogs] = useState<StartupLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingLog, setEditingLog] = useState<StartupLog | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        category: '기타',
        content: '',
        status: '진행중',
        due_date: ''
    });

    useEffect(() => {
        fetchLogs();
    }, []);

    async function fetchLogs() {
        if (!supabase) {
            setIsLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('recipe_startup')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLogs(data || []);
        } catch (err) {
            console.error('로그 불러오기 실패:', err);
        } finally {
            setIsLoading(false);
        }
    }

    function openAddModal() {
        setEditingLog(null);
        setFormData({ title: '', category: '기타', content: '', status: '진행중', due_date: '' });
        setShowModal(true);
    }

    function openEditModal(log: StartupLog) {
        setEditingLog(log);
        setFormData({
            title: log.title,
            category: log.category,
            content: log.content,
            status: log.status,
            due_date: log.due_date || ''
        });
        setShowModal(true);
    }

    async function saveLog() {
        if (!supabase || !formData.title.trim()) return;

        try {
            if (editingLog) {
                // 수정
                const { error } = await supabase
                    .from('recipe_startup')
                    .update(formData)
                    .eq('id', editingLog.id);
                if (error) throw error;
                setLogs(prev => prev.map(l => l.id === editingLog.id ? { ...l, ...formData } : l));
            } else {
                // 추가
                const { data, error } = await supabase
                    .from('recipe_startup')
                    .insert([formData])
                    .select()
                    .single();
                if (error) throw error;
                setLogs(prev => [data, ...prev]);
            }
            setShowModal(false);
        } catch (err) {
            console.error('저장 실패:', err);
            alert('저장 중 문제가 발생했어요.');
        }
    }

    async function deleteLog(id: string) {
        if (!supabase) return;
        if (!confirm('정말 삭제할까요?')) return;

        try {
            await supabase.from('recipe_startup').delete().eq('id', id);
            setLogs(prev => prev.filter(l => l.id !== id));
        } catch (err) {
            console.error('삭제 실패:', err);
        }
    }

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesSearch = log.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === '전체' || log.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [logs, searchQuery, selectedCategory]);

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Building2 className="w-7 h-7 text-blue-600" />
                        창업 준비 로그
                    </h1>
                    <p className="text-gray-500 mt-1">창업까지의 여정을 기록하세요</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">새 로그</span>
                </button>
            </div>

            {/* 검색 및 필터 */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="로그 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-wood-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                                ${selectedCategory === category
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white border border-wood-200 text-gray-600 hover:border-blue-300'
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
                    <Loader2 className="w-10 h-10 text-blue-500 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-500">로그를 불러오는 중...</p>
                </div>
            )}

            {/* 목록 */}
            {!isLoading && filteredLogs.length > 0 && (
                <div className="space-y-3">
                    {filteredLogs.map(log => (
                        <div
                            key={log.id}
                            className="bg-white rounded-xl p-5 border border-wood-200 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => openEditModal(log)}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                            {log.category}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${statusConfig[log.status]?.color}`}>
                                            {statusConfig[log.status]?.icon}
                                            {log.status}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-gray-800">{log.title}</h3>
                                    {log.content && (
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{log.content}</p>
                                    )}
                                    {log.due_date && (
                                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            마감: {log.due_date}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteLog(log.id); }}
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
            {!isLoading && filteredLogs.length === 0 && (
                <div className="text-center py-16">
                    <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">창업 준비 로그가 없어요</p>
                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        첫 로그 작성하기
                    </button>
                </div>
            )}

            {/* 모달 */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800">
                                {editingLog ? '로그 수정' : '새 로그'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-4 py-3 border border-wood-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="예: 상가 임대차 계약 준비"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                        className="w-full px-4 py-3 border border-wood-200 rounded-xl bg-white outline-none"
                                    >
                                        {statusOptions.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">마감일</label>
                                <input
                                    type="date"
                                    value={formData.due_date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                                    className="w-full px-4 py-3 border border-wood-200 rounded-xl outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                    rows={5}
                                    className="w-full px-4 py-3 border border-wood-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    placeholder="상세 내용을 적어주세요..."
                                />
                            </div>

                            <button
                                onClick={saveLog}
                                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors"
                            >
                                {editingLog ? '수정하기' : '추가하기'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
