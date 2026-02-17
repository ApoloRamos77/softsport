-- 1. Crear tabla Modulos si no existe
CREATE TABLE IF NOT EXISTS "Modulos" (
    "Id" SERIAL PRIMARY KEY,
    "Nombre" TEXT NOT NULL,
    "Key" TEXT NOT NULL UNIQUE, -- Added UNIQUE to allow ON CONFLICT
    "Grupo" TEXT NOT NULL,
    "Orden" INTEGER NOT NULL,
    "Activo" BOOLEAN NOT NULL DEFAULT TRUE
);

-- 2. Insertar módulos (Idempotente: no duplica si ya existe la Key)
INSERT INTO "Modulos" ("Nombre", "Key", "Grupo", "Orden", "Activo") VALUES
-- Principal
('Dashboard', 'dashboard', 'Principal', 1, true),
('Calendario', 'calendario', 'Principal', 2, true),
('Temporadas', 'temporadas', 'Principal', 3, true),

-- Deportivo
('Entrenamientos', 'entrenamientos', 'Deportivo', 4, true),
('Juegos', 'juegos', 'Deportivo', 5, true),
('Tablero Táctico', 'tablero', 'Deportivo', 6, true),

-- Académico
('Alumnos', 'atletas', 'Académico', 7, true),
('Representantes', 'representantes', 'Académico', 8, true),
('Grupos', 'grupos', 'Académico', 9, true),
('Categorías', 'categorias', 'Académico', 10, true),
('Becas', 'becas', 'Académico', 11, true),

-- Salud
('Nutrición Deportiva', 'nutricion', 'Salud', 12, true),

-- Financiero
('Ingresos', 'ingresos', 'Financiero', 13, true),
('Egresos', 'egresos', 'Financiero', 14, true),
('Abonos', 'abonos', 'Financiero', 15, true),
('Métodos de Pago', 'pagos', 'Financiero', 16, true),

-- Servicios
('Productos', 'productos', 'Servicios', 17, true),
('Servicios', 'servicios', 'Servicios', 18, true),

-- Sistema
('Usuarios', 'usuarios', 'Sistema', 19, true),
('Personal', 'personal', 'Sistema', 20, true),
('Página Web', 'landing_mgmt', 'Sistema', 21, true)
ON CONFLICT ("Key") DO UPDATE 
SET 
    "Nombre" = EXCLUDED."Nombre",
    "Grupo" = EXCLUDED."Grupo",
    "Orden" = EXCLUDED."Orden",
    "Activo" = EXCLUDED."Activo";

-- 3. Actualizar tabla RolePermissions para incluir ModuloId
DO $$ 
BEGIN 
    -- Agregar columna ModuloId si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'RolePermissions' AND column_name = 'ModuloId') THEN
        ALTER TABLE "RolePermissions" ADD COLUMN "ModuloId" INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- 4. Limpiar permisos antiguos que no tienen ModuloId válido (Opcional, pero recomendado para evitar errores de FK)
-- TRUNCATE TABLE "RolePermissions"; -- Descomentar si se desea reiniciar todos los permisos

-- 5. Vincular permisos existentes con el nuevo ID de módulo basado en el nombre (si es posible) o eliminarlos
-- En este caso, como cambiamos de lógica hardcoded a BD, lo más seguro es limpiar o asumir que se re-crearán.
-- Para evitar errores de FK en datos basura:
DELETE FROM "RolePermissions" WHERE "ModuloId" = 0;

-- 6. Agregar restricción de clave foránea (FK)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_RolePermissions_Modulos_ModuloId') THEN
        ALTER TABLE "RolePermissions"
        ADD CONSTRAINT "FK_RolePermissions_Modulos_ModuloId" 
        FOREIGN KEY ("ModuloId") 
        REFERENCES "Modulos" ("Id") 
        ON DELETE CASCADE; -- Si se borra el módulo, se borran los permisos
    END IF;
END $$;
