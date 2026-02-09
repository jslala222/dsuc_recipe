// Path: src/app/notes/new/page.tsx
// Description: 새 메모 작성 - 이미지 다중 업로드 지원

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, ImagePlus, X, Loader2 } from 'lucide-react';
import { supabase, uploadRecipeImage } from '@/lib/supabase';

const categories = ['일상', '아이디어', '중요', '가족', '여행', '기타'];

export default function NewNotePage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: '일상',
        images: [] as string[]
    });

    // 이미지 추가
    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        for (const file of Array.from(files)) {
            // 미리보기 먼저 추가
            const previewUrl = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, images: [...prev.images, previewUrl] }));

            // Supabase에 업로드
            const uploadedUrl = await uploadRecipeImage(file);
            if (uploadedUrl) {
                setFormData(prev => ({
                    ...prev,
                    images: prev.images.map(img => img === previewUrl ? uploadedUrl : img)
                }));
            }
        }
    }

    // 이미지 삭제
    function removeImage(index: number) {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    }

    // 저장
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!supabase) return;
        if (!formData.title.trim()) {
            alert('제목을 입력해주세요.');
            return;
        }

        setIsSaving(true);
        try {
            const { data, error } = await supabase
                .from('recipe_notes')
                .insert([{
                    title: formData.title,
                    content: formData.content,
                    category: formData.category,
                    images: formData.images,
                    updated_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;
            router.push(`/notes/${data.id}`);
        } catch (err) {
            console.error('저장 실패:', err);
            alert('저장 중 문제가 발생했어요.');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* 상단 */}
            <div className="flex items-center justify-between mb-6">
                <Link
                    href="/notes"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>취소</span>
                </Link>

                <button
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white rounded-xl font-medium transition-colors"
                >
                    {isSaving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    저장
                </button>
            </div>

            {/* 폼 */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-wood-200 p-6 space-y-6">
                {/* 이미지 업로드 */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">📷 사진</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {formData.images.map((img, idx) => (
                            <div key={idx} className="aspect-square rounded-xl overflow-hidden relative group">
                                <img src={img} alt="" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(idx)}
                                    className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}

                        <label className="aspect-square rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 flex flex-col items-center justify-center cursor-pointer hover:bg-amber-100 transition-colors">
                            <ImagePlus className="w-8 h-8 text-amber-400" />
                            <span className="text-xs text-amber-600 mt-1">추가</span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                        </label>
                    </div>
                </div>

                {/* 카테고리 */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">📂 카테고리</label>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${formData.category === cat
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 제목 */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">✏️ 제목 *</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-3 border border-wood-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-lg"
                        placeholder="무슨 일이 있었나요?"
                    />
                </div>

                {/* 내용 */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">📝 내용</label>
                    <textarea
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        rows={10}
                        className="w-full px-4 py-3 border border-wood-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                        placeholder="자세한 내용을 적어주세요..."
                    />
                </div>
            </form>
        </div>
    );
}
