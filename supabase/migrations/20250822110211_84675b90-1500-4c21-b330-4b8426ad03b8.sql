-- Configure auth hook to use our custom email function
UPDATE auth.config 
SET value = 'https://vwhwufnckpqirxptwncw.supabase.co/functions/v1/auth-emails'
WHERE parameter = 'hook_send_email_url';

-- If the setting doesn't exist, insert it
INSERT INTO auth.config (parameter, value) 
VALUES ('hook_send_email_url', 'https://vwhwufnckpqirxptwncw.supabase.co/functions/v1/auth-emails')
ON CONFLICT (parameter) DO UPDATE SET value = EXCLUDED.value;