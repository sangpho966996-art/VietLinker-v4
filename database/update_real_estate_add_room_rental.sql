
ALTER TABLE public.real_estate_posts 
DROP CONSTRAINT real_estate_posts_property_type_check;

ALTER TABLE public.real_estate_posts 
ADD CONSTRAINT real_estate_posts_property_type_check 
CHECK (property_type IN ('house', 'apartment', 'condo', 'townhouse', 'land', 'commercial', 'room-rental'));
