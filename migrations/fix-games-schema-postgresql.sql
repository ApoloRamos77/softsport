-- ====================================================================
-- Corrección de Esquema para Juegos y Convocatorias - PostgreSQL
-- Fecha: 2026-01-28
-- Descripción: Agrega columnas faltantes a 'games' y crea 'game_alumnos'
-- ====================================================================

DO $$ 
BEGIN 
    -- 1. Agregar columnas faltantes a la tabla 'games'
    
    -- categoria_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'games' AND column_name = 'categoria_id') THEN
        ALTER TABLE games ADD COLUMN categoria_id INTEGER;
        RAISE NOTICE 'Agregada columna categoria_id a la tabla games';
    END IF;

    -- es_local
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'games' AND column_name = 'es_local') THEN
        ALTER TABLE games ADD COLUMN es_local BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Agregada columna es_local a la tabla games';
    END IF;

    -- equipo_local
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'games' AND column_name = 'equipo_local') THEN
        ALTER TABLE games ADD COLUMN equipo_local VARCHAR(200);
        RAISE NOTICE 'Agregada columna equipo_local a la tabla games';
    END IF;

    -- equipo_visitante
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'games' AND column_name = 'equipo_visitante') THEN
        ALTER TABLE games ADD COLUMN equipo_visitante VARCHAR(200);
        RAISE NOTICE 'Agregada columna equipo_visitante a la tabla games';
    END IF;

    -- 2. Crear tabla de convocatorias 'game_alumnos' si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'game_alumnos') THEN
        CREATE TABLE game_alumnos (
            id SERIAL PRIMARY KEY,
            game_id INTEGER NOT NULL,
            alumno_id INTEGER NOT NULL,
            CONSTRAINT fk_game_alumnos_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
            CONSTRAINT fk_game_alumnos_alumno FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE
        );
        RAISE NOTICE 'Creada tabla game_alumnos';
    END IF;

    -- 3. Agregar índices para rendimiento
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_game_alumnos_game') THEN
        CREATE INDEX idx_game_alumnos_game ON game_alumnos(game_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_game_alumnos_alumno') THEN
        CREATE INDEX idx_game_alumnos_alumno ON game_alumnos(alumno_id);
    END IF;

END $$;

SELECT 'Corrección de esquema de juegos completada exitosamente!' as mensaje;
