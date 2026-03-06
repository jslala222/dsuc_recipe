// Path: src/lib/supabase.ts
// Description: Supabase 클라이언트 설정 및 레시피 타입 정의

import { createClient } from '@supabase/supabase-js';

// 환경 변수에서 Supabase 설정 가져오기
// 환경 변수에서 Supabase 설정 가져오기 (Vercel 설정이 어려우신 경우를 위해 기본값 포함)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jsdqmsbqtgdacccqkrjm.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzZHFtc2JxdGdkYWNjY3FrcmptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNTI5ODMsImV4cCI6MjA4NDkyODk4M30.7ADXbt6pT-MF1KYybdGE7wbtK5YaULby2OLwh65cj2c';

// Supabase 클라이언트 생성
export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// 레시피 단계 타입 정의 (이미지 포함)
export interface RecipeStep {
    id: string;
    recipe_id: string;
    step_number: number;
    description: string;
    images?: string[]; // 다중 이미지 지원을 위해 배열로 변경
    image_url?: string; // 하위 호환성 (단일 이미지 시절 데이터)
}

// ====== 장보기 일정 타입 ======
export interface ShoppingTrip {
    id: string;
    date: string;
    place: string;
    status: '계획' | '완료';
    total_expected: number;
    total_actual: number;
    notes: string;
    created_at: string;
    items?: ShoppingItem[];
}

// ====== 테이블 이름 상수 (원본 테이블 이름) ======
export const TABLE_RECIPES = 'recipes';
export const TABLE_RECIPE_STEPS = 'recipe_steps';
export const TABLE_SHOPPING_TRIPS = 'shopping_trips';
export const TABLE_SHOPPING_ITEMS = 'shopping_items';
export const TABLE_STARTUP_LOGS = 'startup_logs';
export const TABLE_ACCOUNTING = 'accounting_records';
export const TABLE_SUPPLIERS = 'suppliers';
export const TABLE_RESERVATIONS = 'reservations';
export const TABLE_CUSTOMERS = 'customers';
export const TABLE_NOTES = 'notes';

// ====== 장보기 품목 타입 ======
export interface ShoppingItem {
    id: string;
    trip_id: string;
    name: string;
    category: string;
    expected_quantity: number;
    expected_price: number;
    actual_quantity: number;
    actual_price: number;
    unit: string;
    is_purchased: boolean;
    created_at: string;
}

// ====== 창업 준비 로그 타입 ======
export interface StartupLog {
    id: string;
    title: string;
    category: string;
    content: string;
    status: '진행중' | '완료' | '보류';
    due_date: string;
    created_at: string;
}

// ====== 세무/회계 노트 타입 ======
export interface AccountingRecord {
    id: string;
    date: string;
    type: '수입' | '지출';
    category: string;
    amount: number;
    description: string;
    receipt_url: string;
    created_at: string;
}

// ====== 거래처 관리 타입 ======
export interface Supplier {
    id: string;
    name: string;
    contact_name: string;
    phone: string;
    email: string;
    address: string;
    category: string;
    notes: string;
    created_at: string;
}

// ====== 예약 시스템 타입 ======
export interface Reservation {
    id: string;
    customer_name: string;
    phone: string;
    date: string;
    time: string;
    party_size: number;
    status: '예약완료' | '방문완료' | '취소' | '노쇼';
    notes: string;
    created_at: string;
}

// ====== 고객 관리 타입 ======
export interface Customer {
    id: string;
    name: string;
    phone: string;
    email: string;
    visit_count: number;
    preferences: string;
    notes: string;
    is_vip: boolean;
    created_at: string;
}

// ====== 특이사항 메모 타입 ======
export interface Note {
    id: string;
    title: string;
    content: string;
    images: string[];
    category: string;
    created_at: string;
    updated_at: string;
}

