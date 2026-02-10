-- Create Personal table
CREATE TABLE IF NOT EXISTS public.personal (
    id SERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    dni VARCHAR(20),
    celular VARCHAR(20),
    fecha_nacimiento TIMESTAMP,
    cargo VARCHAR(50), -- Administrativo, Nutricionista, Terapeuta, Paramedico, Entrenador
    
    -- Audit fields (matching AuditableEntity)
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(100),
    fecha_modificacion TIMESTAMP,
    usuario_modificacion VARCHAR(100),
    fecha_anulacion TIMESTAMP,
    usuario_anulacion VARCHAR(100),
    estado VARCHAR(20) DEFAULT 'Activo'
);

-- Add index on cargo for faster filtering
CREATE INDEX IF NOT EXISTS idx_personal_cargo ON public.personal(cargo);

-- Update Trainings table to include Entrenador Foreign Key if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainings' AND column_name = 'entrenador_id') THEN
        ALTER TABLE public.trainings ADD COLUMN entrenador_id INTEGER;
        ALTER TABLE public.trainings ADD CONSTRAINT fk_trainings_personal FOREIGN KEY (entrenador_id) REFERENCES public.personal(id);
    END IF;
END $$;

-- Update Users table to link to Personal
DO $$
BEGIN
    -- Add personal_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'personal_id') THEN
        ALTER TABLE public.users ADD COLUMN personal_id INTEGER;
        ALTER TABLE public.users ADD CONSTRAINT fk_users_personal FOREIGN KEY (personal_id) REFERENCES public.personal(id);
    END IF;
END $$;

-- Auto-generate Personal records for existing Users and link them
DO $$
DECLARE
    user_rec RECORD;
    new_personal_id INTEGER;
BEGIN
    FOR user_rec IN SELECT * FROM public.users WHERE personal_id IS NULL LOOP
        -- Insert into Personal based on User data
        INSERT INTO public.personal (nombres, apellidos, cargo, usuario_creacion, estado)
        VALUES (
            COALESCE(user_rec.nombre, 'Usuario'), 
            COALESCE(user_rec.apellido, 'Sistema'), 
            'Administrativo', -- Default cargo
            'MIGRATION',
            'Activo'
        )
        RETURNING id INTO new_personal_id;

        -- Update User with the new Personal ID
        UPDATE public.users SET personal_id = new_personal_id WHERE id = user_rec.id;
    END LOOP;
END $$;
