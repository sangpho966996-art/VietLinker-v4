
CREATE TABLE IF NOT EXISTS business_gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_path TEXT NOT NULL,
  caption TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE business_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gallery images" ON business_gallery
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gallery images" ON business_gallery
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gallery images" ON business_gallery
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own gallery images" ON business_gallery
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS business_gallery_user_id_idx ON business_gallery(user_id);
CREATE INDEX IF NOT EXISTS business_gallery_uploaded_at_idx ON business_gallery(uploaded_at DESC);

SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'business_gallery' 
ORDER BY ordinal_position;
