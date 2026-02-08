using Microsoft.EntityFrameworkCore;

namespace SoftSportAPI.Data
{
    public static class DbInitializer
    {
        public static void Initialize(SoftSportDbContext context)
        {
            context.Database.EnsureCreated();

            // SQL para crear tablas de Landing Page si no existen (PostgreSQL syntax compatible)
            var sql = @"
                -- 1. Create table for Landing Page Gallery
                CREATE TABLE IF NOT EXISTS landing_galleries (
                    id SERIAL PRIMARY KEY,
                    tipo VARCHAR(50) NOT NULL,
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

                -- 3. Add image_url to productos table logic
                DO $$ 
                BEGIN 
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='imagen_url') THEN
                        ALTER TABLE productos ADD COLUMN imagen_url TEXT;
                    END IF;
                END $$;

                -- 4. Training Refactor
                CREATE TABLE IF NOT EXISTS training_schedules (
                    id SERIAL PRIMARY KEY,
                    nombre VARCHAR(200) NOT NULL,
                    descripcion TEXT,
                    categoria_id INT, -- Foreign key handled loosely or via EF constraints
                    entrenador_id INT,
                    dias_semana VARCHAR(100) NOT NULL,
                    hora_inicio TIME NOT NULL,
                    hora_fin TIME NOT NULL,
                    ubicacion VARCHAR(500),
                    temporada VARCHAR(100),
                    estado VARCHAR(50) DEFAULT 'Activo',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_by VARCHAR(100),
                    updated_by VARCHAR(100),
                    fecha_anulacion TIMESTAMP,
                    usuario_anulacion VARCHAR(100)
                );

                -- Add foreign key column to trainings
                DO $$ 
                BEGIN 
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trainings' AND column_name='training_schedule_id') THEN
                        ALTER TABLE trainings ADD COLUMN training_schedule_id INT;
                    END IF;
                END $$;
            ";

            try 
            {
                // Execute previous SQL (Landing pages, etc)
                context.Database.ExecuteSqlRaw(sql);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error ejecutando script de inicialización (Legacy): {ex.Message}");
            }

            // Training Refactor - Step 1: Create table if not exists (with CORRECT legacy-compatible names if needed, but we prefer new names)
            // We use the NEW names in CREATE TABLE.
            var createTableSql = @"
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
            ";

            // Step 2: Fix Schema Mismatches (Rename columns from old migrations)
            var fixSchemaSql = @"
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
                END $$;
            ";

            // Step 3: Add missing columns
             var addColumnsSql = @"
                DO $$ 
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='training_schedules' AND column_name='fecha_creacion') THEN
                        ALTER TABLE training_schedules ADD COLUMN fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
                    END IF;

                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='training_schedules' AND column_name='fecha_modificacion') THEN
                         ALTER TABLE training_schedules ADD COLUMN fecha_modificacion TIMESTAMP;
                    END IF;

                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='training_schedules' AND column_name='usuario_creacion') THEN
                        ALTER TABLE training_schedules ADD COLUMN usuario_creacion VARCHAR(100);
                    END IF;

                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='training_schedules' AND column_name='usuario_modificacion') THEN
                        ALTER TABLE training_schedules ADD COLUMN usuario_modificacion VARCHAR(100);
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
            ";

            // Step 4: Add FK
            var fkSql = @"
                DO $$ 
                BEGIN 
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trainings' AND column_name='training_schedule_id') THEN
                        ALTER TABLE trainings ADD COLUMN training_schedule_id INT;
                    END IF;
                END $$;
            ";

            try
            {
                Console.WriteLine("Initializing Training Refactor tables (Step 1: Create)...");
                context.Database.ExecuteSqlRaw(createTableSql);

                Console.WriteLine("Initializing Training Refactor tables (Step 2: Rename)...");
                context.Database.ExecuteSqlRaw(fixSchemaSql);

                Console.WriteLine("Initializing Training Refactor tables (Step 3: Add Columns)...");
                context.Database.ExecuteSqlRaw(addColumnsSql);

                Console.WriteLine("Initializing Training Refactor tables (Step 4: FK)...");
                context.Database.ExecuteSqlRaw(fkSql);

                Console.WriteLine("Training Refactor tables fully initialized.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error ejecutando script de inicialización (Training Refactor): {ex.Message}");
            }
        }
    }
}
