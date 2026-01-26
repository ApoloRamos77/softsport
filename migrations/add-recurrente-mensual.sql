-- Agregar columna recurrente_mensual a tabla servicios
ALTER TABLE servicios 
ADD COLUMN IF NOT EXISTS recurrente_mensual BOOLEAN NOT NULL DEFAULT false;
