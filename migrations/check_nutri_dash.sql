SELECT r."Nombre" as Role, m."Key" as Module, rp."Ver"
FROM "RolePermissions" rp
JOIN "Roles" r ON rp."RoleId" = r."Id"
JOIN "Modulos" m ON rp."ModuloId" = m."Id"
WHERE r."Nombre" = 'Nutricionista' AND m."Key" = 'dashboard';
