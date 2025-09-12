
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
        ALTER TABLE public.users ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'));
    END IF;
END $$;

UPDATE public.users SET role = 'admin' WHERE email = 'sangpho966996@gmail.com';

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketplace_posts' AND column_name='admin_status') THEN
        ALTER TABLE public.marketplace_posts ADD COLUMN admin_status TEXT DEFAULT 'pending' CHECK (admin_status IN ('pending', 'approved', 'rejected'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='job_posts' AND column_name='admin_status') THEN
        ALTER TABLE public.job_posts ADD COLUMN admin_status TEXT DEFAULT 'pending' CHECK (admin_status IN ('pending', 'approved', 'rejected'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='real_estate_posts' AND column_name='admin_status') THEN
        ALTER TABLE public.real_estate_posts ADD COLUMN admin_status TEXT DEFAULT 'pending' CHECK (admin_status IN ('pending', 'approved', 'rejected'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='business_profiles' AND column_name='admin_status') THEN
        ALTER TABLE public.business_profiles ADD COLUMN admin_status TEXT DEFAULT 'pending' CHECK (admin_status IN ('pending', 'approved', 'rejected'));
    END IF;
END $$;

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

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_actions' AND table_schema = 'public') THEN
        ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'content_reports' AND table_schema = 'public') THEN
        ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DROP POLICY IF EXISTS "Admins can view all admin actions" ON public.admin_actions;
CREATE POLICY "Admins can view all admin actions" ON public.admin_actions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admins can insert admin actions" ON public.admin_actions;
CREATE POLICY "Admins can insert admin actions" ON public.admin_actions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admins can view all content reports" ON public.content_reports;
CREATE POLICY "Admins can view all content reports" ON public.content_reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Users can create content reports" ON public.content_reports;
CREATE POLICY "Users can create content reports" ON public.content_reports FOR INSERT WITH CHECK (
  auth.uid() = reporter_user_id
);

DROP POLICY IF EXISTS "Admins can update content reports" ON public.content_reports;
CREATE POLICY "Admins can update content reports" ON public.content_reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'marketplace_posts' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Admins can view all marketplace posts" ON public.marketplace_posts;
        CREATE POLICY "Admins can view all marketplace posts" ON public.marketplace_posts FOR SELECT USING (
          EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
        );

        DROP POLICY IF EXISTS "Admins can update all marketplace posts" ON public.marketplace_posts;
        CREATE POLICY "Admins can update all marketplace posts" ON public.marketplace_posts FOR UPDATE USING (
          EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
        );
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'job_posts' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Admins can view all job posts" ON public.job_posts;
        CREATE POLICY "Admins can view all job posts" ON public.job_posts FOR SELECT USING (
          EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
        );

        DROP POLICY IF EXISTS "Admins can update all job posts" ON public.job_posts;
        CREATE POLICY "Admins can update all job posts" ON public.job_posts FOR UPDATE USING (
          EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
        );
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'real_estate_posts' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Admins can view all real estate posts" ON public.real_estate_posts;
        CREATE POLICY "Admins can view all real estate posts" ON public.real_estate_posts FOR SELECT USING (
          EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
        );

        DROP POLICY IF EXISTS "Admins can update all real estate posts" ON public.real_estate_posts;
        CREATE POLICY "Admins can update all real estate posts" ON public.real_estate_posts FOR UPDATE USING (
          EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
        );
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_profiles' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Admins can view all business profiles" ON public.business_profiles;
        CREATE POLICY "Admins can view all business profiles" ON public.business_profiles FOR SELECT USING (
          EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
        );

        DROP POLICY IF EXISTS "Admins can update all business profiles" ON public.business_profiles;
        CREATE POLICY "Admins can update all business profiles" ON public.business_profiles FOR UPDATE USING (
          EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
        );
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS admin_actions_admin_user_id_idx ON public.admin_actions(admin_user_id);
CREATE INDEX IF NOT EXISTS admin_actions_created_at_idx ON public.admin_actions(created_at);
CREATE INDEX IF NOT EXISTS content_reports_status_idx ON public.content_reports(status);

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketplace_posts' AND column_name='admin_status') THEN
        CREATE INDEX IF NOT EXISTS marketplace_posts_admin_status_idx ON public.marketplace_posts(admin_status);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='job_posts' AND column_name='admin_status') THEN
        CREATE INDEX IF NOT EXISTS job_posts_admin_status_idx ON public.job_posts(admin_status);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='real_estate_posts' AND column_name='admin_status') THEN
        CREATE INDEX IF NOT EXISTS real_estate_posts_admin_status_idx ON public.real_estate_posts(admin_status);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='business_profiles' AND column_name='admin_status') THEN
        CREATE INDEX IF NOT EXISTS business_profiles_admin_status_idx ON public.business_profiles(admin_status);
    END IF;
END $$;

SELECT 
    table_name,
    column_name,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'business_profiles' 
    AND column_name = 'admin_status';
