-- Create loans table
CREATE TABLE public.loans (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    loan_name TEXT NOT NULL,
    bank TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    interest_rate NUMERIC NOT NULL,
    installment_amount NUMERIC NOT NULL,
    remaining_debt NUMERIC NOT NULL DEFAULT 0,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'odenecek' CHECK (status IN ('odenecek', 'odendi')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create checks table  
CREATE TABLE public.checks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    check_number TEXT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    amount NUMERIC NOT NULL,
    bank TEXT NOT NULL,
    payee TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'odenecek' CHECK (status IN ('odenecek', 'odendi', 'karsilik_yok')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for loans
CREATE POLICY "Users can manage their own loans" 
ON public.loans 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create RLS policies for checks
CREATE POLICY "Users can manage their own checks" 
ON public.checks 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create triggers for updated_at
CREATE TRIGGER update_loans_updated_at
    BEFORE UPDATE ON public.loans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_checks_updated_at
    BEFORE UPDATE ON public.checks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();