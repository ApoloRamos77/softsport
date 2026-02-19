-- Migration: Add periodos_pago table
-- Date: 2026-02-18
-- Description: Creates the periodos_pago table to track monthly payment periods per student

CREATE TABLE IF NOT EXISTS periodos_pago (
    id SERIAL PRIMARY KEY,
    alumno_id INTEGER NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
    anio INTEGER NOT NULL,
    mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
    fecha_vencimiento DATE,
    monto DECIMAL(12, 2) NOT NULL DEFAULT 0,
    estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente', -- Pendiente, Pagado, Vencido, Exonerado
    recibo_id INTEGER REFERENCES recibos(id) ON DELETE SET NULL,
    observaciones TEXT,
    fecha_creacion TIMESTAMP,
    usuario_creacion VARCHAR(100),
    fecha_modificacion TIMESTAMP,
    usuario_modificacion VARCHAR(100),
    UNIQUE(alumno_id, anio, mes)
);

-- Index for fast lookups by student
CREATE INDEX IF NOT EXISTS idx_periodos_pago_alumno ON periodos_pago(alumno_id);

-- Index for status queries (overdue alerts)
CREATE INDEX IF NOT EXISTS idx_periodos_pago_estado ON periodos_pago(estado);

-- Index for date range queries
CREATE INDEX IF NOT EXISTS idx_periodos_pago_anio_mes ON periodos_pago(anio, mes);
