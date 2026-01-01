-- Orlando Trip 2026 - Supabase Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TRIP CONFIG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS trip_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_start_date DATE NOT NULL DEFAULT '2026-05-09',
  trip_end_date DATE NOT NULL DEFAULT '2026-05-25',
  dolar_blue_rate DECIMAL(10, 2) DEFAULT 1200,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default config
INSERT INTO trip_config (trip_start_date, trip_end_date, dolar_blue_rate)
VALUES ('2026-05-09', '2026-05-25', 1200)
ON CONFLICT DO NOTHING;

-- ============================================
-- GASTOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS gastos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fecha DATE NOT NULL,
  concepto TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('vuelos', 'estadia', 'parques', 'comida', 'transporte', 'compras', 'otros')),
  pagador TEXT NOT NULL CHECK (pagador IN ('Juan', 'Vale')),
  monto DECIMAL(12, 2) NOT NULL,
  moneda TEXT NOT NULL CHECK (moneda IN ('ARS', 'USD')),
  monto_usd DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_gastos_fecha ON gastos(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_gastos_pagador ON gastos(pagador);
CREATE INDEX IF NOT EXISTS idx_gastos_categoria ON gastos(categoria);

-- ============================================
-- ITINERARIO TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS itinerario (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fecha DATE NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  hora TIME,
  ubicacion_url TEXT,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_itinerario_fecha ON itinerario(fecha ASC);

-- ============================================
-- DOCUMENTOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS documentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('reservas', 'tickets', 'vuelos', 'seguro', 'otros')),
  archivo_url TEXT NOT NULL,
  archivo_nombre TEXT,
  uploaded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_documentos_categoria ON documentos(categoria);

-- ============================================
-- LUGARES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS lugares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('restaurante', 'tienda', 'atraccion', 'tip')),
  maps_url TEXT,
  notas TEXT,
  visitado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_lugares_tipo ON lugares(tipo);
CREATE INDEX IF NOT EXISTS idx_lugares_visitado ON lugares(visitado);

-- ============================================
-- NOTAS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  contenido TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('general', 'llevar', 'comprar')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_notas_tipo ON notas(tipo);

-- ============================================
-- STORAGE BUCKET
-- ============================================
-- Create the documentos bucket (run this separately if needed)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos', 'documentos', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY - SOLO USUARIOS AUTENTICADOS
-- ============================================

-- Enable RLS on all tables
ALTER TABLE trip_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerario ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lugares ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow all on trip_config" ON trip_config;
DROP POLICY IF EXISTS "Allow all on gastos" ON gastos;
DROP POLICY IF EXISTS "Allow all on itinerario" ON itinerario;
DROP POLICY IF EXISTS "Allow all on documentos" ON documentos;
DROP POLICY IF EXISTS "Allow all on lugares" ON lugares;
DROP POLICY IF EXISTS "Allow all on notas" ON notas;

-- Drop new policies if they exist (for re-running)
DROP POLICY IF EXISTS "Authenticated users can read trip_config" ON trip_config;
DROP POLICY IF EXISTS "Authenticated users can update trip_config" ON trip_config;
DROP POLICY IF EXISTS "Authenticated users full access gastos" ON gastos;
DROP POLICY IF EXISTS "Authenticated users full access itinerario" ON itinerario;
DROP POLICY IF EXISTS "Authenticated users full access documentos" ON documentos;
DROP POLICY IF EXISTS "Authenticated users full access lugares" ON lugares;
DROP POLICY IF EXISTS "Authenticated users full access notas" ON notas;

-- ============================================
-- POLICIES: Solo usuarios autenticados pueden acceder
-- ============================================

-- TRIP CONFIG: Solo lectura y update para autenticados
CREATE POLICY "Authenticated users can read trip_config"
ON trip_config FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update trip_config"
ON trip_config FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- GASTOS: CRUD completo para autenticados
CREATE POLICY "Authenticated users full access gastos"
ON gastos FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- ITINERARIO: CRUD completo para autenticados
CREATE POLICY "Authenticated users full access itinerario"
ON itinerario FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- DOCUMENTOS: CRUD completo para autenticados
CREATE POLICY "Authenticated users full access documentos"
ON documentos FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- LUGARES: CRUD completo para autenticados
CREATE POLICY "Authenticated users full access lugares"
ON lugares FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- NOTAS: CRUD completo para autenticados
CREATE POLICY "Authenticated users full access notas"
ON notas FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- STORAGE POLICIES
-- ============================================
-- Drop existing storage policies
DROP POLICY IF EXISTS "Allow all on documentos bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- Solo usuarios autenticados pueden subir archivos
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documentos' AND
  auth.uid() IS NOT NULL
);

-- Solo usuarios autenticados pueden ver archivos
CREATE POLICY "Authenticated users can read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documentos' AND
  auth.uid() IS NOT NULL
);

-- Solo usuarios autenticados pueden eliminar archivos
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documentos' AND
  auth.uid() IS NOT NULL
);

-- ============================================
-- REALTIME
-- ============================================
-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE trip_config;
ALTER PUBLICATION supabase_realtime ADD TABLE gastos;
ALTER PUBLICATION supabase_realtime ADD TABLE itinerario;
ALTER PUBLICATION supabase_realtime ADD TABLE documentos;
ALTER PUBLICATION supabase_realtime ADD TABLE lugares;
ALTER PUBLICATION supabase_realtime ADD TABLE notas;

-- ============================================
-- PAYMENT PLANS TABLE (Planes de Pago)
-- ============================================
CREATE TABLE IF NOT EXISTS payment_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT NOT NULL CHECK (categoria IN ('hotel', 'vuelos', 'parques', 'transporte', 'seguro', 'otros')),
  monto_total DECIMAL(12, 2) NOT NULL,
  cuotas_total INTEGER NOT NULL DEFAULT 1,
  fecha_inicio DATE,
  moneda TEXT DEFAULT 'USD' CHECK (moneda IN ('USD', 'ARS')),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for payment_plans
CREATE INDEX IF NOT EXISTS idx_payment_plans_categoria ON payment_plans(categoria);

-- ============================================
-- PAYMENTS TABLE (Pagos/Cuotas)
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES payment_plans(id) ON DELETE CASCADE,
  numero_cuota INTEGER NOT NULL,
  monto DECIMAL(12, 2) NOT NULL,
  pagador TEXT NOT NULL CHECK (pagador IN ('Juan', 'Vale')),
  fecha_pago DATE NOT NULL,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for payments
CREATE INDEX IF NOT EXISTS idx_payments_plan_id ON payments(plan_id);
CREATE INDEX IF NOT EXISTS idx_payments_pagador ON payments(pagador);
CREATE INDEX IF NOT EXISTS idx_payments_fecha ON payments(fecha_pago DESC);

-- RLS for payment_plans
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users full access payment_plans" ON payment_plans;
CREATE POLICY "Authenticated users full access payment_plans"
ON payment_plans FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS for payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users full access payments" ON payments;
CREATE POLICY "Authenticated users full access payments"
ON payments FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Enable realtime for payment tables
ALTER PUBLICATION supabase_realtime ADD TABLE payment_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;

-- ============================================
-- NOTA: Crear usuarios
-- ============================================
-- Para crear usuarios para Juan y Vale:
-- 1. Ve a Authentication > Users en Supabase Dashboard
-- 2. Click "Add user" > "Create new user"
-- 3. Ingresa email y contrasena para cada uno
--
-- O pueden registrarse desde la app usando el formulario de registro
