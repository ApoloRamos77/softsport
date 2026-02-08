-- Script de corrección para tabla training_schedules
-- Ejecutar en PostgreSQL

-- 1. Crear la tabla si no existe (con nombres correctos)
CREATE TABLE IF NOT EXISTS training_schedules (
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
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP,
    usuario_creacion VARCHAR(100),
    usuario_modificacion VARCHAR(100),
    fecha_anulacion TIMESTAMP,
    usuario_anulacion VARCHAR(100)
);

-- 2. Corregir columnas (Rename / Add)
DO $$ 
BEGIN 
    -- Fix Mismatch: created_at -> fecha_creacion
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='training_schedules' AND column_name='created_at') THEN
        ALTER TABLE training_schedules RENAME COLUMN created_at TO fecha_creacion;
    END IF;

    -- Fix Mismatch: updated_at -> fecha_modificacion
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='training_schedules' AND column_name='updated_at') THEN
        ALTER TABLE training_schedules RENAME COLUMN updated_at TO fecha_modificacion;
    END IF;

    -- Fix Mismatch: created_by -> usuario_creacion
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='training_schedules' AND column_name='created_by') THEN
        ALTER TABLE training_schedules RENAME COLUMN created_by TO usuario_creacion;
    END IF;

    -- Fix Mismatch: updated_by -> usuario_modificacion
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='training_schedules' AND column_name='updated_by') THEN
        ALTER TABLE training_schedules RENAME COLUMN updated_by TO usuario_modificacion;
    END IF;

    -- Add columns if they are completely missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='training_schedules' AND column_name='fecha_creacion') THEN
        ALTER TABLE training_schedules ADD COLUMN fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='training_schedules' AND column_name='fecha_anulacion') THEN
        ALTER TABLE training_schedules ADD COLUMN fecha_anulacion TIMESTAMP;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='training_schedules' AND column_name='usuario_anulacion') THEN
        ALTER TABLE training_schedules ADD COLUMN usuario_anulacion VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='training_schedules' AND column_name='descripcion') THEN
        ALTER TABLE training_schedules ADD COLUMN descripcion TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='training_schedules' AND column_name='ubicacion') THEN
        ALTER TABLE training_schedules ADD COLUMN ubicacion VARCHAR(500);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='training_schedules' AND column_name='temporada') THEN
        ALTER TABLE training_schedules ADD COLUMN temporada VARCHAR(100);
    END IF;
END $$;

-- 3. Asegurar columna en tabla trainings
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trainings' AND column_name='training_schedule_id') THEN
        ALTER TABLE trainings ADD COLUMN training_schedule_id INT;
    END IF;
END $$;
