-- Script de Rollback: Elimina todas las tablas y la base de datos Sys_Academia
-- ¡ADVERTENCIA! Este script eliminará PERMANENTEMENTE la base de datos y TODOS sus datos.
-- Usar SOLO para entornos de desarrollo/prueba.

USE master;
GO

-- Terminar todas las conexiones activas a la base de datos
IF EXISTS (SELECT name FROM sys.databases WHERE name = N'Sys_Academia')
BEGIN
    ALTER DATABASE Sys_Academia SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE Sys_Academia;
    PRINT 'Base de datos Sys_Academia eliminada correctamente.';
END
ELSE
BEGIN
    PRINT 'La base de datos Sys_Academia no existe.';
END
GO
