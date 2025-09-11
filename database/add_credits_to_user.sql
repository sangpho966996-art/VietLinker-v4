
SELECT auth.users.id, auth.users.email, public.users.credits FROM auth.users 
JOIN public.users ON auth.users.id = public.users.id 
WHERE auth.users.email = 'sangpho966996@gmail.com';

SELECT public.add_credits(
  (SELECT id FROM auth.users WHERE email = 'sangpho966996@gmail.com'),
  1000,
  'manual_admin_credit'
);

SELECT auth.users.id, auth.users.email, public.users.credits FROM auth.users 
JOIN public.users ON auth.users.id = public.users.id 
WHERE auth.users.email = 'sangpho966996@gmail.com';
