-- Migración: Agregar fecha de inscripción a alumnos y soporte para múltiples categorías en entrenamientos
-- Fecha: 2026-02-17
-- Descripción: Agrega campo fecha_inscripcion para tracking de pagos mensuales y tabla para relación many-to-many entre entrenamientos y categorías

-- 1. Agregar campo fecha_inscripcion a la tabla alumnos
ALTER TABLE alumnos ADD COLUMN IF NOT EXISTS fecha_inscripcion DATE;

-- Establecer fecha_inscripcion como fecha_registro para alumnos existentes
UPDATE alumnos 
SET fecha_inscripcion = fecha_registro::date 
WHERE fecha_inscripcion IS NULL;

-- 2. Crear tabla para relación many-to-many entre entrenamientos y categorías
CREATE TABLE IF NOT EXISTS training_categorias (
    id SERIAL PRIMARY KEY,
    training_id INTEGER NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
    categoria_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(training_id, categoria_id)
);

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_training_categorias_training 
ON training_categorias(training_id);

CREATE INDEX IF NOT EXISTS idx_training_categorias_categoria 
ON training_categorias(categoria_id);

-- Migrar datos existentes de categoria_id a la nueva tabla many-to-many
INSERT INTO training_categorias (training_id, categoria_id)
SELECT id, categoria_id 
FROM trainings 
WHERE categoria_id IS NOT NULL
ON CONFLICT (training_id, categoria_id) DO NOTHING;

-- Comentarios para documentación
COMMENT ON COLUMN alumnos.fecha_inscripcion IS 'Fecha de inscripción del alumno para cálculo de cuotas mensuales';
COMMENT ON TABLE training_categorias IS 'Relación many-to-many entre entrenamientos y categorías para permitir múltiples categorías en un mismo entrenamiento';
