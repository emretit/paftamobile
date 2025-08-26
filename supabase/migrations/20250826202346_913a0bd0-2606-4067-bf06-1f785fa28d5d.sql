-- Önce current_user_id fonksiyonunu oluşturalım
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  user_id_from_jwt uuid;
BEGIN
  -- Authorization header'dan JWT'deki sub claim'ini al
  SELECT (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid INTO user_id_from_jwt;
  
  -- Eğer JWT'den alamazsak auth.uid() kullan
  IF user_id_from_jwt IS NULL THEN
    RETURN auth.uid();
  END IF;
  
  RETURN user_id_from_jwt;
EXCEPTION
  WHEN OTHERS THEN
    RETURN auth.uid();
END;
$function$;

-- current_company_id fonksiyonunu düzeltelim
CREATE OR REPLACE FUNCTION public.current_company_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  user_company_id UUID;
BEGIN
  -- current_user_id() kullanarak company_id'yi bul
  SELECT company_id INTO user_company_id
  FROM public.users 
  WHERE id = public.current_user_id();
  
  RETURN user_company_id;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$function$;

-- Activities tablosunda RLS'i aktif hale getirelim
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Activities için daha güçlü RLS policy'si
DROP POLICY IF EXISTS "Company-based activities access" ON public.activities;
CREATE POLICY "Company-based activities access" ON public.activities
FOR ALL USING (company_id = current_company_id());

-- Opportunities için RLS aktif hale getirelim
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Opportunities için company-based policy
DROP POLICY IF EXISTS "Company-based opportunities access" ON public.opportunities;
CREATE POLICY "Company-based opportunities access" ON public.opportunities
FOR ALL USING (company_id = current_company_id());

-- Customers için RLS aktif hale getirelim
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Employees için RLS aktif hale getirelim  
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Products için RLS aktif hale getirelim
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products için company-based policy
DROP POLICY IF EXISTS "Company-based products access" ON public.products;
CREATE POLICY "Company-based products access" ON public.products
FOR ALL USING (company_id = current_company_id());

-- Proposals için RLS aktif hale getirelim
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Proposals için company-based policy  
DROP POLICY IF EXISTS "Company-based proposals access" ON public.proposals;
CREATE POLICY "Company-based proposals access" ON public.proposals
FOR ALL USING (company_id = current_company_id());

-- set_project_id_on_insert trigger'ını düzeltelim
CREATE OR REPLACE FUNCTION public.set_project_id_on_insert()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.company_id IS NULL THEN
    -- current_company_id() kullanarak kullanıcının company_id'sini al
    NEW.company_id = current_company_id();
  END IF;
  RETURN NEW;
END;
$function$;