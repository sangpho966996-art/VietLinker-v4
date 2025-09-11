CREATE TABLE IF NOT EXISTS business_reviews (
  id BIGSERIAL PRIMARY KEY,
  business_profile_id BIGINT REFERENCES business_profiles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE business_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews for active businesses" ON business_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM business_profiles 
      WHERE id = business_profile_id 
      AND status = 'active'
    )
  );

CREATE POLICY "Users can create reviews" ON business_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON business_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON business_reviews
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS business_reviews_business_profile_id_idx ON business_reviews(business_profile_id);
CREATE INDEX IF NOT EXISTS business_reviews_user_id_idx ON business_reviews(user_id);
CREATE INDEX IF NOT EXISTS business_reviews_rating_idx ON business_reviews(rating);
CREATE INDEX IF NOT EXISTS business_reviews_created_at_idx ON business_reviews(created_at DESC);

CREATE TRIGGER handle_business_reviews_updated_at
  BEFORE UPDATE ON business_reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE UNIQUE INDEX business_reviews_unique_user_business 
ON business_reviews(business_profile_id, user_id);
