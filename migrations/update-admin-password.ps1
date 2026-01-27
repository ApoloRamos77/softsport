# Script para actualizar la contraseña del usuario admin en PostgreSQL
# Contraseña nueva: Apolo123 (hasheada con BCrypt)

$ErrorActionPreference = "Stop"

# Configuración de la base de datos
$dbHost = "softsport77_softsport-db"  # Para Easypanel
$dbPort = "5432"
$dbName = "sys_academia"
$dbUser = "postgres"
$dbPassword = "SoftSport2026"

Write-Host "Actualizando contraseña del usuario admin..." -ForegroundColor Cyan

# Construir cadena de conexión
$env:PGPASSWORD = $dbPassword

# Ejecutar el script SQL
try {
    # Para ejecución local, cambiar el host a localhost o IP externa
    $localHost = "76.13.164.224"  # Cambiar según tu configuración
    
    Write-Host "Ejecutando actualización en la base de datos..." -ForegroundColor Yellow
    
    # Comando SQL directo
    $sqlCommand = @"
UPDATE usuarios 
SET password_hash = '\$2a\$11\$hZXV7pJQZ3YwLqEK8YGUuuWvQxPxVqN8xM0kxUWQZK4qLQnXVJK9a'
WHERE email = 'admin@softsport.com';
"@
    
    # Ejecutar con psql si está disponible
    if (Get-Command psql -ErrorAction SilentlyContinue) {
        psql -h $localHost -p $dbPort -U $dbUser -d $dbName -c $sqlCommand
        Write-Host "✓ Contraseña actualizada exitosamente" -ForegroundColor Green
        Write-Host ""
        Write-Host "Credenciales de acceso:" -ForegroundColor Cyan
        Write-Host "  Email: admin@softsport.com" -ForegroundColor White
        Write-Host "  Contraseña: Apolo123" -ForegroundColor White
    } else {
        Write-Host "psql no está instalado. Ejecuta el siguiente comando manualmente:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host $sqlCommand -ForegroundColor White
        Write-Host ""
        Write-Host "O ejecuta el archivo: migrations/update-admin-password.sql" -ForegroundColor Cyan
    }
}
catch {
    Write-Host "Error al actualizar la contraseña: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Puedes ejecutar manualmente el archivo SQL: migrations/update-admin-password.sql" -ForegroundColor Yellow
}
finally {
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}
