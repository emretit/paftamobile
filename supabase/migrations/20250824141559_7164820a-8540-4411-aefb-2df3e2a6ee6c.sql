-- Önce user tablosuna project_id ekleyelim
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'project_id') THEN
        ALTER TABLE public.profiles ADD COLUMN project_id uuid;
    END IF;
END $$;

-- Ana tablolara INSERT, UPDATE, DELETE politikaları ekleyelim
-- customers tablosu için
CREATE POLICY "Enable insert for project members" ON public.customers
FOR INSERT WITH CHECK (project_id = current_project_id());

CREATE POLICY "Enable update for project members" ON public.customers
FOR UPDATE USING (project_id = current_project_id());

CREATE POLICY "Enable delete for project members" ON public.customers
FOR DELETE USING (project_id = current_project_id());

-- employees tablosu için
CREATE POLICY "Enable insert for project members" ON public.employees
FOR INSERT WITH CHECK (project_id = current_project_id());

CREATE POLICY "Enable update for project members" ON public.employees
FOR UPDATE USING (project_id = current_project_id());

CREATE POLICY "Enable delete for project members" ON public.employees
FOR DELETE USING (project_id = current_project_id());

-- departments tablosu için
CREATE POLICY "Enable insert for project members" ON public.departments
FOR INSERT WITH CHECK (project_id = current_project_id());

CREATE POLICY "Enable update for project members" ON public.departments
FOR UPDATE USING (project_id = current_project_id());

CREATE POLICY "Enable delete for project members" ON public.departments
FOR DELETE USING (project_id = current_project_id());

-- activities tablosu için
CREATE POLICY "Enable insert for project members" ON public.activities
FOR INSERT WITH CHECK (project_id = current_project_id());

CREATE POLICY "Enable update for project members" ON public.activities
FOR UPDATE USING (project_id = current_project_id());

CREATE POLICY "Enable delete for project members" ON public.activities
FOR DELETE USING (project_id = current_project_id());

-- products tablosu için
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'project_id') THEN
        ALTER TABLE public.products ADD COLUMN project_id uuid;
        -- Mevcut ürünler için varsayılan project_id
        UPDATE public.products SET project_id = '00000000-0000-0000-0000-000000000001' WHERE project_id IS NULL;
        ALTER TABLE public.products ALTER COLUMN project_id SET NOT NULL;
    END IF;
END $$;

CREATE POLICY "Project-scoped products read" ON public.products
FOR SELECT USING (project_id = current_project_id());

CREATE POLICY "Enable insert for project members" ON public.products
FOR INSERT WITH CHECK (project_id = current_project_id());

CREATE POLICY "Enable update for project members" ON public.products
FOR UPDATE USING (project_id = current_project_id());

CREATE POLICY "Enable delete for project members" ON public.products
FOR DELETE USING (project_id = current_project_id());

-- suppliers tablosu için
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'project_id') THEN
        ALTER TABLE public.suppliers ADD COLUMN project_id uuid;
        -- Mevcut tedarikçiler için varsayılan project_id
        UPDATE public.suppliers SET project_id = '00000000-0000-0000-0000-000000000001' WHERE project_id IS NULL;
        ALTER TABLE public.suppliers ALTER COLUMN project_id SET NOT NULL;
    END IF;
END $$;

CREATE POLICY "Project-scoped suppliers read" ON public.suppliers
FOR SELECT USING (project_id = current_project_id());

CREATE POLICY "Enable insert for project members" ON public.suppliers
FOR INSERT WITH CHECK (project_id = current_project_id());

CREATE POLICY "Enable update for project members" ON public.suppliers
FOR UPDATE USING (project_id = current_project_id());

CREATE POLICY "Enable delete for project members" ON public.suppliers
FOR DELETE USING (project_id = current_project_id());

-- proposals tablosu için
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposals' AND column_name = 'project_id') THEN
        ALTER TABLE public.proposals ADD COLUMN project_id uuid;
        -- Mevcut teklifler için varsayılan project_id
        UPDATE public.proposals SET project_id = '00000000-0000-0000-0000-000000000001' WHERE project_id IS NULL;
        ALTER TABLE public.proposals ALTER COLUMN project_id SET NOT NULL;
    END IF;
END $$;

CREATE POLICY "Project-scoped proposals read" ON public.proposals
FOR SELECT USING (project_id = current_project_id());

CREATE POLICY "Enable insert for project members" ON public.proposals
FOR INSERT WITH CHECK (project_id = current_project_id());

CREATE POLICY "Enable update for project members" ON public.proposals
FOR UPDATE USING (project_id = current_project_id());

CREATE POLICY "Enable delete for project members" ON public.proposals
FOR DELETE USING (project_id = current_project_id());

-- opportunities tablosu için
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'project_id') THEN
        ALTER TABLE public.opportunities ADD COLUMN project_id uuid;
        -- Mevcut fırsatlar için varsayılan project_id
        UPDATE public.opportunities SET project_id = '00000000-0000-0000-0000-000000000001' WHERE project_id IS NULL;
        ALTER TABLE public.opportunities ALTER COLUMN project_id SET NOT NULL;
    END IF;
END $$;

CREATE POLICY "Project-scoped opportunities read" ON public.opportunities
FOR SELECT USING (project_id = current_project_id());

CREATE POLICY "Enable insert for project members" ON public.opportunities
FOR INSERT WITH CHECK (project_id = current_project_id());

CREATE POLICY "Enable update for project members" ON public.opportunities
FOR UPDATE USING (project_id = current_project_id());

CREATE POLICY "Enable delete for project members" ON public.opportunities
FOR DELETE USING (project_id = current_project_id());