-- ==============================================================================
-- Organic Food Traceability Platform - Database Schema
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users Table (Stores user profiles linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT DEFAULT 'consumer' CHECK (role IN ('farmer', 'manufacturer', 'logistics', 'retailer', 'consumer', 'admin')),
  business_name TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to automatically create a public.users record when an auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, business_name, location)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'consumer'),
    COALESCE(NEW.raw_user_meta_data->>'business_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'location', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    business_name = EXCLUDED.business_name,
    location = EXCLUDED.location;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Farms Table
CREATE TABLE IF NOT EXISTS public.farms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  size TEXT,
  certifications JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  category TEXT,
  batch_number TEXT UNIQUE,
  harvest_date DATE,
  expiry_date DATE,
  quantity NUMERIC DEFAULT 0,
  price NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'harvested',
  image_url TEXT,
  qr_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Shipments Table
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  destination TEXT,
  status TEXT DEFAULT 'pending',
  tracking_number TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Logistics Tables
CREATE TABLE IF NOT EXISTS public.logistics_vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_number TEXT NOT NULL UNIQUE,
  driver_name TEXT,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.logistics_shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_id TEXT NOT NULL,
  vehicle_id UUID REFERENCES public.logistics_vehicles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'in_transit',
  origin TEXT,
  destination TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.logistics_qr_scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qr_data TEXT NOT NULL,
  scanned_by TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.logistics_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID,
  latitude NUMERIC,
  longitude NUMERIC,
  status TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Retailer & Verification Tables
CREATE TABLE IF NOT EXISTS public.retailer_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  retailer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  stock NUMERIC DEFAULT 0,
  price NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'in_stock',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  verified_by TEXT,
  status TEXT DEFAULT 'verified',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.temperature_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE,
  temperature NUMERIC NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Enable Row Level Security (RLS) and create least-privilege policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_qr_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retailer_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temperature_logs ENABLE ROW LEVEL SECURITY;

-- Users can only access their own profile unless they have an admin role claim.
DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id OR auth.jwt()->>'role' = 'admin');

DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id OR auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.uid() = id OR auth.jwt()->>'role' = 'admin');

DROP POLICY IF EXISTS "users_insert_own" ON public.users;
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id OR auth.jwt()->>'role' = 'admin');

DROP POLICY IF EXISTS "farms_owner_access" ON public.farms;
CREATE POLICY "farms_owner_access" ON public.farms
  FOR ALL USING (user_id = auth.uid() OR auth.jwt()->>'role' = 'admin')
  WITH CHECK (user_id = auth.uid() OR auth.jwt()->>'role' = 'admin');

DROP POLICY IF EXISTS "products_owner_access" ON public.products;
CREATE POLICY "products_owner_access" ON public.products
  FOR ALL USING (user_id = auth.uid() OR auth.jwt()->>'role' = 'admin')
  WITH CHECK (user_id = auth.uid() OR auth.jwt()->>'role' = 'admin');

DROP POLICY IF EXISTS "shipments_owner_access" ON public.shipments;
CREATE POLICY "shipments_owner_access" ON public.shipments
  FOR ALL USING (user_id = auth.uid() OR auth.jwt()->>'role' = 'admin')
  WITH CHECK (user_id = auth.uid() OR auth.jwt()->>'role' = 'admin');

DROP POLICY IF EXISTS "logistics_vehicle_access" ON public.logistics_vehicles;
CREATE POLICY "logistics_vehicle_access" ON public.logistics_vehicles
  FOR ALL USING (user_id = auth.uid() OR auth.jwt()->>'role' = 'admin')
  WITH CHECK (user_id = auth.uid() OR auth.jwt()->>'role' = 'admin');

DROP POLICY IF EXISTS "logistics_shipments_owner_access" ON public.logistics_shipments;
CREATE POLICY "logistics_shipments_owner_access" ON public.logistics_shipments
  FOR ALL USING (user_id = auth.uid() OR auth.jwt()->>'role' = 'admin')
  WITH CHECK (user_id = auth.uid() OR auth.jwt()->>'role' = 'admin');

