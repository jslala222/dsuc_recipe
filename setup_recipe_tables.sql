-- [나만의 레시피] 전용 테이블 생성 SQL (recipe_ 접두사 사용)
-- 설명: 기존 백업 테이블과 혼선을 방지하기 위해 모든 테이블 명에 recipe_ 를 붙입니다.

-- 1. 레시피 메인 테이블
create table if not exists public.recipe_recipes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  image_url text,
  ingredients text,
  instructions text,
  chef_tips text,
  category text,
  cooking_time integer,
  difficulty text check (difficulty in ('쉬움', '보통', '어려움')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. 레시피 상세 단계 테이블 (다중 이미지 지원)
create table if not exists public.recipe_steps (
  id uuid default gen_random_uuid() primary key,
  recipe_id uuid references public.recipe_recipes(id) on delete cascade not null,
  step_number integer not null,
  description text,
  images text[], 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. 장보기 일정 테이블
create table if not exists public.recipe_shopping_trips (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  place text,
  status text check (status in ('계획', '완료')) default '계획',
  total_expected numeric default 0,
  total_actual numeric default 0,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. 장보기 품목 테이블
create table if not exists public.recipe_shopping_items (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references public.recipe_shopping_trips(id) on delete cascade not null,
  name text not null,
  category text,
  expected_quantity numeric default 1,
  expected_price numeric default 0,
  actual_quantity numeric default 0,
  actual_price numeric default 0,
  unit text,
  is_purchased boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. 창업 준비 로그 테이블
create table if not exists public.recipe_startup_logs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text,
  content text,
  status text check (status in ('진행중', '완료', '보류')) default '진행중',
  due_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. 세무/회계 노트 테이블
create table if not exists public.recipe_accounting_records (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  type text check (type in ('수입', '지출')) not null,
  category text,
  amount numeric not null,
  description text,
  receipt_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. 거래처 관리 테이블
create table if not exists public.recipe_suppliers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  contact_name text,
  phone text,
  email text,
  address text,
  category text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. 예약 관리 테이블
create table if not exists public.recipe_reservations (
  id uuid default gen_random_uuid() primary key,
  customer_name text not null,
  phone text,
  date date not null,
  time time not null,
  party_size integer default 1,
  status text check (status in ('예약완료', '방문완료', '취소', '노쇼')) default '예약완료',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. 고객 관리 테이블
create table if not exists public.recipe_customers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text unique,
  email text,
  visit_count integer default 0,
  preferences text,
  notes text,
  is_vip boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. 일일 특이사항 메모 테이블
create table if not exists public.recipe_notes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text,
  images text[],
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS 비활성화 (개발 편의성 및 요구사항 반영, 추후 보안 필요 시 재설정)
alter table public.recipe_recipes disable row level security;
alter table public.recipe_steps disable row level security;
alter table public.recipe_shopping_trips disable row level security;
alter table public.recipe_shopping_items disable row level security;
alter table public.recipe_startup_logs disable row level security;
alter table public.recipe_accounting_records disable row level security;
alter table public.recipe_suppliers disable row level security;
alter table public.recipe_reservations disable row level security;
alter table public.recipe_customers disable row level security;
alter table public.recipe_notes disable row level security;
