// Path: src/app/recipes/[id]/page.tsx
// Description: 레시피 상세 페이지 - Supabase에서 레시피 정보 불러오기 (다중 이미지 지원)

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Clock,
    ChefHat,
    Edit,
    Trash2,
    Lightbulb,
    UtensilsCrossed,
    ShoppingBasket,
    Loader2
} from 'lucide-react';
import { supabase, Recipe } from '@/lib/supabase';

// 난이도별 색상
const difficultyColors: Record<string, string> = {
    '쉬움': 'bg-green-100 text-green-700',
    '보통': 'bg-yellow-100 text-yellow-700',
    '어려움': 'bg-red-100 text-red-700',
};

export default function RecipeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function fetchRecipe() {
            if (!supabase || !params.id) {
                if (isMounted) setIsLoading(false);
                return;
            }

            // 5초 타임아웃 설정
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('시간 초과')), 5000)
            );

            try {
                // 1. 기본 정보 조회
                const { data: recipeData, error: recipeError } = await supabase
                    .from('recipes')
                    .select('*')
                    .eq('id', params.id)
                    .single();

                if (recipeError) throw recipeError;

                // 2. Steps 조회 (다중 이미지 포함)
                const { data: stepsData, error: stepsError } = await supabase
                    .from('recipe_steps')
                    .select('*')
                    .eq('recipe_id', params.id)
                    .order('step_number', { ascending: true });

                // 에러는 무시하고 진행

                const finalRecipe = {
                    ...recipeData,
                    steps: stepsData || []
                };

                if (isMounted) setRecipe(finalRecipe);
            } catch (err) {
                console.error('레시피 불러오기 실패:', err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        fetchRecipe();

        return () => {
            isMounted = false;
        };
    }, [params.id]);

    const handleDelete = async () => {
        if (!supabase || !recipe) return;

        setIsDeleting(true);
        try {
            const { error } = await supabase
                .from('recipes')
                .delete()
                .eq('id', recipe.id);

            if (error) throw error;

            alert('레시피가 삭제되었습니다.');
            router.push('/recipes');
        } catch (error) {
            console.error('삭제 실패:', error);
            alert('삭제 중 문제가 발생했어요.');
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-16">
                <Loader2 className="w-10 h-10 text-primary-500 mx-auto mb-4 animate-spin" />
                <p className="text-gray-500">레시피를 불러오는 중...</p>
            </div>
        );
    }

    if (!recipe) {
        return (
            <div className="text-center py-16">
                <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">레시피를 찾을 수 없어요</p>
                <Link href="/recipes" className="text-primary-600 hover:underline mt-2 inline-block">
                    목록으로 돌아가기
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {/* 상단 네비게이션 */}
            <div className="flex items-center justify-between">
                <Link
                    href="/recipes"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>목록으로</span>
                </Link>
                <div className="flex items-center gap-2">
                    <Link
                        href={`/recipes/${recipe.id}/edit`}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-wood-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                        <span className="hidden sm:inline">수정</span>
                    </Link>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">삭제</span>
                    </button>
                </div>
            </div>

            {/* 메인 이미지 & 헤더 (기존 코드 유지) */}
            <div className="relative w-full max-w-3xl mx-auto aspect-[4/3] sm:aspect-[3/2] bg-gray-100 rounded-2xl overflow-hidden border border-wood-100 shadow-sm">
                {recipe.image_url ? (
                    <img
                        src={recipe.image_url}
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-wood-100">
                        <ChefHat className="w-24 h-24 text-primary-300" />
                    </div>
                )}
            </div>

            <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                        {recipe.category || '기타'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyColors[recipe.difficulty || '보통'] || difficultyColors['보통']}`}>
                        {recipe.difficulty || '보통'}
                    </span>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{recipe.cooking_time || 30}분</span>
                    </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{recipe.title}</h1>
                {recipe.description && (
                    <p className="text-gray-500 mt-2">{recipe.description}</p>
                )}
            </div>

            {/* 재료 */}
            <section className="bg-white rounded-2xl p-5 border border-wood-100 shadow-sm">
                <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2 mb-4">
                    <ShoppingBasket className="w-5 h-5 text-primary-600" />
                    재료
                </h2>
                <ul className="space-y-2">
                    {recipe.ingredients.split('\n').filter(Boolean).map((ingredient, index) => (
                        <li key={index} className="flex items-center gap-3 text-gray-700">
                            <span className="w-2 h-2 bg-primary-400 rounded-full flex-shrink-0" />
                            {ingredient}
                        </li>
                    ))}
                </ul>
            </section>

            {/* 조리 순서 - 다중 이미지 지원 */}
            <section className="bg-white rounded-2xl p-5 border border-wood-100 shadow-sm">
                <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2 mb-4">
                    <UtensilsCrossed className="w-5 h-5 text-primary-600" />
                    조리 순서
                </h2>
                <div className="space-y-8">
                    {recipe.steps && recipe.steps.length > 0 ? (
                        // 신규 방식: 단계별 이미지 + 텍스트
                        recipe.steps
                            .sort((a, b) => a.step_number - b.step_number)
                            .map((step) => (
                                <div key={step.id} className="flex gap-4">
                                    <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold mt-1">
                                        {step.step_number}
                                    </span>
                                    <div className="flex-1 space-y-3">
                                        <p className="text-gray-700 leading-relaxed text-lg">{step.description}</p>

                                        {/* 다중 이미지 갤러리 */}
                                        {step.images && step.images.length > 0 && (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                                                {step.images.map((img, idx) => (
                                                    <div key={idx} className="rounded-xl overflow-hidden border border-wood-100 h-32 sm:h-40">
                                                        <img
                                                            src={img}
                                                            alt={`${step.step_number}단계 사진 ${idx + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {/* 하위 호환: image_url이 있고 images가 없는 경우 처리 */}
                                        {step.image_url && (!step.images || step.images.length === 0) && (
                                            <div className="rounded-xl overflow-hidden border border-wood-100 max-w-md mt-2">
                                                <img
                                                    src={step.image_url}
                                                    alt={`${step.step_number}단계 사진`}
                                                    className="w-full h-auto object-cover"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                    ) : (
                        // 기존 방식: 텍스트만 있는 경우 (하위 호환)
                        recipe.instructions.split('\n').filter(Boolean).map((step, index) => (
                            <div key={index} className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center text-sm font-bold mt-1">
                                    {index + 1}
                                </span>
                                <p className="text-gray-700 leading-relaxed pt-1.5">{step.replace(/^\d+\.\s*/, '')}</p>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* 셰프 팁 */}
            {recipe.chef_tips && (
                <section className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-5 border border-yellow-200">
                    <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2 mb-3">
                        <Lightbulb className="w-5 h-5 text-yellow-600" />
                        셰프 꿀팁
                    </h2>
                    <p className="text-gray-700">{recipe.chef_tips}</p>
                </section>
            )}

            {/* 삭제 모달 (기존 유지) */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">레시피 삭제</h3>
                        <p className="text-gray-600 mb-6">
                            정말 이 레시피를 삭제하시겠어요?<br />
                            삭제된 레시피는 복구할 수 없어요.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        삭제 중...
                                    </>
                                ) : (
                                    '삭제'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
