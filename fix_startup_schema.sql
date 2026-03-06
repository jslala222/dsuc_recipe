-- [창업 준비 로그] 누락된 'date' 컬럼 추가 및 컬럼명 동기화

-- 1. date 컬럼 추가 (날짜 선택 기능용)
alter table public.startup_logs add column if not exists "date" date default current_date;

-- 2. 보안 정책 재확인
alter table public.startup_logs enable row level security;
drop policy if exists "Allow public access" on public.startup_logs;
drop policy if exists "Public Access 5" on public.startup_logs;
drop policy if exists "All5" on public.startup_logs;

create policy "Allow all startup logs" on public.startup_logs for all using (true) with check (true);
