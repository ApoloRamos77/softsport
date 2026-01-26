# Script para ejecutar todo el proyecto Soft Sport (API + Frontend)
# Ejecutar desde PowerShell en la raíz del proyecto

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Soft Sport - Inicio Completo" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Get-Location

Write-Host "Este script iniciará:" -ForegroundColor Yellow
Write-Host "  1. Web API (C#)" -ForegroundColor White
Write-Host "  2. Frontend (React)" -ForegroundColor White
Write-Host ""
Write-Host "Cada servicio se ejecutará en una ventana separada." -ForegroundColor Gray
Write-Host ""

# Verificar que los archivos existen
if (-not (Test-Path "api")) {
    Write-Error "No se encontró la carpeta 'api'."
    exit 1
}

if (-not (Test-Path "package.json")) {
    Write-Error "No se encontró package.json."
    exit 1
}

Write-Host "Iniciando servicios..." -ForegroundColor Green
Write-Host ""

# Iniciar API en nueva ventana
Write-Host "✓ Iniciando Web API..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot'; .\start-api.ps1"
Start-Sleep -Seconds 2

# Iniciar Frontend en nueva ventana
Write-Host "✓ Iniciando Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot'; .\start-frontend.ps1"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Servicios Iniciados" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "API:" -ForegroundColor Cyan
Write-Host "  - HTTP: http://localhost:5081" -ForegroundColor White
Write-Host "  - Swagger: http://localhost:5081/swagger" -ForegroundColor White
Write-Host ""
Write-Host "Frontend:" -ForegroundColor Cyan
Write-Host "  - Local: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Para detener los servicios, cierra las ventanas de PowerShell." -ForegroundColor Gray
Write-Host ""
Write-Host "Presiona cualquier tecla para cerrar esta ventana..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
