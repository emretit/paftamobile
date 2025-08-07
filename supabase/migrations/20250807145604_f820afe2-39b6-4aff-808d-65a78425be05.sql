-- Remove all n8n related triggers and functions

-- Drop triggers first
DROP TRIGGER IF EXISTS trigger_proposal_acceptance ON proposals;
DROP TRIGGER IF EXISTS trigger_opportunity_change ON opportunities;

-- Drop the n8n related functions
DROP FUNCTION IF EXISTS public.trigger_n8n_on_proposal_acceptance();
DROP FUNCTION IF EXISTS public.trigger_n8n_on_opportunity_change();
DROP FUNCTION IF EXISTS public.trigger_n8n_task_reminders();
DROP FUNCTION IF EXISTS public.trigger_daily_financial_report();