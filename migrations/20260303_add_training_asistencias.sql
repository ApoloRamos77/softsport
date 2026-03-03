-- Migración: Módulo de Asistencia y Tardanzas por Entrenamiento
-- Fecha: 2026-03-03
-- Descripción: Crea la tabla training_asistencias para registrar la asistencia,
--              tardanza o ausencia de cada alumno en cada sesión de entrenamiento.

-- ============================================================
-- 1. Crear tabla training_asistencias
-- ============================================================
CREATE TABLE IF NOT EXISTS training_asistencias (
    id                   SERIAL PRIMARY KEY,
    training_id          INTEGER NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
    alumno_id            INTEGER NOT NULL REFERENCES alumnos(id)   ON DELETE CASCADE,
    estado               VARCHAR(20) NOT NULL DEFAULT 'Presente',   -- Presente | Tardanza | Ausente
    minutos_tardanza     INTEGER,                                   -- Solo aplica si estado = 'Tardanza'
    observaciones        TEXT,

    -- Auditoría (compatible con AuditableEntity del proyecto)
    fecha_creacion       TIMESTAMP,
    usuario_creacion     VARCHAR(100),
    fecha_modificacion   TIMESTAMP,
    usuario_modificacion VARCHAR(100),
    fecha_anulacion      TIMESTAMP,
    usuario_anulacion    VARCHAR(100),

    -- Garantiza un único registro por alumno/entrenamiento
    CONSTRAINT uq_training_alumno UNIQUE (training_id, alumno_id)
);

-- ============================================================
-- 2. Índices para búsqueda eficiente
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_ta_training_id ON training_asistencias(training_id);
CREATE INDEX IF NOT EXISTS idx_ta_alumno_id   ON training_asistencias(alumno_id);
CREATE INDEX IF NOT EXISTS idx_ta_estado       ON training_asistencias(estado);

-- ============================================================
-- 3. Check constraint para valores válidos de estado
-- ============================================================
ALTER TABLE training_asistencias
    ADD CONSTRAINT chk_ta_estado CHECK (estado IN ('Presente', 'Tardanza', 'Ausente'));

-- ============================================================
-- Verificación
-- ============================================================
-- SELECT table_name, column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'training_asistencias'
-- ORDER BY ordinal_position;
