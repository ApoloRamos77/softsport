-- Crear tabla de configuración de academia
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'academy_config')
BEGIN
    CREATE TABLE academy_config (
        id INT PRIMARY KEY IDENTITY(1,1),
        nombre NVARCHAR(200) NOT NULL,
        email NVARCHAR(200),
        telefono NVARCHAR(50),
        direccion NVARCHAR(500),
        logo_url NVARCHAR(500),
        color_menu NVARCHAR(20) DEFAULT '#1a73e8',
        color_botones NVARCHAR(20) DEFAULT '#0B66FF',
        whatsapp_activado BIT DEFAULT 0,
        partidas_activado BIT DEFAULT 0,
        fecha_actualizacion DATETIME DEFAULT GETDATE()
    );
    
    -- Insertar configuración por defecto
    INSERT INTO academy_config (nombre, email, telefono, direccion, color_menu, color_botones, whatsapp_activado, partidas_activado)
    VALUES ('ADHSOFT SPORT', 'email@academia.com', '+51977816213', 'Puente Piedra, Lima, Peru', '#1a73e8', '#0B66FF', 0, 0);
    
    PRINT 'Tabla academy_config creada exitosamente';
END
ELSE
BEGIN
    PRINT 'La tabla academy_config ya existe';
END
GO
