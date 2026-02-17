DO $$ 
DECLARE 
    admin_id INTEGER;
BEGIN 
    -- 1. Obtener ID del rol Administrador
    SELECT "Id" INTO admin_id FROM "Roles" WHERE "Nombre" = 'Administrador' LIMIT 1;
    
    IF admin_id IS NOT NULL THEN
        -- 2. ELIMINAR TODOS los permisos existentes para el administrador (Limpieza profunda)
        -- Esto asegura que no queden permisos "zombies" con ModuloId incorrecto o nulo
        DELETE FROM "RolePermissions" WHERE "RoleId" = admin_id;

        -- 3. Insertar permisos LIMPIOS para TODOS los módulos activos
        INSERT INTO "RolePermissions" ("RoleId", "ModuloId", "Ver", "Crear", "Modificar", "Eliminar", "ModuloNombre")
        SELECT 
            admin_id, 
            m."Id", 
            TRUE, TRUE, TRUE, TRUE, 
            m."Nombre"
        FROM "Modulos" m
        WHERE m."Activo" = TRUE;
        
        RAISE NOTICE 'Permisos de administrador reiniciados y corregidos correctamente.';
    ELSE
        RAISE NOTICE 'No se encontró el rol Administrador.';
    END IF;
END $$;
