-- 거래처 관리 테이블 생성
create table if not exists public.suppliers (
  id uuid default gen_random_uuid() primary key,
  name text not null, -- 거래처명
  contact_name text, -- 담당자 이름
  phone text, -- 연락처
  email text, -- 이메일
  category text not null, -- '식자재', '주류', '인테리어/설비', '배달대행', '기타'
  address text, -- 주소
  notes text, -- 메모 (거래 조건 등)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS 활성화
alter table public.suppliers enable row level security;

-- 누구나 읽기/쓰기 가능 정책 (개발 편의성)
create policy "Allow public access" on public.suppliers for all using (true) with check (true);
