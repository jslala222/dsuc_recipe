-- [나만의 레시피] 전체 테이블 초기화 스크립트
-- 새 프로젝트에서 이 스크립트 하나만 실행하면 모든 기능이 바로 작동합니다!

-- 1. 레시피 테이블
create table if not exists public.recipes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  image_url text,
  ingredients text,
  instructions text,
  chef_tips text,
  category text,
  cooking_time integer,
  difficulty text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. 레시피 단계 (이미지 포함)
create table if not exists public.recipe_steps (
  id uuid default gen_random_uuid() primary key,
  recipe_id uuid references public.recipes(id) on delete cascade not null,
  step_number integer not null,
  description text not null,
  images text[], -- 다중 이미지
  image_url text, -- 하위 호환
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. 장보기 목록 (쇼핑 트립)
create table if not exists public.shopping_trips (
  id uuid default gen_random_uuid() primary key,
  date date default CURRENT_DATE,
  place text,
  status text default '계획', -- '계획', '완료'
  total_expected integer default 0,
  total_actual integer default 0,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. 장보기 품목 (아이템)
create table if not exists public.shopping_items (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references public.shopping_trips(id) on delete cascade not null,
  name text not null,
  category text,
  expected_quantity integer default 1,
  expected_price integer default 0,
  actual_quantity integer default 0,
  actual_price integer default 0,
  unit text,
  is_purchased boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. 창업 준비 로그
create table if not exists public.startup_logs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text not null, -- '상권', '인테리어', '행정'
  content text,
  images text[],
  status text default '진행중', -- '진행중', '완료', '보류'
  due_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. 세무/회계 노트
create table if not exists public.accounting_records (
  id uuid default gen_random_uuid() primary key,
  date date default CURRENT_DATE,
  type text not null, -- '수입', '지출'
  category text not null,
  amount integer not null default 0,
  description text,
  receipt_url text, -- 영수증 이미지
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. 거래처 관리
create table if not exists public.suppliers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  contact_name text,
  phone text,
  email text,
  category text, -- '식자재', '주류', '설비'
  address text,
  notes text,
  business_card_url text, -- 명함 사진
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. 예약 시스템
create table if not exists public.reservations (
  id uuid default gen_random_uuid() primary key,
  customer_name text not null,
  customer_phone text not null,
  date date not null,
  time time not null,
  people integer default 2,
  status text default '예약', -- '예약', '방문완료', '취소'
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. 보안 설정 (개발용: 누구나 접속 허용)
alter table public.recipes enable row level security;
alter table public.recipe_steps enable row level security;
alter table public.shopping_trips enable row level security;
alter table public.shopping_items enable row level security;
alter table public.startup_logs enable row level security;
alter table public.accounting_records enable row level security;
alter table public.suppliers enable row level security;
alter table public.reservations enable row level security;

create policy "Public Access 1" on public.recipes for all using (true) with check (true);
create policy "Public Access 2" on public.recipe_steps for all using (true) with check (true);
create policy "Public Access 3" on public.shopping_trips for all using (true) with check (true);
create policy "Public Access 4" on public.shopping_items for all using (true) with check (true);
create policy "Public Access 5" on public.startup_logs for all using (true) with check (true);
create policy "Public Access 6" on public.accounting_records for all using (true) with check (true);
create policy "Public Access 7" on public.suppliers for all using (true) with check (true);
create policy "Public Access 8" on public.reservations for all using (true) with check (true);
