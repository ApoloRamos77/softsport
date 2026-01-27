-- ====================================================================
-- Corrección de Estructura de Roles y Permisos - PostgreSQL
-- Fecha: 2026-01-27
-- Descripción: Ajusta la tabla RolePermissions para que coincida con el modelo C#
-- ====================================================================

-- 1. Eliminar la tabla incorrecta si existe y tiene la estructura vieja
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'RolePermissions' AND column_name = 'PermissionKey') THEN
        DROP TABLE IF EXISTS "RolePermissions";
        RAISE NOTICE 'Tabla RolePermissions antigua eliminada para recreación';
    END IF;
END $$;

-- 2. Asegurar que la tabla Roles sea correcta (usando comillas dobles para coincidir con modelBuilder)
CREATE TABLE IF NOT EXISTS "Roles" (
    "Id" SERIAL PRIMARY KEY,
    "Nombre" VARCHAR(200) NOT NULL,
    "Descripcion" VARCHAR(500),
    "Tipo" VARCHAR(50) DEFAULT 'Sistema',
    "Academia" VARCHAR(200),
    "FechaCreacion" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "FechaModificacion" TIMESTAMP
);

-- 3. Crear la tabla RolePermissions con la estructura correcta
CREATE TABLE IF NOT EXISTS "RolePermissions" (
    "Id" SERIAL PRIMARY KEY,
    "RoleId" INTEGER NOT NULL,
    "ModuloId" INTEGER NOT NULL,
    "ModuloNombre" VARCHAR(200) NOT NULL,
    "Ver" BOOLEAN NOT NULL DEFAULT false,
    "Crear" BOOLEAN NOT NULL DEFAULT false,
    "Modificar" BOOLEAN NOT NULL DEFAULT false,
    "Eliminar" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT fk_rolepermissions_role FOREIGN KEY ("RoleId") REFERENCES "Roles"("Id") ON DELETE CASCADE
);

-- 4. Re-insertar datos iniciales si es necesario para el Administrador (ID 1 usualmente)
-- Nota: Esto asume que el ID 1 es el administrador ya creado en init-postgresql.sql
DO $$ 
DECLARE 
    admin_id INTEGER;
BEGIN 
    SELECT "Id" INTO admin_id FROM "Roles" WHERE "Nombre" = 'Administrador' LIMIT 1;
    
    IF admin_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "RolePermissions" WHERE "RoleId" = admin_id) THEN
        INSERT INTO "RolePermissions" ("RoleId", "ModuloId", "ModuloNombre", "Ver", "Crear", "Modificar", "Eliminar")
        VALUES 
            (admin_id, 1, 'Dashboard', true, true, true, true),
            (admin_id, 2, 'Atletas', true, true, true, true),
            (admin_id, 3, 'Grupos', true, true, true, true),
            (admin_id, 4, 'Categorías', true, true, true, true),
            (admin_id, 5, 'Entrenamientos', true, true, true, true),
            (admin_id, 6, 'Juegos', true, true, true, true),
            (admin_id, 7, 'Representantes', true, true, true, true),
            (admin_id, 8, 'Abonos', true, true, true, true),
            (admin_id, 9, 'Becas', true, true, true, true),
            (admin_id, 10, 'Servicios', true, true, true, true),
            (admin_id, 11, 'Productos', true, true, true, true);
        RAISE NOTICE 'Permisos de administrador restaurados';
    END IF;
END $$;

SELECT 'Corrección de estructura de roles completada!' as mensaje;
