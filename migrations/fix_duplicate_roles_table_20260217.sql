-- Script para eliminar las tablas duplicadas 'roles' y 'role_permissions'
-- Se asume que las tablas correctas son 'Roles' y 'RolePermissions' (PascalCase).

-- 1. Eliminar la tabla dependiente 'role_permissions' (minúsculas) primero
DROP TABLE IF EXISTS "role_permissions";

-- 2. Eliminar la tabla principal duplicada 'roles' (minúsculas)
DROP TABLE IF EXISTS "roles";

-- 3. Confirmación (Opcional, solo para verificar)
-- SELECT * FROM "Roles"; -- Debería funcionar y mostrar los roles correctos
-- SELECT * FROM "RolePermissions"; -- Debería funcionar y mostrar los permisos correctos
