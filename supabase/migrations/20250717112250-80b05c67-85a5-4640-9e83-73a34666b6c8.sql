-- Add unique constraint to nilvera_auth table for user_id
ALTER TABLE public.nilvera_auth 
ADD CONSTRAINT nilvera_auth_user_id_unique UNIQUE (user_id);