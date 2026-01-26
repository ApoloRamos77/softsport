-- Agregar columnas de auditoría a todas las tablas
-- Fecha: 2026-01-23
-- Descripción: Agrega columnas para rastrear creación, modificación y anulación

-- Tabla: representantes
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'representantes') AND name = 'fecha_creacion')
BEGIN
    ALTER TABLE representantes ADD 
        fecha_creacion DATETIME2 NULL,
        usuario_creacion NVARCHAR(100) NULL,
        fecha_modificacion DATETIME2 NULL,
        usuario_modificacion NVARCHAR(100) NULL,
        fecha_anulacion DATETIME2 NULL,
        usuario_anulacion NVARCHAR(100) NULL;
    PRINT 'Columnas de auditoría agregadas a representantes';
END
ELSE
BEGIN
    PRINT 'Las columnas ya existen en representantes';
END
GO

UPDATE representantes SET fecha_creacion = GETDATE(), usuario_creacion = 'System' WHERE fecha_creacion IS NULL;
GO

-- Tabla: alumnos
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'alumnos') AND name = 'fecha_creacion')
BEGIN
    ALTER TABLE alumnos ADD 
        fecha_creacion DATETIME2 NULL,
        usuario_creacion NVARCHAR(100) NULL,
        fecha_modificacion DATETIME2 NULL,
        usuario_modificacion NVARCHAR(100) NULL,
        fecha_anulacion DATETIME2 NULL,
        usuario_anulacion NVARCHAR(100) NULL;
    PRINT 'Columnas de auditoría agregadas a alumnos';
END
ELSE
BEGIN
    PRINT 'Las columnas ya existen en alumnos';
END
GO

UPDATE alumnos SET fecha_creacion = COALESCE(fecha_registro, GETDATE()), usuario_creacion = 'System' WHERE fecha_creacion IS NULL;
GO

-- Tabla: categorias
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'categorias') AND name = 'fecha_creacion')
BEGIN
    ALTER TABLE categorias ADD 
        fecha_creacion DATETIME2 NULL,
        usuario_creacion NVARCHAR(100) NULL,
        fecha_modificacion DATETIME2 NULL,
        usuario_modificacion NVARCHAR(100) NULL,
        fecha_anulacion DATETIME2 NULL,
        usuario_anulacion NVARCHAR(100) NULL;
    PRINT 'Columnas de auditoría agregadas a categorias';
END
GO

UPDATE categorias SET fecha_creacion = GETDATE(), usuario_creacion = 'System' WHERE fecha_creacion IS NULL;
GO

-- Tabla: grupos
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'grupos') AND name = 'fecha_creacion')
BEGIN
    ALTER TABLE grupos ADD 
        fecha_creacion DATETIME2 NULL,
        usuario_creacion NVARCHAR(100) NULL,
        fecha_modificacion DATETIME2 NULL,
        usuario_modificacion NVARCHAR(100) NULL,
        fecha_anulacion DATETIME2 NULL,
        usuario_anulacion NVARCHAR(100) NULL;
    PRINT 'Columnas de auditoría agregadas a grupos';
END
GO

UPDATE grupos SET fecha_creacion = GETDATE(), usuario_creacion = 'System' WHERE fecha_creacion IS NULL;
GO

-- Tabla: becas
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'becas') AND name = 'fecha_creacion')
BEGIN
    ALTER TABLE becas ADD 
        fecha_creacion DATETIME2 NULL,
        usuario_creacion NVARCHAR(100) NULL,
        fecha_modificacion DATETIME2 NULL,
        usuario_modificacion NVARCHAR(100) NULL,
        fecha_anulacion DATETIME2 NULL,
        usuario_anulacion NVARCHAR(100) NULL;
    PRINT 'Columnas de auditoría agregadas a becas';
END
GO

UPDATE becas SET fecha_creacion = GETDATE(), usuario_creacion = 'System' WHERE fecha_creacion IS NULL;
GO

-- Tabla: servicios
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'servicios') AND name = 'fecha_creacion')
BEGIN
    ALTER TABLE servicios ADD 
        fecha_creacion DATETIME2 NULL,
        usuario_creacion NVARCHAR(100) NULL,
        fecha_modificacion DATETIME2 NULL,
        usuario_modificacion NVARCHAR(100) NULL,
        fecha_anulacion DATETIME2 NULL,
        usuario_anulacion NVARCHAR(100) NULL;
    PRINT 'Columnas de auditoría agregadas a servicios';
END
GO

UPDATE servicios SET fecha_creacion = GETDATE(), usuario_creacion = 'System' WHERE fecha_creacion IS NULL;
GO

