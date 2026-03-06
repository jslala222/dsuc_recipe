-- 창업 준비 로그 테이블 생성
create table if not exists public.startup_logs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text not null, -- '상권', '인테리어', '아이디어', '행정', '기타'
  content text,
  images text[], -- 사진 URL 배열
  date date default CURRENT_DATE,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS 활성화
alter table public.startup_logs enable row level security;

-- 누구나 읽기/쓰기 가능 정책 (개발 편의성)
create policy "Allow public access" on public.startup_logs for all using (true) with check (true);
