-- Financial Dashboard Tables

-- Monthly Financial Overview Table
CREATE TABLE IF NOT EXISTS monthly_financials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    category TEXT NOT NULL, -- 'revenue', 'cogs', 'gross_profit', 'opex', 'ebitda', 'depreciation', 'ebit', 'interest', 'tax', 'net_profit', 'cash_flow'
    subcategory TEXT, -- More specific categorization
    amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    target_amount DECIMAL(15,2), -- Budget/target amount
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, year, month, category, subcategory)
);

-- HR Budget Table
CREATE TABLE IF NOT EXISTS hr_budget (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    position_name TEXT NOT NULL,
    department TEXT NOT NULL,
    headcount INTEGER NOT NULL DEFAULT 0,
    base_salary DECIMAL(15,2) NOT NULL DEFAULT 0,
    bonus DECIMAL(15,2) DEFAULT 0,
    benefits DECIMAL(15,2) DEFAULT 0,
    total_cost DECIMAL(15,2) GENERATED ALWAYS AS (headcount * (base_salary + bonus + benefits)) STORED,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, year, month, position_name, department)
);

-- Sales Tracking Table
CREATE TABLE IF NOT EXISTS sales_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    product_name TEXT NOT NULL,
    sales_channel TEXT NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    actual_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    units_sold INTEGER DEFAULT 0,
    unit_price DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, year, month, product_name, sales_channel)
);

-- OPEX Matrix Table (genişletilmiş)
CREATE TABLE IF NOT EXISTS opex_matrix (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    category TEXT NOT NULL,
    subcategory TEXT,
    amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    description TEXT,
    attachment_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, year, month, category, subcategory)
);

-- Enable RLS for all tables
ALTER TABLE monthly_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_budget ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE opex_matrix ENABLE ROW LEVEL SECURITY;

-- RLS Policies for monthly_financials
CREATE POLICY "Users can manage their own monthly financials"
ON monthly_financials FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- RLS Policies for hr_budget
CREATE POLICY "Users can manage their own hr budget"
ON hr_budget FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- RLS Policies for sales_tracking
CREATE POLICY "Users can manage their own sales tracking"
ON sales_tracking FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- RLS Policies for opex_matrix
CREATE POLICY "Users can manage their own opex matrix"
ON opex_matrix FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_monthly_financials_user_date ON monthly_financials(user_id, year, month);
CREATE INDEX IF NOT EXISTS idx_hr_budget_user_date ON hr_budget(user_id, year, month);
CREATE INDEX IF NOT EXISTS idx_sales_tracking_user_date ON sales_tracking(user_id, year, month);
CREATE INDEX IF NOT EXISTS idx_opex_matrix_user_date ON opex_matrix(user_id, year, month);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_monthly_financials_updated_at BEFORE UPDATE ON monthly_financials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hr_budget_updated_at BEFORE UPDATE ON hr_budget FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_tracking_updated_at BEFORE UPDATE ON sales_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opex_matrix_updated_at BEFORE UPDATE ON opex_matrix FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();