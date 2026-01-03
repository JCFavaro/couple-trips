-- ============================================
-- Migration: Add Multi-Trip Support
-- ============================================

-- 1. Create trips table
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  destino TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '✈️',
  theme TEXT NOT NULL DEFAULT 'default',
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  dolar_blue_rate DECIMAL(10,2) DEFAULT 1000,
  -- Theme colors
  color_primary TEXT DEFAULT '#ec4899',
  color_secondary TEXT DEFAULT '#8b5cf6',
  color_bg TEXT DEFAULT '#1a0a2e',
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Insert Orlando trip (the existing one)
INSERT INTO trips (id, nombre, destino, emoji, theme, fecha_inicio, fecha_fin, dolar_blue_rate, color_primary, color_secondary, color_bg)
VALUES (
  'orlando-2026',
  'Orlando 2026',
  'Orlando, Florida',
  '🏰',
  'orlando',
  '2026-05-09',
  '2026-05-25',
  1530,
  '#ec4899',
  '#8b5cf6',
  '#1a0a2e'
);

-- 3. Insert Chile trip (placeholder)
INSERT INTO trips (id, nombre, destino, emoji, theme, fecha_inicio, fecha_fin, color_primary, color_secondary, color_bg)
VALUES (
  'chile-2027',
  'Chile 2027',
  'Santiago & Patagonia',
  '🏔️',
  'chile',
  '2027-01-15',
  '2027-01-30',
  '#dc2626',
  '#1d4ed8',
  '#0f172a'
);

-- 4. Add trip_id to gastos
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS trip_id TEXT DEFAULT 'orlando-2026';

-- 5. Add trip_id to gasto_pagos (through gasto relationship, but useful for queries)
ALTER TABLE gasto_pagos ADD COLUMN IF NOT EXISTS trip_id TEXT DEFAULT 'orlando-2026';

-- 6. Add trip_id to itinerario
ALTER TABLE itinerario ADD COLUMN IF NOT EXISTS trip_id TEXT DEFAULT 'orlando-2026';

-- 7. Add trip_id to documentos
ALTER TABLE documentos ADD COLUMN IF NOT EXISTS trip_id TEXT DEFAULT 'orlando-2026';

-- 8. Add trip_id to lugares
ALTER TABLE lugares ADD COLUMN IF NOT EXISTS trip_id TEXT DEFAULT 'orlando-2026';

-- 9. Add trip_id to notas
ALTER TABLE notas ADD COLUMN IF NOT EXISTS trip_id TEXT DEFAULT 'orlando-2026';

-- 10. Drop trip_config table (now integrated into trips)
-- First backup any custom dolar rate
-- DROP TABLE IF EXISTS trip_config;
-- OR keep it and just not use it

-- 11. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_gastos_trip_id ON gastos(trip_id);
CREATE INDEX IF NOT EXISTS idx_gasto_pagos_trip_id ON gasto_pagos(trip_id);
CREATE INDEX IF NOT EXISTS idx_itinerario_trip_id ON itinerario(trip_id);
CREATE INDEX IF NOT EXISTS idx_documentos_trip_id ON documentos(trip_id);
CREATE INDEX IF NOT EXISTS idx_lugares_trip_id ON lugares(trip_id);
CREATE INDEX IF NOT EXISTS idx_notas_trip_id ON notas(trip_id);

-- 12. Enable RLS on trips table
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read trips
CREATE POLICY "Allow read trips" ON trips FOR SELECT TO authenticated USING (true);

-- Policy: Allow all authenticated users to update trips (for dolar rate, etc)
CREATE POLICY "Allow update trips" ON trips FOR UPDATE TO authenticated USING (true);
