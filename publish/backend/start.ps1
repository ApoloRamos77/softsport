# Script de Inicio - ADHSOFT SPORT
# Este script inicia el backend API

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  ADHSOFT SPORT - Iniciando API" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si .NET está instalado
try {
    $dotnetVersion = dotnet --version
    Write-Host "✓ .NET Runtime detectado: v$dotnetVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: .NET Runtime no está instalado" -ForegroundColor Red
    Write-Host "  Descarga .NET 9.0 Runtime desde: https://dotnet.microsoft.com/download" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host ""
Write-Host "Iniciando API en http://localhost:5081..." -ForegroundColor Yellow
Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Gray
Write-Host ""

# Cambiar al directorio del script
Set-Location -Path $PSScriptRoot

# Iniciar la API
dotnet SoftSportAPI.dll

pause
