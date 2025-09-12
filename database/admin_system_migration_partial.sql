
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id BIGSERIAL PRIMARY KEY,
  admin_user_id UUID REFERENCES public.users(id) NOT NULL,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.content_reports (
  id BIGSERIAL PRIMARY KEY,
  reporter_user_id UUID REFERENCES public.users(id) NOT NULL,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  admin_notes TEXT,
  admin_user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all admin actions" ON public.admin_actions;
DROP POLICY IF EXISTS "Admins can insert admin actions" ON public.admin_actions;
DROP POLICY IF EXISTS "Admins can view all content reports" ON public.content_reports;
DROP POLICY IF EXISTS "Users can create content reports" ON public.content_reports;
DROP POLICY IF EXISTS "Admins can update content reports" ON public.content_reports;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all business profiles" ON public.business_profiles;
DROP POLICY IF EXISTS "Admins can update all business profiles" ON public.business_profiles;
DROP POLICY IF EXISTS "Admins can view all marketplace posts" ON public.marketplace_posts;
DROP POLICY IF EXISTS "Admins can update all marketplace posts" ON public.marketplace_posts;
DROP POLICY IF EXISTS "Admins can view all job posts" ON public.job_posts;
DROP POLICY IF EXISTS "Admins can update all job posts" ON public.job_posts;
DROP POLICY IF EXISTS "Admins can view all real estate posts" ON public.real_estate_posts;
DROP POLICY IF EXISTS "Admins can update all real estate posts" ON public.real_estate_posts;

CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (
  auth.uid() = id
);

CREATE POLICY "Admins can view all business profiles" ON public.business_profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update all business profiles" ON public.business_profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can view all marketplace posts" ON public.marketplace_posts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update all marketplace posts" ON public.marketplace_posts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can view all job posts" ON public.job_posts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update all job posts" ON public.job_posts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can view all real estate posts" ON public.real_estate_posts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update all real estate posts" ON public.real_estate_posts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can view all admin actions" ON public.admin_actions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can insert admin actions" ON public.admin_actions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can view all content reports" ON public.content_reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can create content reports" ON public.content_reports FOR INSERT WITH CHECK (
  auth.uid() = reporter_user_id
);

CREATE POLICY "Admins can update content reports" ON public.content_reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE INDEX IF NOT EXISTS admin_actions_admin_user_id_idx ON public.admin_actions(admin_user_id);
CREATE INDEX IF NOT EXISTS admin_actions_created_at_idx ON public.admin_actions(created_at);
CREATE INDEX IF NOT EXISTS content_reports_status_idx ON public.content_reports(status);
CREATE INDEX IF NOT EXISTS business_profiles_admin_status_idx ON public.business_profiles(admin_status);
CREATE INDEX IF NOT EXISTS marketplace_posts_admin_status_idx ON public.marketplace_posts(admin_status);
CREATE INDEX IF NOT EXISTS job_posts_admin_status_idx ON public.job_posts(admin_status);
CREATE INDEX IF NOT EXISTS real_estate_posts_admin_status_idx ON public.real_estate_posts(admin_status);
