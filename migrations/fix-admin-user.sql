-- Script para corregir/crear el usuario admin
-- Credenciales:
--   Email: admin@softsport.com
--   Password: Apolo123
--   Hash generado con BCrypt workfactor 11

-- Eliminar usuario admin si existe (para evitar conflictos)
DELETE FROM users WHERE email = 'admin@softsport.com';

-- Crear nuevo usuario admin con hash BCrypt correcto
-- Password: Apolo123
-- Hash: $2a$11$hZXV7pJQZ3YwLqEK8YGUuuWvQxPxVqN8xM0kxUWQZK4qLQnXVJK9a
INSERT INTO users (nombre, apellido, email, password_hash, role, active, created_at)
VALUES (
    'Administrador',
    'Sistema',
    'admin@softsport.com',
    '$2a$11$hZXV7pJQZ3YwLqEK8YGUuuWvQxPxVqN8xM0kxUWQZK4qLQnXVJK9a',
    'admin',
    true,
    CURRENT_TIMESTAMP
);

-- Verificar que el usuario fue creado
SELECT 
    'Usuario admin creado/actualizado exitosamente!' as mensaje,
    id,
    nombre,
    apellido,
    email,
    role,
    active
FROM users 
WHERE email = 'admin@softsport.com';
