-- Create n8n workflow execution logs table
CREATE TABLE IF NOT EXISTS public.n8n_workflow_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_name TEXT NOT NULL,
  execution_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed', 'cancelled')),
  user_id UUID,
  trigger_data JSONB,
  result_data JSONB,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.n8n_workflow_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own workflow logs" ON public.n8n_workflow_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own workflow logs" ON public.n8n_workflow_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_n8n_logs_user_id ON public.n8n_workflow_logs(user_id);
CREATE INDEX idx_n8n_logs_workflow_status ON public.n8n_workflow_logs(workflow_name, status);
CREATE INDEX idx_n8n_logs_created_at ON public.n8n_workflow_logs(created_at DESC);

-- Create function to trigger n8n workflows on database changes
CREATE OR REPLACE FUNCTION public.trigger_n8n_on_opportunity_change()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT;
BEGIN
  -- Get the webhook URL from environment or settings
  webhook_url := current_setting('app.n8n_opportunity_webhook', true);
  
  IF webhook_url IS NOT NULL AND NEW.status IS DISTINCT FROM OLD.status THEN
    -- Use pg_net to call the Supabase edge function
    PERFORM net.http_post(
      url := 'https://vwhwufnckpqirxptwncw.supabase.co/functions/v1/trigger-n8n',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_key', true)
      ),
      body := jsonb_build_object(
        'workflow', 'opportunity_status_changed',
        'user_id', COALESCE(NEW.employee_id, auth.uid()),
        'parameters', jsonb_build_object(
          'opportunity_id', NEW.id,
          'old_status', OLD.status,
          'new_status', NEW.status,
          'customer_id', NEW.customer_id,
          'value', NEW.value,
          'title', NEW.title
        )
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to trigger n8n workflows on proposal acceptance
CREATE OR REPLACE FUNCTION public.trigger_n8n_on_proposal_acceptance()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT;
BEGIN
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    PERFORM net.http_post(
      url := 'https://vwhwufnckpqirxptwncw.supabase.co/functions/v1/trigger-n8n',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_key', true)
      ),
      body := jsonb_build_object(
        'workflow', 'proposal_accepted',
        'user_id', auth.uid(),
        'parameters', jsonb_build_object(
          'proposal_id', NEW.id,
          'customer_id', NEW.customer_id,
          'amount', NEW.total_amount,
          'title', NEW.title,
          'opportunity_id', NEW.opportunity_id
        )
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to trigger task due reminders
CREATE OR REPLACE FUNCTION public.trigger_n8n_task_reminders()
RETURNS VOID AS $$
BEGIN
  -- Trigger for tasks due in 24 hours
  PERFORM net.http_post(
    url := 'https://vwhwufnckpqirxptwncw.supabase.co/functions/v1/trigger-n8n',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_key', true)
    ),
    body := jsonb_build_object(
      'workflow', 'task_due_reminder',
      'user_id', t.assignee_id,
      'parameters', jsonb_build_object(
        'task_id', t.id,
        'hours_until_due', 24,
        'title', t.title,
        'assigned_to', t.assigned_to,
        'due_date', t.due_date
      )
    )
  )
  FROM tasks t
  WHERE t.due_date::date = (CURRENT_DATE + INTERVAL '1 day')::date
    AND t.status NOT IN ('completed', 'cancelled');
    
  -- Trigger for tasks due in 1 hour
  PERFORM net.http_post(
    url := 'https://vwhwufnckpqirxptwncw.supabase.co/functions/v1/trigger-n8n',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_key', true)
    ),
    body := jsonb_build_object(
      'workflow', 'task_due_reminder',
      'user_id', t.assignee_id,
      'parameters', jsonb_build_object(
        'task_id', t.id,
        'hours_until_due', 1,
        'title', t.title,
        'assigned_to', t.assigned_to,
        'due_date', t.due_date
      )
    )
  )
  FROM tasks t
  WHERE t.due_date <= (NOW() + INTERVAL '1 hour')
    AND t.due_date > NOW()
    AND t.status NOT IN ('completed', 'cancelled');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS opportunity_status_change_trigger ON opportunities;
CREATE TRIGGER opportunity_status_change_trigger
  AFTER UPDATE ON opportunities
  FOR EACH ROW
  EXECUTE FUNCTION trigger_n8n_on_opportunity_change();

DROP TRIGGER IF EXISTS proposal_acceptance_trigger ON proposals;
CREATE TRIGGER proposal_acceptance_trigger
  AFTER UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION trigger_n8n_on_proposal_acceptance();

-- Create daily financial reporting function
CREATE OR REPLACE FUNCTION public.trigger_daily_financial_report()
RETURNS VOID AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://vwhwufnckpqirxptwncw.supabase.co/functions/v1/trigger-n8n',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_key', true)
    ),
    body := jsonb_build_object(
      'workflow', 'daily_report_generation',
      'user_id', (SELECT id FROM auth.users LIMIT 1), -- Admin user
      'parameters', jsonb_build_object(
        'report_date', CURRENT_DATE,
        'report_type', 'daily_financial'
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;