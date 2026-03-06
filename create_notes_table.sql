-- [특이사항] 테이블 생성 (recipe_notes)
-- 이 테이블이 없어서 저장이 안 되던 문제를 해결합니다.

create table if not exists public.recipe_notes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text,
  category text,
  images text[], -- 다중 이미지 저장
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 보안 설정 (RLS)
alter table public.recipe_notes enable row level security;
drop policy if exists "Allow all access notes" on public.recipe_notes;
create policy "Allow all access notes" on public.recipe_notes for all using (true) with check (true);
