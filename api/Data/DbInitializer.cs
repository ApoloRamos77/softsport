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
            ";

            try 
            {
                context.Database.ExecuteSqlRaw(sql);
            }
            catch (Exception ex)
            {
                // Log error but don't crash if columns already exist in a slightly different way
                Console.WriteLine($"Error ejecutando script de inicialización: {ex.Message}");
            }
        }
    }
}
