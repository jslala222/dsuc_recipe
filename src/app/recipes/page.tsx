// Path: src/app/recipes/page.tsx
// Description: 레시피 목록 페이지 - Supabase에서 레시피를 불러와 표시

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Search, ChefHat, Loader2 } from 'lucide-react';
import RecipeCard from '@/components/RecipeCard';
import { supabase, Recipe } from '@/lib/supabase';

// 카테고리 목록
const categories = ['전체', '한식', '양식', '중식', '일식', '디저트', '음료', '기타'];

export default function RecipesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Supabase에서 레시피 불러오기
    useEffect(() => {
        let isMounted = true;

        async function fetchRecipes() {
            if (!supabase) {
                if (isMounted) {
                    setError('Supabase 연결이 설정되지 않았습니다.');
                    setIsLoading(false);
                }
                return;
            }

            // 5초 타임아웃 설정
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('시간 초과: 데이터를 불러오는데 너무 오래 걸립니다.')), 5000)
            );

            try {
                const fetchPromise = supabase
                    .from('recipes')
                    .select('*')
                    .order('created_at', { ascending: false });

                const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

                if (error) throw error;
                if (isMounted) setRecipes(data || []);
            } catch (err) {
                console.error('레시피 불러오기 실패:', err);
                if (isMounted) setError('레시피를 불러올 수 없습니다. 데이터베이스 연결을 확인해주세요.');
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        fetchRecipes();

        return () => {
            isMounted = false;
        };
    }, []);

    // 검색 및 필터링
    const filteredRecipes = useMemo(() => {
        return recipes.filter(recipe => {
            const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (recipe.description?.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCategory = selectedCategory === '전체' || recipe.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [recipes, searchQuery, selectedCategory]);

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <ChefHat className="w-7 h-7 text-primary-600" />
                        레시피 저장소
                    </h1>
                    <p className="text-gray-500 mt-1">배운 요리법을 기록하세요</p>
                </div>
                <Link
                    href="/recipes/new"
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">새 레시피</span>
                </Link>
            </div>

            {/* 검색 및 필터 */}
            <div className="space-y-3">
                {/* 검색창 */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="레시피 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-wood-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                </div>

                {/* 카테고리 필터 */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                                ${selectedCategory === category
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-white border border-wood-200 text-gray-600 hover:border-primary-300'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* 로딩 상태 */}
            {isLoading && (
                <div className="text-center py-16">
                    <Loader2 className="w-10 h-10 text-primary-500 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-500">레시피를 불러오는 중...</p>
                </div>
            )}

            {/* 에러 상태 */}
            {error && !isLoading && (
                <div className="text-center py-16">
                    <p className="text-red-500 mb-2">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-primary-600 hover:underline"
                    >
                        다시 시도
                    </button>
                </div>
            )}

            {/* 레시피 그리드 */}
            {!isLoading && !error && filteredRecipes.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRecipes.map(recipe => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                </div>
            )}

            {/* 빈 상태 */}
            {!isLoading && !error && filteredRecipes.length === 0 && (
                <div className="text-center py-16">
                    <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                        {searchQuery || selectedCategory !== '전체'
                            ? '검색 결과가 없어요'
                            : '아직 등록된 레시피가 없어요'}
                    </p>
                    <Link
                        href="/recipes/new"
                        className="inline-flex items-center gap-2 mt-4 text-primary-600 hover:text-primary-700 font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        첫 레시피 등록하기
                    </Link>
                </div>
            )}

            {/* 레시피 개수 */}
            {!isLoading && !error && filteredRecipes.length > 0 && (
                <p className="text-center text-sm text-gray-400">
                    총 {filteredRecipes.length}개의 레시피
                </p>
            )}
        </div>
    );
}
