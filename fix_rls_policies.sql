
DROP POLICY IF EXISTS "Anyone can view approved business profiles" ON public.business_profiles;

CREATE POLICY "Anyone can view active business profiles" ON public.business_profiles
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Anyone can view menu items for approved businesses" ON public.menu_items;

CREATE POLICY "Anyone can view menu items for active businesses" ON public.menu_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM business_profiles 
      WHERE business_profiles.id = menu_items.business_profile_id 
      AND business_profiles.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Anyone can view gallery for approved businesses" ON public.business_gallery;

CREATE POLICY "Anyone can view gallery for active businesses" ON public.business_gallery
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM business_profiles 
      WHERE business_profiles.id = business_gallery.business_profile_id 
      AND business_profiles.status = 'active'
    )
  );
