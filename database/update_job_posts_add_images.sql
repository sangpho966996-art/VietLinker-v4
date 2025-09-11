
ALTER TABLE public.job_posts 
ADD COLUMN images TEXT[];

CREATE INDEX idx_job_posts_images ON public.job_posts USING GIN(images);
