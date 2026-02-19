-- Migration: Add fecha_inicio column to periodos_pago
-- Date: 2026-02-19

ALTER TABLE periodos_pago
ADD COLUMN IF NOT EXISTS fecha_inicio TIMESTAMP WITHOUT TIME ZONE;

-- Backfill: set fecha_inicio = fecha_vencimiento - 30 days for existing records that have a due date
UPDATE periodos_pago
SET fecha_inicio = fecha_vencimiento - INTERVAL '30 days'
WHERE fecha_inicio IS NULL AND fecha_vencimiento IS NOT NULL;
