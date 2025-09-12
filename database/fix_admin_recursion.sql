
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (
  auth.uid() = id
);
