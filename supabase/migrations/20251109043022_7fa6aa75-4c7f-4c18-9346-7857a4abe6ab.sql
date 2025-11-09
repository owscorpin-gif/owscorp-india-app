-- 1. Create user_roles table for secure role management
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 3. RLS policies for user_roles table
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- 4. Create purchases table for tracking service purchases
CREATE TABLE IF NOT EXISTS public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_id uuid REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  purchased_at timestamptz DEFAULT now(),
  UNIQUE(customer_id, service_id)
);

-- Enable RLS on purchases
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- RLS policies for purchases
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.purchases;
CREATE POLICY "Users can view their own purchases"
ON public.purchases FOR SELECT
USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Users can create their own purchases" ON public.purchases;
CREATE POLICY "Users can create their own purchases"
ON public.purchases FOR INSERT
WITH CHECK (auth.uid() = customer_id);

-- 5. Fix profiles table RLS - restrict to authenticated users only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT
USING (auth.role() = 'authenticated');

-- 6. Storage RLS for service-files bucket (protect paid content)
DROP POLICY IF EXISTS "Developers can upload their own service files" ON storage.objects;
CREATE POLICY "Developers can upload their own service files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'service-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Only file owners and buyers can download service files" ON storage.objects;
CREATE POLICY "Only file owners and buyers can download service files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'service-files' AND
  (
    -- Developer can access their own files
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    -- Customers who purchased can access
    EXISTS (
      SELECT 1 FROM public.services s
      JOIN public.purchases p ON p.service_id = s.id
      WHERE s.app_file_url LIKE '%' || name
      AND p.customer_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "Developers can update their own service files" ON storage.objects;
CREATE POLICY "Developers can update their own service files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'service-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Developers can delete their own service files" ON storage.objects;
CREATE POLICY "Developers can delete their own service files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'service-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 7. Update handle_new_user function to create user_roles entry
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role app_role;
BEGIN
  -- Get role from metadata, default to customer
  user_role := COALESCE((NEW.raw_user_meta_data->>'user_type')::app_role, 'customer');
  
  -- Insert into profiles (without user_type column)
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', '')
  );
  
  -- Insert into user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  RETURN NEW;
END;
$function$;

-- 8. Remove user_type column from profiles table (roles now in user_roles)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS user_type;