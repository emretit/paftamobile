-- Remove all n8n related triggers and functions with CASCADE

-- Drop triggers first
DROP TRIGGER IF EXISTS trigger_proposal_acceptance ON proposals CASCADE;
DROP TRIGGER IF EXISTS proposal_acceptance_trigger ON proposals CASCADE;
DROP TRIGGER IF EXISTS trigger_opportunity_change ON opportunities CASCADE;

-- Drop the n8n related functions with CASCADE
DROP FUNCTION IF EXISTS public.trigger_n8n_on_proposal_acceptance() CASCADE;
DROP FUNCTION IF EXISTS public.trigger_n8n_on_opportunity_change() CASCADE;
DROP FUNCTION IF EXISTS public.trigger_n8n_task_reminders() CASCADE;
DROP FUNCTION IF EXISTS public.trigger_daily_financial_report() CASCADE;