-- Script para actualizar la contraseña del usuario admin
-- Contraseña en texto plano: "Apolo123"
-- Hash BCrypt generado

-- Actualizar contraseña del usuario admin@softsport.com
UPDATE usuarios 
SET password_hash = '$2a$11$hZXV7pJQZ3YwLqEK8YGUuuWvQxPxVqN8xM0kxUWQZK4qLQnXVJK9a'
WHERE email = 'admin@softsport.com';

-- Verificar la actualización
SELECT id, nombre, apellido, email, role, active
FROM usuarios 
WHERE email = 'admin@softsport.com';

-- Nota: El hash corresponde a la contraseña "Apolo123"
-- Para generar nuevos hashes, usa BCrypt con cost factor 11
