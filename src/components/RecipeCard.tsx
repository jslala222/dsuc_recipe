// Path: src/components/RecipeCard.tsx
// Description: 레시피 카드 컴포넌트 - 목록에서 레시피를 보여주는 카드

import Link from 'next/link';
import { Clock, ChefHat } from 'lucide-react';
import { Recipe } from '@/lib/supabase';

interface RecipeCardProps {
    recipe: Recipe;
}

// 난이도별 색상 설정
const difficultyColors = {
    '쉬움': 'bg-green-100 text-green-700',
    '보통': 'bg-yellow-100 text-yellow-700',
    '어려움': 'bg-red-100 text-red-700',
};

export default function RecipeCard({ recipe }: RecipeCardProps) {
    return (
        <Link href={`/recipes/${recipe.id}`}>
            <article className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-wood-100 hover:shadow-lg hover:border-primary-200 transition-all duration-300">
                {/* 이미지 영역 */}
                <div className="relative h-40 bg-gradient-to-br from-primary-100 to-wood-100 overflow-hidden">
                    {recipe.image_url ? (
                        <img
                            src={recipe.image_url}
                            alt={recipe.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <ChefHat className="w-16 h-16 text-primary-300" />
                        </div>
                    )}
                    {/* 카테고리 뱃지 */}
                    <span className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
                        {recipe.category}
                    </span>
                </div>

                {/* 내용 영역 */}
                <div className="p-4">
                    <h3 className="font-bold text-gray-800 group-hover:text-primary-600 transition-colors line-clamp-1">
                        {recipe.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {recipe.description}
                    </p>

                    {/* 메타 정보 */}
                    <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{recipe.cooking_time}분</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${difficultyColors[recipe.difficulty]}`}>
                            {recipe.difficulty}
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
}
