
ALTER TABLE public.users ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'));

UPDATE public.users SET role = 'admin' WHERE email = 'sangpho966996@gmail.com';

ALTER TABLE public.marketplace_posts ADD COLUMN admin_status TEXT DEFAULT 'pending' CHECK (admin_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE public.job_posts ADD COLUMN admin_status TEXT DEFAULT 'pending' CHECK (admin_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE public.real_estate_posts ADD COLUMN admin_status TEXT DEFAULT 'pending' CHECK (admin_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE public.business_profiles ADD COLUMN admin_status TEXT DEFAULT 'pending' CHECK (admin_status IN ('pending', 'approved', 'rejected'));

CREATE TABLE public.admin_actions (
  id BIGSERIAL PRIMARY KEY,
  admin_user_id TEXT REFERENCES public.users(id) NOT NULL,
  action_type TEXT NOT NULL, -- 'approve_post', 'reject_post', 'add_credits', 'block_user', etc.
  target_type TEXT NOT NULL, -- 'user', 'marketplace_post', 'job_post', 'business_profile', etc.
  target_id TEXT NOT NULL,
  details JSONB, -- Additional action details
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.content_reports (
  id BIGSERIAL PRIMARY KEY,
  reporter_user_id TEXT REFERENCES public.users(id) NOT NULL,
  content_type TEXT NOT NULL, -- 'marketplace_post', 'job_post', etc.
  content_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  admin_notes TEXT,
  admin_user_id TEXT REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Admins can view all business profiles" ON public.business_profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update all business profiles" ON public.business_profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Anyone can view active marketplace posts" ON public.marketplace_posts;
CREATE POLICY "Anyone can view approved marketplace posts" ON public.marketplace_posts
  FOR SELECT USING (status = 'active' AND admin_status = 'approved');

DROP POLICY IF EXISTS "Anyone can view active job posts" ON public.job_posts;
CREATE POLICY "Anyone can view approved job posts" ON public.job_posts
  FOR SELECT USING (status = 'active' AND admin_status = 'approved');

DROP POLICY IF EXISTS "Anyone can view active real estate posts" ON public.real_estate_posts;
CREATE POLICY "Anyone can view approved real estate posts" ON public.real_estate_posts
  FOR SELECT USING (status = 'active' AND admin_status = 'approved');

DROP POLICY IF EXISTS "Anyone can view active business profiles" ON public.business_profiles;
CREATE POLICY "Anyone can view approved business profiles" ON public.business_profiles
  FOR SELECT USING (status = 'active' AND admin_status = 'approved');

CREATE INDEX IF NOT EXISTS admin_actions_admin_user_id_idx ON public.admin_actions(admin_user_id);
CREATE INDEX IF NOT EXISTS admin_actions_created_at_idx ON public.admin_actions(created_at);
CREATE INDEX IF NOT EXISTS content_reports_status_idx ON public.content_reports(status);
CREATE INDEX IF NOT EXISTS marketplace_posts_admin_status_idx ON public.marketplace_posts(admin_status);
CREATE INDEX IF NOT EXISTS job_posts_admin_status_idx ON public.job_posts(admin_status);
CREATE INDEX IF NOT EXISTS real_estate_posts_admin_status_idx ON public.real_estate_posts(admin_status);
CREATE INDEX IF NOT EXISTS business_profiles_admin_status_idx ON public.business_profiles(admin_status);
