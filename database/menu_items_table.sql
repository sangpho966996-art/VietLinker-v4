CREATE TABLE IF NOT EXISTS menu_items (
  id BIGSERIAL PRIMARY KEY,
  business_profile_id BIGINT REFERENCES business_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  category TEXT NOT NULL,
  available BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view menu items for active businesses" ON menu_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM business_profiles 
      WHERE id = business_profile_id 
      AND status = 'active'
    )
  );

CREATE POLICY "Business owners can manage their menu items" ON menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM business_profiles 
      WHERE id = business_profile_id 
      AND user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS menu_items_business_profile_id_idx ON menu_items(business_profile_id);
CREATE INDEX IF NOT EXISTS menu_items_category_idx ON menu_items(category);
CREATE INDEX IF NOT EXISTS menu_items_available_idx ON menu_items(available);

CREATE TRIGGER handle_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
