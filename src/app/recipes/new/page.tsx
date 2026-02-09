// Path: src/app/recipes/new/page.tsx
// Description: 새 레시피 추가 폼 - Supabase에 저장 (다중 이미지 지원)

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, ChefHat, ImagePlus, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const categories = ['한식', '양식', '중식', '일식', '디저트', '음료', '기타'];
const difficulties = ['쉬움', '보통', '어려움'];

export default function NewRecipePage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image_url: '',
        ingredients: '',
        chef_tips: '',
        category: '한식',
        cooking_time: 30,
        difficulty: '보통' as '쉬움' | '보통' | '어려움',
    });

    // 조리 순서 (Steps) 상태 관리 - 다중 이미지 지원
    const [steps, setSteps] = useState<{ id: string; description: string; images: string[] }[]>([
        { id: '1', description: '', images: [] }
    ]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'cooking_time' ? parseInt(value) || 0 : value,
        }));
    };

    // 단계 추가
    const addStep = () => {
        setSteps(prev => [
            ...prev,
            { id: Date.now().toString(), description: '', images: [] } // 고유 ID 생성
        ]);
    };

    // 단계 삭제
    const removeStep = (index: number) => {
        if (steps.length <= 1) return; // 최소 1개 유지
        setSteps(prev => prev.filter((_, i) => i !== index));
    };

    // 단계 내용 변경
    const updateStep = (index: number, value: string) => {
        setSteps(prev => {
            const newSteps = [...prev];
            newSteps[index] = { ...newSteps[index], description: value };
            return newSteps;
        });
    };

    // 단계 이미지 추가
    const addStepImage = async (index: number, file: File) => {
        try {
            const { resizeImage } = await import('@/lib/imageUtils');
            const { uploadRecipeImage } = await import('@/lib/supabase');

            const { blob, previewUrl } = await resizeImage(file);

            // 1. 미리보기 추가
            setSteps(prev => {
                const newSteps = [...prev];
                const currentImages = newSteps[index].images || [];
                newSteps[index] = { ...newSteps[index], images: [...currentImages, previewUrl] };
                return newSteps;
            });

            // 2. 업로드
            const publicUrl = await uploadRecipeImage(blob);
            if (publicUrl) {
                // 실제 URL로 교체 (마지막 요소 - 단순화된 로직)
                setSteps(prev => {
                    const newSteps = [...prev];
                    const currentImages = [...newSteps[index].images];
                    // 미리보기 URL을 찾아서 교체하는 것이 안전하지만, 순서대로 추가되므로 마지막 것을 교체
                    currentImages[currentImages.length - 1] = publicUrl;
                    newSteps[index] = { ...newSteps[index], images: currentImages };
                    return newSteps;
                });
            } else {
                alert('이미지 업로드 실패');
            }
        } catch (error) {
            console.error(error);
            alert('이미지 업로드 중 오류 발생');
        }
    };

    // 단계 이미지 삭제
    const removeStepImage = (stepIndex: number, imageIndex: number) => {
        setSteps(prev => {
            const newSteps = [...prev];
            const newImages = [...newSteps[stepIndex].images];
            newImages.splice(imageIndex, 1);
            newSteps[stepIndex] = { ...newSteps[stepIndex], images: newImages };
            return newSteps;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 유효성 검사
        if (!formData.title.trim()) return alert('레시피 이름을 입력해주세요!');
        if (!formData.ingredients.trim()) return alert('재료를 입력해주세요!');

        // 빈 단계 필터링
        const validSteps = steps.filter(step => step.description.trim() !== '');
        if (validSteps.length === 0) return alert('최소 1개 이상의 조리 순서를 입력해주세요!');

        if (!supabase) return alert('Supabase 연결이 설정되지 않았습니다.');

        setIsSubmitting(true);

        try {
            // 1. 레시피 기본 정보 저장
            const instructionsSummary = validSteps.map((s, i) => `${i + 1}. ${s.description}`).join('\n');

            const { data: recipeData, error: recipeError } = await supabase
                .from('recipes')
                .insert([{
                    ...formData,
                    instructions: instructionsSummary,
                }])
                .select()
                .single();

            if (recipeError) throw recipeError;
            if (!recipeData) throw new Error('레시피 저장 실패');

            // 2. 조리 순서 (Steps) 저장
            const stepsToInsert = validSteps.map((step, index) => ({
                recipe_id: recipeData.id,
                step_number: index + 1,
                description: step.description,
                images: step.images // 배열 저장
            }));

            const { error: stepsError } = await supabase
                .from('recipe_steps')
                .insert(stepsToInsert);

            if (stepsError) throw stepsError;

            alert('레시피가 저장되었습니다! 🎉');
            router.push('/recipes');
        } catch (error) {
            console.error('저장 실패:', error);
            alert('배운 요리법을 저장하지 못했어요. 다시 시도해주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            {/* 상단 네비게이션 */}
            <div className="flex items-center justify-between">
                <Link
                    href="/recipes"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>목록으로</span>
                </Link>
            </div>

            {/* 제목 */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <ChefHat className="w-7 h-7 text-primary-600" />
                    새 레시피 등록
                </h1>
                <p className="text-gray-500 mt-1">배운 요리법을 기록해 보세요 (단계별 사진을 여러 장 넣을 수 있어요!)</p>
            </div>

            {/* 폼 */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. 기본 정보 */}
                <section className="bg-white rounded-2xl p-5 border border-wood-100 shadow-sm space-y-4">
                    <h2 className="font-bold text-gray-800">기본 정보</h2>

                    {/* 대표 이미지 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">대표 사진</label>
                        <div className="flex gap-4">
                            <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-xl overflow-hidden border border-wood-200 flex-shrink-0">
                                {formData.image_url ? (
                                    <img src={formData.image_url} alt="대표" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <ImagePlus className="w-8 h-8" />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col justify-center">
                                <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-wood-200 rounded-xl text-gray-700 hover:bg-gray-50 cursor-pointer text-sm font-medium">
                                    <ImagePlus className="w-4 h-4" />
                                    사진 선택
                                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        try {
                                            const { resizeImage } = await import('@/lib/imageUtils');
                                            const { uploadRecipeImage } = await import('@/lib/supabase');
                                            const { blob, previewUrl } = await resizeImage(file);
                                            setFormData(prev => ({ ...prev, image_url: previewUrl }));
                                            const publicUrl = await uploadRecipeImage(blob);
                                            if (publicUrl) setFormData(prev => ({ ...prev, image_url: publicUrl }));
                                        } catch (e) { console.error(e); }
                                    }} />
                                </label>
                                <p className="text-xs text-gray-500 mt-2">요리의 완성된 모습을 보여주세요</p>
                            </div>
                        </div>
                    </div>

                    {/* 이름 & 설명 */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">요리 이름 <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="예: 된장찌개"
                                className="w-full px-4 py-3 border border-wood-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">한줄 소개</label>
                            <input
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="예: 구수하고 진한 맛"
                                className="w-full px-4 py-3 border border-wood-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* 옵션들 */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-3 border border-wood-200 rounded-xl bg-white outline-none">
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">난이도</label>
                            <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="w-full px-3 py-3 border border-wood-200 rounded-xl bg-white outline-none">
                                {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">조리 시간(분)</label>
                            <input type="number" name="cooking_time" value={formData.cooking_time} onChange={handleChange} className="w-full px-3 py-3 border border-wood-200 rounded-xl outline-none" />
                        </div>
                    </div>
                </section>

                {/* 2. 재료 */}
                <section className="bg-white rounded-2xl p-5 border border-wood-100 shadow-sm">
                    <h2 className="font-bold text-gray-800 mb-4">재료 <span className="text-red-500">*</span></h2>
                    <textarea
                        name="ingredients"
                        value={formData.ingredients}
                        onChange={handleChange}
                        rows={5}
                        placeholder="재료를 줄바꿈으로 입력해주세요.&#13;&#10;예:&#13;&#10;돼지고기 200g&#13;&#10;김치 1포기"
                        className="w-full px-4 py-3 border border-wood-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                    />
                </section>

                {/* 3. 조리 순서 (동적 폼) */}
                <section className="bg-white rounded-2xl p-5 border border-wood-100 shadow-sm">
                    <h2 className="font-bold text-gray-800 mb-4">조리 순서 <span className="text-red-500">*</span></h2>

                    <div className="space-y-8">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-sm mt-1">
                                    {index + 1}
                                </div>
                                <div className="flex-1 space-y-4">
                                    <textarea
                                        value={step.description}
                                        onChange={(e) => updateStep(index, e.target.value)}
                                        placeholder={`Step ${index + 1} 설명...`}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-wood-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                                    />

                                    {/* 다중 이미지 영역 */}
                                    <div className="flex flex-wrap gap-3">
                                        {step.images && step.images.map((img, imgIdx) => (
                                            <div key={imgIdx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group">
                                                <img src={img} alt={`단계 ${index + 1} 사진 ${imgIdx + 1}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeStepImage(index, imgIdx)}
                                                    className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                                >
                                                    삭제
                                                </button>
                                            </div>
                                        ))}

                                        {/* 사진 추가 버튼 */}
                                        <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-primary-400 hover:text-primary-500 hover:bg-primary-50 transition-all cursor-pointer">
                                            <ImagePlus className="w-6 h-6 mb-1" />
                                            <span className="text-xs">사진 추가</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    if (e.target.files?.[0]) addStepImage(index, e.target.files[0]);
                                                }}
                                            />
                                        </label>
                                    </div>

                                    {steps.length > 1 && (
                                        <div className="text-right">
                                            <button
                                                type="button"
                                                onClick={() => removeStep(index)}
                                                className="text-xs text-red-500 hover:underline"
                                            >
                                                이 단계 삭제
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={addStep}
                        className="w-full mt-6 py-3 border-2 border-dashed border-primary-200 text-primary-600 rounded-xl font-medium hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <ImagePlus className="w-5 h-5" />
                        새로운 단계 추가하기
                    </button>
                </section>

                {/* 4. 셰프 팁 */}
                <section className="bg-white rounded-2xl p-5 border border-wood-100 shadow-sm">
                    <h2 className="font-bold text-gray-800 mb-4">셰프 꿀팁 (선택)</h2>
                    <textarea
                        name="chef_tips"
                        value={formData.chef_tips}
                        onChange={handleChange}
                        rows={3}
                        placeholder="맛을 내는 비결이나 주의할 점을 적어주세요!"
                        className="w-full px-4 py-3 border border-wood-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                    />
                </section>

                {/* 저장 버튼 (하단 고정 느낌) */}
                <div className="sticky bottom-4 z-10">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-bold rounded-2xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                저장 중...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                레시피 저장하기
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
