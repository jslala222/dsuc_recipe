-- 세무/회계 노트 테이블 생성
create table if not exists public.accounting_records (
  id uuid default gen_random_uuid() primary key,
  date date default CURRENT_DATE not null,
  type text not null check (type in ('수입', '지출')), -- '수입' 또는 '지출'
  amount integer not null default 0,
  category text not null, -- '식자재', '임대료', '인건비', '매출', '기타'
  description text,
  receipt_url text, -- 영수증 사진 URL
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS 활성화
alter table public.accounting_records enable row level security;

-- 누구나 읽기/쓰기 가능 정책 (개발 편의성)
create policy "Allow public access" on public.accounting_records for all using (true) with check (true);
