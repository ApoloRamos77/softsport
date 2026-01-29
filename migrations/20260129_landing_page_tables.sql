-- Migration to add Landing Page support

-- 1. Create table for Landing Page Gallery
CREATE TABLE IF NOT EXISTS landing_galleries (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL, -- 'Entrenamiento', 'Torneo'
    image_url TEXT NOT NULL,
    titulo VARCHAR(200),
    descripcion TEXT,
    fecha TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(100) DEFAULT 'System',
    fecha_modificacion TIMESTAMP,
    usuario_modificacion VARCHAR(100),
    fecha_anulacion TIMESTAMP,
    usuario_anulacion VARCHAR(100)
);

-- 2. Create table for Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    nombres VARCHAR(200) NOT NULL,
    apellidos VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    celular VARCHAR(50) NOT NULL,
    mensaje TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(100) DEFAULT 'System',
    fecha_modificacion TIMESTAMP,
    usuario_modificacion VARCHAR(100),
    fecha_anulacion TIMESTAMP,
    usuario_anulacion VARCHAR(100)
);

-- 3. Add image_url to productos table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='imagen_url') THEN
        ALTER TABLE productos ADD COLUMN imagen_url TEXT;
    END IF;
END $$;
