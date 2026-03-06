-- 거래처 테이블에 명함 사진 컬럼 추가
alter table public.suppliers 
add column if not exists business_card_url text;
