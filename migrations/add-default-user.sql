-- Crear usuario de prueba si no existe
IF NOT EXISTS (SELECT * FROM users WHERE email = 'admin@adhsoft.com')
BEGIN
    INSERT INTO users (nombre, apellido, email, password_hash, telefono, role, active, created_at, updated_at)
    VALUES ('Admin', 'User', 'admin@adhsoft.com', 'admin123', '+51977816213', 'Administrador', 1, GETDATE(), GETDATE());
    
    PRINT 'Usuario de prueba creado exitosamente';
    PRINT 'Email: admin@adhsoft.com';
    PRINT 'Password: admin123';
END
ELSE
BEGIN
    PRINT 'El usuario admin@adhsoft.com ya existe';
END
GO
