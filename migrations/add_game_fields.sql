-- Migración para actualizar la tabla games con nuevos campos
-- Fecha: 2026-01-22

-- Agregar nuevos campos a la tabla games
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'games' AND COLUMN_NAME = 'categoria_id')
BEGIN
    ALTER TABLE dbo.games ADD categoria_id INT NULL;
END
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'games' AND COLUMN_NAME = 'es_local')
BEGIN
    ALTER TABLE dbo.games ADD es_local BIT NOT NULL DEFAULT 1;
END
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'games' AND COLUMN_NAME = 'equipo_local')
BEGIN
    ALTER TABLE dbo.games ADD equipo_local NVARCHAR(200) NULL;
END
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'games' AND COLUMN_NAME = 'equipo_visitante')
BEGIN
    ALTER TABLE dbo.games ADD equipo_visitante NVARCHAR(200) NULL;
END
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'games' AND COLUMN_NAME = 'observaciones')
BEGIN
    ALTER TABLE dbo.games ADD observaciones NVARCHAR(1000) NULL;
END
GO

-- Crear tabla para convocatorias de juegos (relación many-to-many entre games y alumnos)
IF OBJECT_ID('dbo.game_alumnos', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.game_alumnos (
        id INT IDENTITY(1,1) PRIMARY KEY,
        game_id INT NOT NULL,
        alumno_id INT NOT NULL,
        CONSTRAINT FK_game_alumnos_games FOREIGN KEY (game_id) REFERENCES dbo.games(id) ON DELETE CASCADE,
        CONSTRAINT FK_game_alumnos_alumnos FOREIGN KEY (alumno_id) REFERENCES dbo.alumnos(id) ON DELETE CASCADE,
        CONSTRAINT UQ_game_alumno UNIQUE (game_id, alumno_id)
    );
END
GO

-- Agregar foreign key de categoria_id si no existe
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_games_categorias')
BEGIN
    ALTER TABLE dbo.games 
    ADD CONSTRAINT FK_games_categorias 
    FOREIGN KEY (categoria_id) REFERENCES dbo.categorias(id);
END
GO

PRINT 'Migración completada: Tabla games actualizada con nuevos campos';
GO
