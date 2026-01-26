-- Agregar columna estado a la tabla expenses
USE Sys_Academia;
GO

-- Verificar si la columna ya existe antes de agregarla
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[expenses]') AND name = 'estado')
BEGIN
    ALTER TABLE dbo.expenses
    ADD estado NVARCHAR(50) NOT NULL DEFAULT 'Activo';
    
    PRINT 'Columna estado agregada exitosamente a la tabla expenses';
END
ELSE
BEGIN
    PRINT 'La columna estado ya existe en la tabla expenses';
END
GO

-- Verificar el resultado
SELECT TOP 5 id, descripcion, monto, fecha, categoria, estado
FROM dbo.expenses;
GO

PRINT 'Migración completada.';
