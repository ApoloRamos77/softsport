-- Migration: 20260207_training_refactor
-- Description: Adds training_schedules table and updates trainings table

-- 1. Create training_schedules table
CREATE TABLE IF NOT EXISTS training_schedules (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    categoria_id INT REFERENCES categorias(id),
    entrenador_id INT REFERENCES users(id),
    
    -- Configuration for generation
    dias_semana VARCHAR(100) NOT NULL, -- Format: "1,3,5" (1=Monday, 7=Sunday)
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    ubicacion VARCHAR(500),
    temporada VARCHAR(100), -- Optional: to group by season
    
    -- Status
    estado VARCHAR(50) DEFAULT 'Activo', -- 'Activo', 'Inactivo'
    
    -- Auditable fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- 2. Add foreign key to trainings table to link to schedule
ALTER TABLE trainings 
ADD COLUMN IF NOT EXISTS training_schedule_id INT REFERENCES training_schedules(id);

-- 3. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_training_schedules_categoria ON training_schedules(categoria_id);
CREATE INDEX IF NOT EXISTS idx_trainings_schedule_id ON trainings(training_schedule_id);

-- 4. Initial seed (Optional, empty for now)
