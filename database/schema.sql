
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  credits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.marketplace_posts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  category TEXT NOT NULL,
  location TEXT,
  images TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'sold', 'deleted')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.job_posts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  company TEXT,
  location TEXT,
  salary_min DECIMAL(10,2),
  salary_max DECIMAL(10,2),
  job_type TEXT NOT NULL CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'filled', 'deleted')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.real_estate_posts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2),
  property_type TEXT NOT NULL CHECK (property_type IN ('house', 'apartment', 'condo', 'townhouse', 'land', 'commercial')),
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  square_feet INTEGER,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  images TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'sold', 'rented', 'deleted')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.business_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL CHECK (business_type IN ('food', 'service')),
  description TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  cover_image TEXT,
  logo TEXT,
  hours JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.credit_transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'deduction', 'refund')),
  description TEXT NOT NULL,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_marketplace_posts_user_id ON public.marketplace_posts(user_id);
CREATE INDEX idx_marketplace_posts_status ON public.marketplace_posts(status);
CREATE INDEX idx_marketplace_posts_category ON public.marketplace_posts(category);
CREATE INDEX idx_marketplace_posts_created_at ON public.marketplace_posts(created_at DESC);

CREATE INDEX idx_job_posts_user_id ON public.job_posts(user_id);
CREATE INDEX idx_job_posts_status ON public.job_posts(status);
CREATE INDEX idx_job_posts_job_type ON public.job_posts(job_type);
CREATE INDEX idx_job_posts_created_at ON public.job_posts(created_at DESC);

CREATE INDEX idx_real_estate_posts_user_id ON public.real_estate_posts(user_id);
CREATE INDEX idx_real_estate_posts_status ON public.real_estate_posts(status);
CREATE INDEX idx_real_estate_posts_property_type ON public.real_estate_posts(property_type);
CREATE INDEX idx_real_estate_posts_created_at ON public.real_estate_posts(created_at DESC);

CREATE INDEX idx_business_profiles_user_id ON public.business_profiles(user_id);
CREATE INDEX idx_business_profiles_business_type ON public.business_profiles(business_type);
CREATE INDEX idx_business_profiles_status ON public.business_profiles(status);

CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_marketplace_posts_updated_at
  BEFORE UPDATE ON public.marketplace_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_job_posts_updated_at
  BEFORE UPDATE ON public.job_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_real_estate_posts_updated_at
  BEFORE UPDATE ON public.real_estate_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_business_profiles_updated_at
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_estate_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view active marketplace posts" ON public.marketplace_posts
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can create marketplace posts" ON public.marketplace_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own marketplace posts" ON public.marketplace_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active job posts" ON public.job_posts
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can create job posts" ON public.job_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job posts" ON public.job_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active real estate posts" ON public.real_estate_posts
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can create real estate posts" ON public.real_estate_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own real estate posts" ON public.real_estate_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active business profiles" ON public.business_profiles
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can create business profiles" ON public.business_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business profiles" ON public.business_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own credit transactions" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create credit transactions" ON public.credit_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.deduct_credits_for_post(
  user_uuid UUID,
  post_type TEXT,
  days INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
  credits_needed INTEGER;
BEGIN
  credits_needed := days;
  
  SELECT credits INTO current_credits
  FROM public.users
  WHERE id = user_uuid;
  
  IF current_credits < credits_needed THEN
    RETURN FALSE;
  END IF;
  
  UPDATE public.users
  SET credits = credits - credits_needed
  WHERE id = user_uuid;
  
  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (user_uuid, -credits_needed, 'deduction', 'Posted ' || post_type || ' for ' || days || ' days');
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.add_credits(
  user_uuid UUID,
  credit_amount INTEGER,
  payment_intent_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.users
  SET credits = credits + credit_amount
  WHERE id = user_uuid;
  
  INSERT INTO public.credit_transactions (user_id, amount, type, description, stripe_payment_intent_id)
  VALUES (user_uuid, credit_amount, 'purchase', 'Purchased ' || credit_amount || ' credits', payment_intent_id);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
