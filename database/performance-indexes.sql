
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_title_status 
ON marketplace_posts(title, status) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_description_status 
ON marketplace_posts USING gin(to_tsvector('english', description)) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_category_status 
ON marketplace_posts(category, status) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_job_posts_title_status 
ON job_posts(title, status) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_job_posts_search 
ON job_posts USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(company, ''))) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_job_posts_category_status 
ON job_posts(category, status) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_real_estate_title_status 
ON real_estate_posts(title, status) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_real_estate_search 
ON real_estate_posts USING gin(to_tsvector('english', title || ' ' || COALESCE(description, ''))) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_real_estate_location 
ON real_estate_posts(city, state, status) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_business_profiles_search 
ON business_profiles USING gin(to_tsvector('english', business_name || ' ' || COALESCE(description, '')));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_business_profiles_type_status 
ON business_profiles(business_type, status) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_business_profiles_user_id 
ON business_profiles(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_menu_items_business_id 
ON menu_items(business_profile_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_business_reviews_business_id 
ON business_reviews(business_profile_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_created_at 
ON marketplace_posts(created_at DESC) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_job_posts_created_at 
ON job_posts(created_at DESC) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_real_estate_created_at 
ON real_estate_posts(created_at DESC) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_created 
ON users(role, created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_admin_actions_created 
ON admin_actions(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_credit_transactions_user_created 
ON credit_transactions(user_id, created_at DESC);
