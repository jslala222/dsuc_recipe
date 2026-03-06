-- [고객 관리] 테이블 생성 스크립트

create table if not exists public.customers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text not null, -- 전화번호로 식별
  email text,
  visit_count integer default 0,
  total_spent integer default 0,
  preferences text, -- 선호 취향
  notes text, -- 특이사항
  is_vip boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 전화번호 및 이름 검색을 위한 인덱스 (검색 속도 향상)
create index if not exists idx_customers_phone on public.customers(phone);
create index if not exists idx_customers_name on public.customers(name);

-- 보안 설정 (RLS)
alter table public.customers enable row level security;
create policy "Allow public access" on public.customers for all using (true) with check (true);
