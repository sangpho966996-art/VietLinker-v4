ALTER TABLE public.marketplace_posts 
ADD COLUMN IF NOT EXISTS condition TEXT;

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'marketplace_posts' 
AND column_name = 'condition';
