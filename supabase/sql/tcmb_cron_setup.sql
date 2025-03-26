
-- Create the function to set up the cron job
CREATE OR REPLACE FUNCTION public.setup_tcmb_cron()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Schedule the function to run at 15:45 every day
  PERFORM cron.schedule(
    'tcmb-daily-exchange-rate-update',  -- job name
    '45 15 * * *',                     -- cron schedule (15:45 daily)
    $$
    SELECT net.http_post(
      url:='https://vwhwufnckpqirxptwncw.supabase.co/functions/v1/fetch-tcmb-rates',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3aHd1Zm5ja3BxaXJ4cHR3bmN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzODI5MjAsImV4cCI6MjA1NDk1ODkyMH0.Wjw8MAnsBrHxB6-J-bNGObgDQ4fl3zPYrgYI5tOrcKo"}'::jsonb,
      body:='{"source": "cron"}'::jsonb
    ) AS request_id;
    $$
  );
END;
$$;