DROP POLICY IF EXISTS "logistics_qr_scans_access" ON public.logistics_qr_scans;
CREATE POLICY "logistics_qr_scans_access" ON public.logistics_qr_scans
  FOR ALL USING (auth.uid() IS NOT NULL OR auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.uid() IS NOT NULL OR auth.jwt()->>'role' = 'admin');

DROP POLICY IF EXISTS "logistics_tracking_access" ON public.logistics_tracking;
CREATE POLICY "logistics_tracking_access" ON public.logistics_tracking
  FOR ALL USING (auth.uid() IS NOT NULL OR auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.uid() IS NOT NULL OR auth.jwt()->>'role' = 'admin');

DROP POLICY IF EXISTS "retailer_products_owner_access" ON public.retailer_products;
CREATE POLICY "retailer_products_owner_access" ON public.retailer_products
  FOR ALL USING (retailer_id = auth.uid() OR auth.jwt()->>'role' = 'admin')
  WITH CHECK (retailer_id = auth.uid() OR auth.jwt()->>'role' = 'admin');

DROP POLICY IF EXISTS "product_verifications_access" ON public.product_verifications;
CREATE POLICY "product_verifications_access" ON public.product_verifications
  FOR ALL USING (auth.uid() IS NOT NULL OR auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.uid() IS NOT NULL OR auth.jwt()->>'role' = 'admin');

DROP POLICY IF EXISTS "temperature_logs_access" ON public.temperature_logs;
CREATE POLICY "temperature_logs_access" ON public.temperature_logs
  FOR ALL USING (shipment_id IN (
      SELECT id FROM public.shipments WHERE user_id = auth.uid()
    ) OR auth.jwt()->>'role' = 'admin')
  WITH CHECK (shipment_id IN (
      SELECT id FROM public.shipments WHERE user_id = auth.uid()
    ) OR auth.jwt()->>'role' = 'admin');

-- 9. Storage Bucket setup for Product Images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "product_images_public_read" ON storage.objects;
CREATE POLICY "product_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "product_images_authenticated_write" ON storage.objects;
CREATE POLICY "product_images_authenticated_write" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "product_images_authenticated_update" ON storage.objects;
CREATE POLICY "product_images_authenticated_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated')
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "product_images_authenticated_delete" ON storage.objects;
CREATE POLICY "product_images_authenticated_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- ==============================================================================
-- 10. Schema Migrations (Columns used by the Frontend Dashboards)
-- Run this block in Supabase SQL Editor if you ever see "Could not find column ... in schema cache"
-- ==============================================================================
ALTER TABLE public.farms 
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Organic Farm',
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS product_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS qr_generated BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS current_location TEXT DEFAULT 'Farm Storage',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.shipments 
  ADD COLUMN IF NOT EXISTS origin TEXT,
  ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS estimated_delivery TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS carrier TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE public.logistics_shipments 
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS shipment_id TEXT,
  ADD COLUMN IF NOT EXISTS tracking_number TEXT,
  ADD COLUMN IF NOT EXISTS product_type TEXT,
  ADD COLUMN IF NOT EXISTS quantity TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.logistics_vehicles 
  ALTER COLUMN vehicle_number DROP NOT NULL;

ALTER TABLE public.logistics_vehicles 
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS license_plate TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_type TEXT,
  ADD COLUMN IF NOT EXISTS capacity TEXT,
  ADD COLUMN IF NOT EXISTS current_location TEXT DEFAULT 'Hub',
  ADD COLUMN IF NOT EXISTS fuel_level NUMERIC DEFAULT 100,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.logistics_tracking
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS location_name TEXT,
  ADD COLUMN IF NOT EXISTS temperature NUMERIC,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.retailer_products 
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS stock_quantity INT DEFAULT 50,
  ADD COLUMN IF NOT EXISTS min_stock_level INT DEFAULT 10,
  ADD COLUMN IF NOT EXISTS is_recalled BOOLEAN DEFAULT FALSE;

ALTER TABLE public.product_verifications 
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS verification_type TEXT DEFAULT 'qr_scan',
  ADD COLUMN IF NOT EXISTS verification_result TEXT DEFAULT 'authentic',
  ADD COLUMN IF NOT EXISTS scanned_data JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS location JSONB DEFAULT '{}'::jsonb;

