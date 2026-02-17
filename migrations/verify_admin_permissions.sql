SELECT COUNT(*) as "AdminPermissionCount" 
FROM "RolePermissions" rp 
JOIN "Roles" r ON rp."RoleId" = r."Id" 
WHERE r."Nombre" = 'Administrador';
