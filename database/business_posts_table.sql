CREATE TABLE IF NOT EXISTS business_posts (
  id BIGSERIAL PRIMARY KEY,
  business_profile_id BIGINT REFERENCES business_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'general',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE business_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view posts for active businesses" ON business_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM business_profiles 
      WHERE id = business_profile_id 
      AND status = 'active'
    )
  );

CREATE POLICY "Business owners can manage their posts" ON business_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM business_profiles 
      WHERE id = business_profile_id 
      AND user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS business_posts_business_profile_id_idx ON business_posts(business_profile_id);
CREATE INDEX IF NOT EXISTS business_posts_post_type_idx ON business_posts(post_type);
CREATE INDEX IF NOT EXISTS business_posts_featured_idx ON business_posts(featured);
CREATE INDEX IF NOT EXISTS business_posts_created_at_idx ON business_posts(created_at DESC);

CREATE TRIGGER handle_business_posts_updated_at
  BEFORE UPDATE ON business_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
