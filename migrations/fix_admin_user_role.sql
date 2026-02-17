-- Update user "admin" role to match the Roles table
UPDATE "users" 
SET "role" = 'Administrador' 
WHERE "email" = 'admin@softsport.com';

-- Verify update
SELECT id, nombre, email, role FROM "users" WHERE email = 'admin@softsport.com';
