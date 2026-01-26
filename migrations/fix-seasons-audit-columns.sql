-- Agregar columnas de auditoría a la tabla seasons
-- Estas columnas son requeridas porque Season hereda de AuditableEntity

ALTER TABLE seasons 
ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMP,
ADD COLUMN IF NOT EXISTS usuario_creacion VARCHAR(100),
ADD COLUMN IF NOT EXISTS fecha_modificacion TIMESTAMP,
ADD COLUMN IF NOT EXISTS usuario_modificacion VARCHAR(100),
ADD COLUMN IF NOT EXISTS fecha_anulacion TIMESTAMP,
ADD COLUMN IF NOT EXISTS usuario_anulacion VARCHAR(100);
