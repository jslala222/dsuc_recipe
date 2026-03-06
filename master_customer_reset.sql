-- [고객 관리] 마스터 리셋 및 캐시 강제 갱신
-- 이 코드는 테이블을 아예 새로 만들어서 "column not found" 에러를 확실히 해결합니다.

-- 1. 기존 테이블 삭제 (데이터가 삭제되니 주의하세요! 아직 등록 전이라면 안전합니다)
drop table if exists public.customers;

-- 2. 테이블 새롭게 생성 (코드와 100% 일치시킴)
create table public.customers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text not null,
  email text,
  visit_count integer default 0,
  preferences text,
  notes text,
  is_vip boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. 보안 정책 재설정 (RLS)
alter table public.customers enable row level security;
create policy "Allow all customers access" on public.customers for all using (true) with check (true);

-- 4. 인덱스 다시 생성 (검색 속도용)
create index idx_customers_name on public.customers(name);
create index idx_customers_phone on public.customers(phone);

-- 5. 캐시 갱신을 위한 '너지(Nudge)' - 더미 컬럼 추가 후 삭제
alter table public.customers add column "_refresh_cache" text;
alter table public.customers drop column "_refresh_cache";
