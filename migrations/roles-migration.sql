-- Script de migración para crear tablas de Roles y Permisos
-- Fecha: 2026-01-22

-- Crear tabla Roles
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Roles')
BEGIN
    CREATE TABLE Roles (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Nombre NVARCHAR(100) NOT NULL,
        Descripcion NVARCHAR(500) NOT NULL,
        Tipo NVARCHAR(50) NOT NULL DEFAULT 'Sistema',
        Academia NVARCHAR(200) NULL,
        FechaCreacion DATETIME2 NOT NULL DEFAULT GETDATE(),
        FechaModificacion DATETIME2 NULL
    );
    PRINT 'Tabla Roles creada exitosamente';
END
ELSE
BEGIN
    PRINT 'Tabla Roles ya existe';
END
GO

-- Crear tabla RolePermissions
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RolePermissions')
BEGIN
    CREATE TABLE RolePermissions (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        RoleId INT NOT NULL,
        ModuloId INT NOT NULL,
        ModuloNombre NVARCHAR(100) NOT NULL,
        Ver BIT NOT NULL DEFAULT 0,
        Crear BIT NOT NULL DEFAULT 0,
        Modificar BIT NOT NULL DEFAULT 0,
        Eliminar BIT NOT NULL DEFAULT 0,
        CONSTRAINT FK_RolePermissions_Roles FOREIGN KEY (RoleId) REFERENCES Roles(Id) ON DELETE CASCADE
    );
    PRINT 'Tabla RolePermissions creada exitosamente';
END
ELSE
BEGIN
    PRINT 'Tabla RolePermissions ya existe';
END
GO

-- Insertar roles predeterminados si no existen
IF NOT EXISTS (SELECT * FROM Roles WHERE Nombre = 'Administrador')
BEGIN
    INSERT INTO Roles (Nombre, Descripcion, Tipo, Academia)
    VALUES 
        ('Administrador', 'Rol administrador con acceso completo a todas las funcionalidades', 'Sistema', 'Todas'),
        ('Entrenador', 'Rol de entrenador con acceso a gestión de entrenamientos y juegos', 'Sistema', 'Todas'),
        ('Representante', 'Rol para padres y representantes de atletas', 'Sistema', 'Todas');
    
    PRINT 'Roles predeterminados insertados';
    
    -- Obtener el ID del rol Administrador
    DECLARE @AdminRoleId INT = (SELECT Id FROM Roles WHERE Nombre = 'Administrador');
    
    -- Insertar permisos completos para Administrador
    INSERT INTO RolePermissions (RoleId, ModuloId, ModuloNombre, Ver, Crear, Modificar, Eliminar)
    VALUES 
        (@AdminRoleId, 1, 'Dashboard', 1, 1, 1, 1),
        (@AdminRoleId, 2, 'Aletas', 1, 1, 1, 1),
        (@AdminRoleId, 3, 'Grupos', 1, 1, 1, 1),
        (@AdminRoleId, 4, 'Categorías', 1, 1, 1, 1),
        (@AdminRoleId, 5, 'Entrenamientos', 1, 1, 1, 1),
        (@AdminRoleId, 6, 'Juegos', 1, 1, 1, 1),
        (@AdminRoleId, 7, 'Representantes', 1, 1, 1, 1),
        (@AdminRoleId, 8, 'Abonos', 1, 1, 1, 1),
        (@AdminRoleId, 9, 'Becas', 1, 1, 1, 1),
        (@AdminRoleId, 10, 'Servicios', 1, 1, 1, 1),
        (@AdminRoleId, 11, 'Productos', 1, 1, 1, 1),
        (@AdminRoleId, 12, 'Métodos de Pago', 1, 1, 1, 1),
        (@AdminRoleId, 13, 'Egresos', 1, 1, 1, 1),
        (@AdminRoleId, 14, 'Contabilidad', 1, 1, 1, 1),
        (@AdminRoleId, 15, 'Calendario', 1, 1, 1, 1),
        (@AdminRoleId, 16, 'Pizarra BOV', 1, 1, 1, 1),
        (@AdminRoleId, 17, 'Usuarios (manage_users)', 1, 1, 1, 1),
        (@AdminRoleId, 18, 'Roles (manage_roles)', 1, 1, 1, 1);
    
    PRINT 'Permisos de Administrador insertados';
END
ELSE
BEGIN
    PRINT 'Roles predeterminados ya existen';
END
GO

PRINT 'Migración de Roles completada exitosamente';
