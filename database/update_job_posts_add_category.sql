
ALTER TABLE public.job_posts 
ADD COLUMN category TEXT;

CREATE INDEX idx_job_posts_category ON public.job_posts(category);
