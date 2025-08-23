-- Helper to read current project from request header
CREATE OR REPLACE FUNCTION public.current_project_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT nullif(current_setting('request.headers.x-project-id', true), '')::uuid;
$$;

-- Utility macro via psql is not available; write explicit statements

-- activities
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.activities;
CREATE POLICY "Project-scoped read" ON public.activities
FOR SELECT TO authenticated
USING (project_id = public.current_project_id());

-- audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.audit_logs;
CREATE POLICY "Project-scoped read" ON public.audit_logs
FOR SELECT TO authenticated
USING (project_id = public.current_project_id());

-- bank_accounts
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.bank_accounts;
CREATE POLICY "Project-scoped read" ON public.bank_accounts
FOR SELECT TO authenticated
USING (project_id = public.current_project_id());

-- card_transactions
ALTER TABLE public.card_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.card_transactions;
CREATE POLICY "Project-scoped read" ON public.card_transactions
FOR SELECT TO authenticated
USING (project_id = public.current_project_id());

-- cash_flow_forecasts
ALTER TABLE public.cash_flow_forecasts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.cash_flow_forecasts;
CREATE POLICY "Project-scoped read" ON public.cash_flow_forecasts
FOR SELECT TO authenticated
USING (project_id = public.current_project_id());

-- cashflow_categories
ALTER TABLE public.cashflow_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.cashflow_categories;
CREATE POLICY "Project-scoped read" ON public.cashflow_categories
FOR SELECT TO authenticated
USING (project_id = public.current_project_id());

-- cashflow_main
ALTER TABLE public.cashflow_main ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.cashflow_main;
CREATE POLICY "Project-scoped read" ON public.cashflow_main
FOR SELECT TO authenticated
USING (project_id = public.current_project_id());

-- cashflow_transactions
ALTER TABLE public.cashflow_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.cashflow_transactions;
CREATE POLICY "Project-scoped read" ON public.cashflow_transactions
FOR SELECT TO authenticated
USING (project_id = public.current_project_id());

-- checks
ALTER TABLE public.checks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.checks;
CREATE POLICY "Project-scoped read" ON public.checks
FOR SELECT TO authenticated
USING (project_id = public.current_project_id());

-- company_settings
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.company_settings;
CREATE POLICY "Project-scoped read" ON public.company_settings
FOR SELECT TO authenticated
USING (project_id = public.current_project_id());

-- credit_cards
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.credit_cards;
CREATE POLICY "Project-scoped read" ON public.credit_cards
FOR SELECT TO authenticated
USING (project_id = public.current_project_id());

-- customer_aliases
ALTER TABLE public.customer_aliases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.customer_aliases;
CREATE POLICY "Project-scoped read" ON public.customer_aliases
FOR SELECT TO authenticated
USING (project_id = public.current_project_id());

-- customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.customers;
CREATE POLICY "Project-scoped read" ON public.customers
FOR SELECT TO authenticated
USING (project_id = public.current_project_id());

-- departments
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.departments;
CREATE POLICY "Project-scoped read" ON public.departments
FOR SELECT TO authenticated
USING (project_id = public.current_project_id());

-- e_fatura_stok_eslestirme
ALTER TABLE public.e_fatura_stok_eslestirme ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.e_fatura_stok_eslestirme;
CREATE POLICY "Project-scoped read" ON public.e_fatura_stok_eslestirme
FOR SELECT TO authenticated
USING (project_id = public.current_project_id());

-- einvoice_items
ALTER TABLE public.einvoice_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.einvoice_items;
CREATE POLICY "Project-scoped read" ON public.einvoice_items
FOR SELECT TO authenticated
USING (project_id = public.current_project_id());

-- einvoice_logs
ALTER TABLE public.einvoice_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.einvoice_logs;
CREATE POLICY "Project-scoped read" ON public.einvoice_logs
FOR SELECT TO authenticated
USING (project_id = public.current_project_id());

-- einvoices
ALTER TABLE public.einvoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.einvoices;
CREATE POLICY "Project-scoped read" ON public.einvoices
FOR SELECT TO authenticated
USING (project_id = public.current_project_id());

-- einvoices_received
ALTER TABLE public.einvoices_received ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.einvoices_received;
CREATE POLICY "Project-scoped read" ON public.einvoices_received
FOR SELECT TO authenticated
USING (project_id = public.current_project_id());

-- einvoices_sent
ALTER TABLE public.einvoices_sent ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.einvoices_sent;
CREATE POLICY "Project-scoped read" ON public.einvoices_sent
FOR SELECT TO authenticated
USING (project_id = public.current_project_id());

-- email_confirmations
ALTER TABLE public.email_confirmations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.email_confirmations;
CREATE POLICY "Project-scoped read" ON public.email_confirmations
FOR SELECT TO authenticated
USING (project_id = public.current_project_id());

-- employee_auth
ALTER TABLE public.employee_auth ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.employee_auth;
CREATE POLICY "Project-scoped read" ON public.employee_auth
FOR SELECT TO authenticated
USING (project_id = public.current_project_id());

-- employee_documents
ALTER TABLE public.employee_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.employee_documents;
CREATE POLICY "Project-scoped read" ON public.employee_documents
FOR SELECT TO authenticated
USING (project_id = public.current_project_id());

-- employee_leaves
ALTER TABLE public.employee_leaves ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.employee_leaves;
CREATE POLICY "Project-scoped read" ON public.employee_leaves
FOR SELECT TO authenticated
USING (project_id = public.current_project_id());

-- employee_performance
ALTER TABLE public.employee_performance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.employee_performance;
CREATE POLICY "Project-scoped read" ON public.employee_performance
FOR SELECT TO authenticated
USING (project_id = public.current_project_id());

-- employee_salaries
ALTER TABLE public.employee_salaries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.employee_salaries;
CREATE POLICY "Project-scoped read" ON public.employee_salaries
FOR SELECT TO authenticated
USING (project_id = public.current_project_id());

-- employees
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.employees;
CREATE POLICY "Project-scoped read" ON public.employees
FOR SELECT TO authenticated
USING (project_id = public.current_project_id());

-- equipment
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.equipment;
CREATE POLICY "Project-scoped read" ON public.equipment
FOR SELECT TO authenticated
USING (project_id = public.current_project_id());

-- events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.events;
CREATE POLICY "Project-scoped read" ON public.events
FOR SELECT TO authenticated
USING (project_id = public.current_project_id());

-- exchange_rate_updates
ALTER TABLE public.exchange_rate_updates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.exchange_rate_updates;
CREATE POLICY "Project-scoped read" ON public.exchange_rate_updates
FOR SELECT TO authenticated
USING (project_id = public.current_project_id());

-- exchange_rates
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.exchange_rates;
CREATE POLICY "Project-scoped read" ON public.exchange_rates
FOR SELECT TO authenticated
USING (project_id = public.current_project_id());

-- financial_instruments
ALTER TABLE public.financial_instruments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.financial_instruments;
CREATE POLICY "Project-scoped read" ON public.financial_instruments
FOR SELECT TO authenticated
USING (project_id = public.current_project_id());