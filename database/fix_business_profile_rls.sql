
CREATE POLICY "Users can view their own business profiles" ON public.business_profiles
  FOR SELECT USING (auth.uid() = user_id);

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'business_profiles'
ORDER BY policyname;
