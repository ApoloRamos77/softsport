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
END

-- Actualizar registros existentes
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'representantes') AND name = 'fecha_creacion')
BEGIN
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'representantes') AND name = 'fecha_creacion') UPDATE representantes SET fecha_creacion = GETDATE() WHERE fecha_creacion IS NULL;
END
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
END

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'alumnos') AND name = 'fecha_creacion')
BEGIN
    UPDATE alumnos SET fecha_creacion = fecha_registro WHERE fecha_creacion IS NULL AND fecha_registro IS NOT NULL;
END
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
    
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'categorias') AND name = 'fecha_creacion') UPDATE categorias SET fecha_creacion = GETDATE() WHERE fecha_creacion IS NULL;
END
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
    
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'grupos') AND name = 'fecha_creacion') UPDATE grupos SET fecha_creacion = GETDATE() WHERE fecha_creacion IS NULL;
END
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
    
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'becas') AND name = 'fecha_creacion') UPDATE becas SET fecha_creacion = GETDATE() WHERE fecha_creacion IS NULL;
END
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
    
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'servicios') AND name = 'fecha_creacion') UPDATE servicios SET fecha_creacion = GETDATE() WHERE fecha_creacion IS NULL;
END
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
    
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'productos') AND name = 'fecha_creacion') UPDATE productos SET fecha_creacion = GETDATE() WHERE fecha_creacion IS NULL;
END
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
    
    UPDATE recibos SET fecha_creacion = fecha_emision WHERE fecha_creacion IS NULL;
END
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
    
    UPDATE abonos SET fecha_creacion = fecha_pago WHERE fecha_creacion IS NULL;
END
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
    
    UPDATE expenses SET fecha_creacion = fecha WHERE fecha_creacion IS NULL;
END
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
    
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'payment_methods') AND name = 'fecha_creacion') UPDATE payment_methods SET fecha_creacion = GETDATE() WHERE fecha_creacion IS NULL;
END
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
    
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'seasons') AND name = 'fecha_creacion') UPDATE seasons SET fecha_creacion = GETDATE() WHERE fecha_creacion IS NULL;
END
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
    
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'games') AND name = 'fecha_creacion') UPDATE games SET fecha_creacion = GETDATE() WHERE fecha_creacion IS NULL;
END
GO

PRINT 'Columnas de auditoría agregadas exitosamente a todas las tablas';
GO

