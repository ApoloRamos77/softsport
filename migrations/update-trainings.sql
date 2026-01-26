-- Actualizar tabla trainings con campos completos y auditoría
USE Sys_Academia;
GO

-- Agregar campos faltantes
ALTER TABLE trainings ADD 
    categoria_id INT NULL,
    hora_inicio TIME NULL,
    hora_fin TIME NULL,
    ubicacion NVARCHAR(500) NULL,
    tipo NVARCHAR(100) NULL,
    estado NVARCHAR(50) NULL DEFAULT 'Programado';
GO

-- Agregar campos de auditoría
ALTER TABLE trainings ADD 
    fecha_creacion DATETIME2 NULL,
    usuario_creacion NVARCHAR(100) NULL,
    fecha_modificacion DATETIME2 NULL,
    usuario_modificacion NVARCHAR(100) NULL,
    fecha_anulacion DATETIME2 NULL,
    usuario_anulacion NVARCHAR(100) NULL;
GO

-- Agregar foreign key a categorias
ALTER TABLE trainings ADD CONSTRAINT FK_trainings_categorias 
    FOREIGN KEY (categoria_id) REFERENCES categorias(id);
GO

PRINT 'Tabla trainings actualizada correctamente';
