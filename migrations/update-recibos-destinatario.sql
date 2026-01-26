USE Sys_Academia;
GO

-- Actualizar recibos existentes para asignar un alumno si no tienen uno
UPDATE recibos
SET destinatario_type = 'alumnos',
    destinatario_id = (SELECT TOP 1 id FROM alumnos ORDER BY id)
WHERE destinatario_id IS NULL;

-- Verificar los cambios
SELECT id, destinatario_type, destinatario_id, total, estado, fecha
FROM recibos;
