-- 1. Check user "admin" details (using lowercase for columns if necessary based on previous error)
SELECT id, nombre, email, role FROM "users" WHERE email = 'admin@softsport.com';

-- 2. Check Roles table
SELECT "Id", "Nombre" FROM "Roles";
