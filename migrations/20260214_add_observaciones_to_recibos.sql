-- Migration: Add observaciones column to recibos table
-- Date: 2026-02-14
-- Description: Add a text field for observations/glosa to receipts

-- Add observaciones column (nullable to not affect existing records)
ALTER TABLE recibos 
ADD COLUMN IF NOT EXISTS observaciones TEXT;

-- Add comment for documentation
COMMENT ON COLUMN recibos.observaciones IS 'Observaciones o glosa adicional del recibo';
