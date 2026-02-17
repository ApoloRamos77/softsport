DO $$ 
DECLARE 
    admin_id INTEGER;
BEGIN 
    -- 1. Obtener ID del rol Administrador (asegurando case-insensitive o exacto)
    SELECT "Id" INTO admin_id FROM "Roles" WHERE "Nombre" = 'Administrador' LIMIT 1;
    
    IF admin_id IS NOT NULL THEN
        -- 2. Insertar permisos faltantes para el administrador
        INSERT INTO "RolePermissions" ("RoleId", "ModuloId", "Ver", "Crear", "Modificar", "Eliminar", "ModuloNombre")
        SELECT 
            admin_id, 
            m."Id", 
            TRUE, TRUE, TRUE, TRUE, 
            m."Nombre"
        FROM "Modulos" m
        WHERE NOT EXISTS (
            SELECT 1 FROM "RolePermissions" rp 
            WHERE rp."RoleId" = admin_id AND rp."ModuloId" = m."Id"
        );
        
        RAISE NOTICE 'Permisos de administrador actualizados correctamente.';
    ELSE
        RAISE NOTICE 'No se encontró el rol Administrador.';
    END IF;
END $$;
