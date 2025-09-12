
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND column_name = 'admin_status'
    AND table_name IN ('marketplace_posts', 'job_posts', 'real_estate_posts', 'business_profiles')
ORDER BY table_name;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'role';

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('admin_actions', 'content_reports');

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
WHERE tablename = 'business_profiles';

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'business_profiles'
ORDER BY ordinal_position;

SELECT 
    id,
    user_id,
    business_name,
    business_type,
    status,
    created_at
FROM public.business_profiles 
LIMIT 5;

SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name = 'deduct_credits_for_post';

SELECT 
    id,
    email,
    credits,
    role
FROM public.users 
WHERE email = 'sangpho966996@gmail.com';

SELECT 
    user_id,
    amount,
    type,
    description,
    created_at
FROM public.credit_transactions 
ORDER BY created_at DESC 
LIMIT 10;

SELECT COUNT(*) as total_business_profiles FROM public.business_profiles;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'business_profiles'
ORDER BY ordinal_position;

SELECT 
    conname,
    contype,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.business_profiles'::regclass;