-- Tabla: productos
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'productos') AND name = 'fecha_creacion')
BEGIN
    ALTER TABLE productos ADD 
        fecha_creacion DATETIME2 NULL,
        usuario_creacion NVARCHAR(100) NULL,
        fecha_modificacion DATETIME2 NULL,
        usuario_modificacion NVARCHAR(100) NULL,
        fecha_anulacion DATETIME2 NULL,
        usuario_anulacion NVARCHAR(100) NULL;
    PRINT 'Columnas de auditoría agregadas a productos';
END
GO

UPDATE productos SET fecha_creacion = GETDATE(), usuario_creacion = 'System' WHERE fecha_creacion IS NULL;
GO

-- Tabla: recibos
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'recibos') AND name = 'fecha_creacion')
BEGIN
    ALTER TABLE recibos ADD 
        fecha_creacion DATETIME2 NULL,
        usuario_creacion NVARCHAR(100) NULL,
        fecha_modificacion DATETIME2 NULL,
        usuario_modificacion NVARCHAR(100) NULL,
        fecha_anulacion DATETIME2 NULL,
        usuario_anulacion NVARCHAR(100) NULL;
    PRINT 'Columnas de auditoría agregadas a recibos';
END
GO

UPDATE recibos SET fecha_creacion = COALESCE(fecha_emision, GETDATE()), usuario_creacion = 'System' WHERE fecha_creacion IS NULL;
GO

-- Tabla: abonos
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'abonos') AND name = 'fecha_creacion')
BEGIN
    ALTER TABLE abonos ADD 
        fecha_creacion DATETIME2 NULL,
        usuario_creacion NVARCHAR(100) NULL,
        fecha_modificacion DATETIME2 NULL,
        usuario_modificacion NVARCHAR(100) NULL,
        fecha_anulacion DATETIME2 NULL,
        usuario_anulacion NVARCHAR(100) NULL;
    PRINT 'Columnas de auditoría agregadas a abonos';
END
GO

UPDATE abonos SET fecha_creacion = COALESCE(fecha_pago, GETDATE()), usuario_creacion = 'System' WHERE fecha_creacion IS NULL;
GO

-- Tabla: expenses
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'expenses') AND name = 'fecha_creacion')
BEGIN
    ALTER TABLE expenses ADD 
        fecha_creacion DATETIME2 NULL,
        usuario_creacion NVARCHAR(100) NULL,
        fecha_modificacion DATETIME2 NULL,
        usuario_modificacion NVARCHAR(100) NULL,
        fecha_anulacion DATETIME2 NULL,
        usuario_anulacion NVARCHAR(100) NULL;
    PRINT 'Columnas de auditoría agregadas a expenses';
END
GO

UPDATE expenses SET fecha_creacion = COALESCE(fecha, GETDATE()), usuario_creacion = 'System' WHERE fecha_creacion IS NULL;
GO

-- Tabla: payment_methods
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'payment_methods') AND name = 'fecha_creacion')
BEGIN
    ALTER TABLE payment_methods ADD 
        fecha_creacion DATETIME2 NULL,
        usuario_creacion NVARCHAR(100) NULL,
        fecha_modificacion DATETIME2 NULL,
        usuario_modificacion NVARCHAR(100) NULL,
        fecha_anulacion DATETIME2 NULL,
        usuario_anulacion NVARCHAR(100) NULL;
    PRINT 'Columnas de auditoría agregadas a payment_methods';
END
GO

UPDATE payment_methods SET fecha_creacion = GETDATE(), usuario_creacion = 'System' WHERE fecha_creacion IS NULL;
GO

-- Tabla: seasons
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'seasons') AND name = 'fecha_creacion')
BEGIN
    ALTER TABLE seasons ADD 
        fecha_creacion DATETIME2 NULL,
        usuario_creacion NVARCHAR(100) NULL,
        fecha_modificacion DATETIME2 NULL,
        usuario_modificacion NVARCHAR(100) NULL,
        fecha_anulacion DATETIME2 NULL,
        usuario_anulacion NVARCHAR(100) NULL;
    PRINT 'Columnas de auditoría agregadas a seasons';
END
GO

UPDATE seasons SET fecha_creacion = GETDATE(), usuario_creacion = 'System' WHERE fecha_creacion IS NULL;
GO

-- Tabla: games
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'games') AND name = 'fecha_creacion')
BEGIN
    ALTER TABLE games ADD 
        fecha_creacion DATETIME2 NULL,
        usuario_creacion NVARCHAR(100) NULL,
        fecha_modificacion DATETIME2 NULL,
        usuario_modificacion NVARCHAR(100) NULL,
        fecha_anulacion DATETIME2 NULL,
        usuario_anulacion NVARCHAR(100) NULL;
    PRINT 'Columnas de auditoría agregadas a games';
END
GO

UPDATE games SET fecha_creacion = GETDATE(), usuario_creacion = 'System' WHERE fecha_creacion IS NULL;
GO

PRINT 'Migración completada exitosamente';
PRINT 'Todas las tablas ahora tienen columnas de auditoría';
GO
