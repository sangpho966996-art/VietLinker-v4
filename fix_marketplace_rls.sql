
DROP POLICY IF EXISTS "Anyone can view approved marketplace posts" ON public.marketplace_posts;
CREATE POLICY "Anyone can view active marketplace posts" ON public.marketplace_posts
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Anyone can view approved job posts" ON public.job_posts;
CREATE POLICY "Anyone can view active job posts" ON public.job_posts
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Anyone can view approved real estate posts" ON public.real_estate_posts;
CREATE POLICY "Anyone can view active real estate posts" ON public.real_estate_posts
  FOR SELECT USING (status = 'active');
