-- ============================================
-- MIGRATION: Unificar Gastos y Pagos
-- ============================================
-- Ejecutar en Supabase SQL Editor
-- Este script:
-- 1. Modifica la tabla gastos para soportar cuotas
-- 2. Crea la tabla gasto_pagos para los pagos de cuotas
-- 3. Migra datos de payment_plans/payments si existen
-- 4. Elimina las tablas viejas

-- ============================================
-- PASO 1: Agregar columnas a gastos
-- ============================================

-- Agregar columna cuotas_total (1 = pago unico, >1 = cuotas)
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS cuotas_total INTEGER DEFAULT 1;

-- Agregar columna descripcion para notas adicionales
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS descripcion TEXT;

-- Hacer pagador nullable (NULL cuando cuotas_total > 1)
ALTER TABLE gastos ALTER COLUMN pagador DROP NOT NULL;

-- Actualizar constraint de pagador para permitir NULL
ALTER TABLE gastos DROP CONSTRAINT IF EXISTS gastos_pagador_check;
ALTER TABLE gastos ADD CONSTRAINT gastos_pagador_check
  CHECK (pagador IS NULL OR pagador IN ('Juan', 'Vale'));

-- ============================================
-- PASO 2: Crear tabla gasto_pagos
-- ============================================

CREATE TABLE IF NOT EXISTS gasto_pagos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gasto_id UUID NOT NULL REFERENCES gastos(id) ON DELETE CASCADE,
  numero_cuota INTEGER NOT NULL,
  monto DECIMAL(12, 2) NOT NULL,
  pagador TEXT NOT NULL CHECK (pagador IN ('Juan', 'Vale')),
  fecha_pago DATE NOT NULL,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices para gasto_pagos
CREATE INDEX IF NOT EXISTS idx_gasto_pagos_gasto_id ON gasto_pagos(gasto_id);
CREATE INDEX IF NOT EXISTS idx_gasto_pagos_pagador ON gasto_pagos(pagador);
CREATE INDEX IF NOT EXISTS idx_gasto_pagos_fecha ON gasto_pagos(fecha_pago DESC);

-- RLS para gasto_pagos
ALTER TABLE gasto_pagos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users full access gasto_pagos" ON gasto_pagos;
CREATE POLICY "Authenticated users full access gasto_pagos"
ON gasto_pagos FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Realtime para gasto_pagos
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE gasto_pagos;
EXCEPTION
  WHEN duplicate_object THEN
    -- Ya existe, ignorar
    NULL;
END $$;

-- ============================================
-- PASO 3: Migrar datos existentes (si hay)
-- ============================================

-- Migrar payment_plans a gastos
-- MAPEO DE CATEGORIAS:
--   hotel -> estadia
--   vuelos -> vuelos
--   parques -> parques
--   transporte -> transporte
--   seguro -> otros
--   otros -> otros
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payment_plans') THEN
    INSERT INTO gastos (fecha, concepto, categoria, pagador, monto, moneda, monto_usd, cuotas_total, descripcion, created_at, updated_at)
    SELECT
      COALESCE(fecha_inicio, created_at::date),
      nombre,
      CASE categoria
        WHEN 'hotel' THEN 'estadia'
        WHEN 'seguro' THEN 'otros'
        ELSE categoria
      END,
      NULL,  -- pagador null para cuotas
      monto_total,
      COALESCE(moneda, 'USD'),
      monto_total,  -- asumiendo USD
      cuotas_total,
      descripcion,
      created_at,
      updated_at
    FROM payment_plans
    WHERE NOT EXISTS (
      -- Evitar duplicados si ya se migro
      SELECT 1 FROM gastos g WHERE g.concepto = payment_plans.nombre AND g.cuotas_total > 1
    );
  END IF;
END $$;

-- Migrar payments a gasto_pagos
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payments') THEN
    INSERT INTO gasto_pagos (gasto_id, numero_cuota, monto, pagador, fecha_pago, notas, created_at)
    SELECT
      g.id,
      p.numero_cuota,
      p.monto,
      p.pagador,
      p.fecha_pago,
      p.notas,
      p.created_at
    FROM payments p
    JOIN payment_plans pp ON p.plan_id = pp.id
    JOIN gastos g ON g.concepto = pp.nombre AND g.cuotas_total > 1
    WHERE NOT EXISTS (
      -- Evitar duplicados
      SELECT 1 FROM gasto_pagos gp
      WHERE gp.gasto_id = g.id AND gp.numero_cuota = p.numero_cuota
    );
  END IF;
END $$;

-- ============================================
-- PASO 4: Eliminar tablas viejas
-- ============================================

-- Primero eliminar payments (tiene FK a payment_plans)
DROP TABLE IF EXISTS payments;

-- Luego eliminar payment_plans
DROP TABLE IF EXISTS payment_plans;

-- ============================================
-- VERIFICACION
-- ============================================
-- Verifica que todo se creo correctamente:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'gastos';

-- SELECT * FROM gasto_pagos LIMIT 5;