// 레시피 타입 정의
export interface Recipe {
    id: string;
    title: string;
    description: string;
    image_url: string;
    ingredients: string;
    instructions: string; // 하위 호환성을 위해 유지 (텍스트만 있는 경우)
    steps?: RecipeStep[]; // 단계별 이미지/설명 (신규 기능)
    chef_tips: string;
    category: string;
    cooking_time: number;
    difficulty: '쉬움' | '보통' | '어려움';
    created_at: string;
    updated_at: string;
}

// 임시 데이터 (테이블 생성 전까지 사용)
export const mockRecipes: Recipe[] = [
    {
        id: '1',
        title: '된장찌개',
        description: '구수하고 진한 된장찌개. 밥 한 공기 뚝딱!',
        image_url: '',
        ingredients: '된장 2큰술\n두부 1/2모\n애호박 1/3개\n양파 1/4개\n청양고추 1개\n대파 1/2대\n다진마늘 1작은술',
        instructions: '냄비에 물 2컵을 넣고 끓인다\n된장을 풀어준다\n감자, 양파를 넣고 5분 끓인다\n두부, 애호박을 넣고 5분 더 끓인다\n청양고추, 대파, 마늘을 넣고 마무리',
        chef_tips: '💡 된장은 한 번 끓인 후 풀어야 덩어리가 생기지 않아요!',
        category: '한식',
        cooking_time: 20,
        difficulty: '쉬움',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
    },
    {
        id: '2',
        title: '김치볶음밥',
        description: '묵은 김치로 만드는 고소한 볶음밥',
        image_url: '',
        ingredients: '밥 1공기\n묵은 김치 1컵\n참기름 1큰술\n계란 1개\n김가루 약간\n깨 약간',
        instructions: '팬에 참기름을 두르고 김치를 볶는다\n밥을 넣고 함께 볶는다\n간이 안 맞으면 김치국물 추가\n계란 프라이를 올린다\n김가루, 깨를 뿌려 완성',
        chef_tips: '💡 불을 강하게 해야 밥이 눌지 않고 고슬고슬해져요!',
        category: '한식',
        cooking_time: 15,
        difficulty: '쉬움',
        created_at: '2024-01-16T14:00:00Z',
        updated_at: '2024-01-16T14:00:00Z',
    },
    {
        id: '3',
        title: '파스타 알리오 올리오',
        description: '심플하지만 맛있는 오일 파스타',
        image_url: '',
        ingredients: '스파게티면 100g\n마늘 5쪽\n올리브오일 4큰술\n페퍼론치노 2개\n파슬리 약간\n소금 약간',
        instructions: '면을 소금물에 삶는다 (알덴테)\n팬에 올리브오일과 마늘을 약불로 볶는다\n마늘이 노릇해지면 페퍼론치노 추가\n삶은 면과 면수 1국자를 넣고 섞는다\n파슬리를 뿌려 완성',
        chef_tips: '💡 마늘은 반드시 약불에서 천천히 익혀야 향이 살아요!',
        category: '양식',
        cooking_time: 25,
        difficulty: '보통',
        created_at: '2024-01-17T18:00:00Z',
        updated_at: '2024-01-17T18:00:00Z',
    },
];

/**
 * 이미지를 Supabase Storage에 업로드하고 Public URL을 반환합니다.
 * @param file - 업로드할 이미지 파일 (Blob 또는 File)
 * @param path - 저장할 경로 (예: 'recipes/image.jpg')
 */
export async function uploadRecipeImage(file: Blob | File): Promise<string | null> {
    if (!supabase) return null;

    try {
        const fileExt = file.type.split('/')[1] || 'jpg';
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('recipes')
            .upload(filePath, file);

        if (uploadError) {
            console.error('이미지 업로드 실패:', uploadError);
            throw uploadError;
        }

        const { data } = supabase.storage
            .from('recipes')
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (error) {
        console.error('이미지 업로드 에러:', error);
        return null;
    }
}
