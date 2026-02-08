-- PELIGRO: ESTO BORRARÁ LOS DATOS DE LA TABLA training_schedules
DROP TABLE IF EXISTS training_schedules CASCADE;

CREATE TABLE training_schedules (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    categoria_id INT,
    entrenador_id INT,
    dias_semana VARCHAR(100) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    ubicacion VARCHAR(500),
    temporada VARCHAR(100),
    estado VARCHAR(50) DEFAULT 'Activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Mapea a FechaCreacion en AuditableEntity? NO, AuditableEntity usa fecha_creacion
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(100),
    fecha_modificacion TIMESTAMP,
    usuario_modificacion VARCHAR(100),
    fecha_anulacion TIMESTAMP,
    usuario_anulacion VARCHAR(100)
);

-- Asegurar columna en trainings
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trainings' AND column_name='training_schedule_id') THEN
        ALTER TABLE trainings ADD COLUMN training_schedule_id INT;
    END IF;
END $$;
