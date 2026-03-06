-- 예약 관리 테이블 생성
create table if not exists public.reservations (
  id uuid default gen_random_uuid() primary key,
  customer_name text not null, -- 예약자 성함
  customer_phone text not null, -- 연락처
  date date not null, -- 예약 날짜
  time time not null, -- 예약 시간
  people integer not null default 2, -- 인원 수
  status text not null default '예약', -- '예약', '방문완료', '취소'
  notes text, -- 요청사항
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS 활성화
alter table public.reservations enable row level security;

-- 누구나 읽기/쓰기 가능 정책 (개발 편의성)
create policy "Allow public access" on public.reservations for all using (true) with check (true);
