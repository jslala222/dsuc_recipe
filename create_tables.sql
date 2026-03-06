
-- 기존 recipes 테이블이 있다면 유지하되, 없으면 생성
create table if not exists public.recipes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  image_url text, -- 대표 이미지
  ingredients text,
  instructions text, -- 간단 설명 (하위 호환)
  chef_tips text,
  category text,
  cooking_time integer,
  difficulty text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 레시피 단계(Step) 테이블 생성 (다중 이미지 지원)
create table if not exists public.recipe_steps (
  id uuid default gen_random_uuid() primary key,
  recipe_id uuid references public.recipes(id) on delete cascade not null,
  step_number integer not null,
  description text,
  images text[], -- 이미지 URL 배열
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security) 활성화 (선택 사항이나 권장)
alter table public.recipes enable row level security;
alter table public.recipe_steps enable row level security;

-- 누구나 읽기/쓰기 가능하도록 정책 설정 (개발 편의성 위해 public 오픈)
-- 주의: 실제 서비스 배포 시에는 로그인한 유저만 쓰기 가능하도록 수정 필요
create policy "Allow public access" on public.recipes for all using (true) with check (true);
create policy "Allow public access" on public.recipe_steps for all using (true) with check (true);

-- Storage 버킷 생성 (매번 실행해도 안전하도록)
insert into storage.buckets (id, name, public)
values ('recipes', 'recipes', true)
on conflict (id) do nothing;

-- Storage 정책 설정 (누구나 업로드/다운로드 가능)
create policy "Public Access" on storage.objects for all using ( bucket_id = 'recipes' ) with check ( bucket_id = 'recipes' );
