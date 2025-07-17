-- Add RLS policies for nilvera_auth table
-- Enable RLS
ALTER TABLE public.nilvera_auth ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own Nilvera auth records
CREATE POLICY "Users can manage their own nilvera auth" 
ON public.nilvera_auth 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);