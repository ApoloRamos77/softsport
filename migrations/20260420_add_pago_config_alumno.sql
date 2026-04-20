-- ============================================================
-- Migración: Configuración de pagos por alumno
-- Fecha: 2026-04-20
-- Descripción: Agrega campos para personalizar la fecha de inicio
--              de pago y el monto de mensualidad especial por alumno.
-- ============================================================

-- Fecha a partir de la cual el alumno debe pagar.
-- El día de esta fecha define el día de vencimiento mensual.
ALTER TABLE alumnos
    ADD COLUMN IF NOT EXISTS fecha_inicio_pago TIMESTAMP WITHOUT TIME ZONE NULL;

-- Monto de la mensualidad personalizada del alumno.
ALTER TABLE alumnos
    ADD COLUMN IF NOT EXISTS monto_mensualidad NUMERIC(18, 2) NULL;

-- Bandera: true = usar MontoMensualidad en lugar del cálculo estándar.
ALTER TABLE alumnos
    ADD COLUMN IF NOT EXISTS tiene_mensualidad_especial BOOLEAN NOT NULL DEFAULT FALSE;

-- Verificación
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'alumnos'
  AND column_name IN ('fecha_inicio_pago', 'monto_mensualidad', 'tiene_mensualidad_especial')
ORDER BY column_name;
