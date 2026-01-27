-- ====================================================================
-- Sincronización de Columnas de Auditoría - PostgreSQL
-- Fecha: 2026-01-27
-- Descripción: Agrega columnas para rastrear creación, modificación y anulación
-- en todas las tablas que heredan de AuditableEntity.
-- ====================================================================

DO $$ 
DECLARE 
    t_name TEXT;
    tables TEXT[] := ARRAY[
        'becas', 'alumnos', 'categorias', 'expenses', 'games', 
        'grupos', 'productos', 'payment_methods', 'representantes', 
        'servicios', 'seasons', 'trainings'
    ];
BEGIN 
    FOREACH t_name IN ARRAY tables LOOP
        -- fecha_creacion
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t_name AND column_name = 'fecha_creacion') THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN fecha_creacion TIMESTAMP', t_name);
            RAISE NOTICE 'Agregada columna fecha_creacion a la tabla %', t_name;
        END IF;

        -- usuario_creacion
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t_name AND column_name = 'usuario_creacion') THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN usuario_creacion VARCHAR(100)', t_name);
            RAISE NOTICE 'Agregada columna usuario_creacion a la tabla %', t_name;
        END IF;

        -- fecha_modificacion
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t_name AND column_name = 'fecha_modificacion') THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN fecha_modificacion TIMESTAMP', t_name);
            RAISE NOTICE 'Agregada columna fecha_modificacion a la tabla %', t_name;
        END IF;

        -- usuario_modificacion
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t_name AND column_name = 'usuario_modificacion') THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN usuario_modificacion VARCHAR(100)', t_name);
            RAISE NOTICE 'Agregada columna usuario_modificacion a la tabla %', t_name;
        END IF;

        -- fecha_anulacion
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t_name AND column_name = 'fecha_anulacion') THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN fecha_anulacion TIMESTAMP', t_name);
            RAISE NOTICE 'Agregada columna fecha_anulacion a la tabla %', t_name;
        END IF;

        -- usuario_anulacion
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t_name AND column_name = 'usuario_anulacion') THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN usuario_anulacion VARCHAR(100)', t_name);
            RAISE NOTICE 'Agregada columna usuario_anulacion a la tabla %', t_name;
        END IF;

        -- Inicializar valores por defecto para filas existentes
        EXECUTE format('UPDATE %I SET fecha_creacion = CURRENT_TIMESTAMP, usuario_creacion = ''System'' WHERE fecha_creacion IS NULL', t_name);
    END LOOP;
END $$;

-- También asegurar que recibos tenga al menos fecha_creacion y fecha_modificacion
-- aunque no herede de AuditableEntity (visto en init-postgresql.sql)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recibos' AND column_name = 'fecha_creacion') THEN
        ALTER TABLE recibos ADD COLUMN fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recibos' AND column_name = 'fecha_modificacion') THEN
        ALTER TABLE recibos ADD COLUMN fecha_modificacion TIMESTAMP;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recibos' AND column_name = 'usuario_creacion') THEN
        ALTER TABLE recibos ADD COLUMN usuario_creacion VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recibos' AND column_name = 'fecha_anulacion') THEN
        ALTER TABLE recibos ADD COLUMN fecha_anulacion TIMESTAMP;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recibos' AND column_name = 'usuario_anulacion') THEN
        ALTER TABLE recibos ADD COLUMN usuario_anulacion VARCHAR(100);
    END IF;
END $$;

SELECT 'Sincronización de auditoría PostgreSQL completada exitosamente!' as mensaje;
