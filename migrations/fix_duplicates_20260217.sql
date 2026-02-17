-- Script para corregir duplicados en la tabla Modulos

-- 1. Eliminar referencias en RolePermissions que apuntan a los duplicados (módulos que se van a borrar)
--    Mantenemos solo las referencias al módulo con el ID más bajo (el original)
DELETE FROM "RolePermissions"
WHERE "ModuloId" IN (
    SELECT m1."Id"
    FROM "Modulos" m1
    WHERE m1."Id" > (
        SELECT MIN(m2."Id")
        FROM "Modulos" m2
        WHERE m1."Key" = m2."Key"
    )
);

-- 2. Eliminar los módulos duplicados, manteniendo el que tiene el ID más bajo
DELETE FROM "Modulos" m1
WHERE "Id" > (
    SELECT MIN(m2."Id")
    FROM "Modulos" m2
    WHERE m1."Key" = m2."Key"
);

-- 3. Agregar la restricción UNIQUE para evitar futuros duplicados
--    Usamos un bloque DO para evitar error si ya existe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'UQ_Modulos_Key') THEN
        ALTER TABLE "Modulos" ADD CONSTRAINT "UQ_Modulos_Key" UNIQUE ("Key");
    END IF;
END $$;
