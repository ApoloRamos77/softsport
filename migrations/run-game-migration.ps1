# Script para ejecutar la migración de actualización de games
# Ejecutar desde PowerShell en la raíz del proyecto

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Migración: Actualizar Games" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Leer configuración de base de datos
$appsettingsPath = "..\api\appsettings.json"

if (-not (Test-Path $appsettingsPath)) {
    Write-Error "No se encontró el archivo appsettings.json"
    exit 1
}

$config = Get-Content $appsettingsPath | ConvertFrom-Json
$connectionString = $config.ConnectionStrings.DefaultConnection

if ([string]::IsNullOrEmpty($connectionString)) {
    Write-Error "No se encontró la cadena de conexión en appsettings.json"
    exit 1
}

# Parsear la cadena de conexión
$server = if ($connectionString -match "Server=([^;]+)") { $matches[1] } else { "localhost" }
$database = if ($connectionString -match "Database=([^;]+)") { $matches[1] } else { "SoftSportDB" }
$userId = if ($connectionString -match "User Id=([^;]+)") { $matches[1] } else { "" }
$password = if ($connectionString -match "Password=([^;]+)") { $matches[1] } else { "" }

Write-Host "Servidor: $server" -ForegroundColor Gray
Write-Host "Base de datos: $database" -ForegroundColor Gray
Write-Host ""
Write-Host "Ejecutando migración de actualización de games..." -ForegroundColor Yellow
Write-Host ""

# Ejecutar el script SQL
$sqlFile = ".\add_game_fields.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Error "No se encontró el archivo de migración: $sqlFile"
    exit 1
}

try {
    # Usar sqlcmd para ejecutar el script
    if ($userId) {
        sqlcmd -S $server -d $database -U $userId -P $password -i $sqlFile -b
    } else {
        sqlcmd -S $server -d $database -E -i $sqlFile -b
    }

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "   Migración Completada" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "La tabla games ha sido actualizada con los nuevos campos:" -ForegroundColor White
        Write-Host "  - categoria_id" -ForegroundColor Gray
        Write-Host "  - es_local" -ForegroundColor Gray
        Write-Host "  - equipo_local" -ForegroundColor Gray
        Write-Host "  - equipo_visitante" -ForegroundColor Gray
        Write-Host "  - observaciones" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Se creó la tabla game_alumnos para las convocatorias" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Error "Error al ejecutar la migración"
        exit 1
    }
}
catch {
    Write-Error "Error al ejecutar sqlcmd: $_"
    Write-Host ""
    Write-Host "Asegúrate de tener SQL Server Client Tools instalado." -ForegroundColor Yellow
    exit 1
}

Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
