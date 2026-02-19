-- Migration: Add periodos module to Modulos table
-- Date: 2026-02-18
-- Description: Registers the 'periodos' module in the permissions system

INSERT INTO "Modulos" ("Nombre", "Key", "Grupo", "Orden", "Activo") VALUES
('Períodos de Pago', 'periodos', 'Financiero', 15, true)
ON CONFLICT ("Key") DO UPDATE 
SET 
    "Nombre" = EXCLUDED."Nombre",
    "Grupo" = EXCLUDED."Grupo",
    "Orden" = EXCLUDED."Orden",
    "Activo" = EXCLUDED."Activo";

-- Update order of existing Financiero modules to make room
UPDATE "Modulos" SET "Orden" = 16 WHERE "Key" = 'pagos';
UPDATE "Modulos" SET "Orden" = 17 WHERE "Key" = 'productos';
UPDATE "Modulos" SET "Orden" = 18 WHERE "Key" = 'servicios';
UPDATE "Modulos" SET "Orden" = 19 WHERE "Key" = 'usuarios';
UPDATE "Modulos" SET "Orden" = 20 WHERE "Key" = 'personal';
UPDATE "Modulos" SET "Orden" = 21 WHERE "Key" = 'landing_mgmt';

-- Also run the periodos_pago table creation if not already done
CREATE TABLE IF NOT EXISTS periodos_pago (
    id SERIAL PRIMARY KEY,
    alumno_id INTEGER NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
    anio INTEGER NOT NULL,
    mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
    fecha_vencimiento DATE,
    monto DECIMAL(12, 2) NOT NULL DEFAULT 0,
    estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
    recibo_id INTEGER REFERENCES recibos(id) ON DELETE SET NULL,
    observaciones TEXT,
    fecha_creacion TIMESTAMP,
    usuario_creacion VARCHAR(100),
    fecha_modificacion TIMESTAMP,
    usuario_modificacion VARCHAR(100),
    UNIQUE(alumno_id, anio, mes)
);

CREATE INDEX IF NOT EXISTS idx_periodos_pago_alumno ON periodos_pago(alumno_id);
CREATE INDEX IF NOT EXISTS idx_periodos_pago_estado ON periodos_pago(estado);
CREATE INDEX IF NOT EXISTS idx_periodos_pago_anio_mes ON periodos_pago(anio, mes);
