-- ============================================
-- HYBRID AUTH MODEL MIGRATION
-- Supabase Auth + Custom Tables
-- ============================================

-- 1. Önce mevcut user_roles tablosu varsa sil
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- 2. Role enum'unu oluştur
CREATE TYPE public.user_role AS ENUM ('super_admin', 'admin', 'manager', 'user');

-- 3. Profiles tablosu oluştur (auth.users'a bağlı)
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  full_name text,
  email text,
  avatar_url text,
  phone text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  
  PRIMARY KEY (id)
);

-- 4. User roles tablosu oluştur
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  
  UNIQUE (user_id, role)
);

-- 5. RLS'i etkinleştir
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 6. Security definer fonksiyonları oluştur
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
  ORDER BY 
    CASE role
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2  
      WHEN 'manager' THEN 3
      WHEN 'user' THEN 4
    END
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_role(required_role user_role)
RETURNS boolean
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = required_role
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS uuid
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT company_id
  FROM public.profiles
  WHERE id = auth.uid();
$$;

-- 7. Profiles için RLS policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role('admin') OR public.has_role('super_admin'));

-- 8. User roles için RLS policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role('admin') OR public.has_role('super_admin'));

-- 9. Trigger: Yeni user kaydolduğunda profile oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Profile oluştur
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email
  );
  
  -- Default role ata
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger'ı bağla
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Updated_at trigger'ı
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();