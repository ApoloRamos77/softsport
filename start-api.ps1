# Script para ejecutar la Web API de Soft Sport
# Ejecutar desde PowerShell en la raíz del proyecto

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Soft Sport - Iniciando Web API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$apiPath = Join-Path -Path (Get-Location) -ChildPath "api"

if (-not (Test-Path $apiPath)) {
    Write-Error "No se encontró la carpeta 'api'. Asegúrate de ejecutar desde la raíz del proyecto."
    exit 1
}

Set-Location $apiPath

Write-Host "✓ Compilando proyecto..." -ForegroundColor Yellow
$buildOutput = dotnet build 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Error al compilar el proyecto."
    Write-Host $buildOutput
    exit 1
}

Write-Host "✓ Proyecto compilado exitosamente" -ForegroundColor Green
Write-Host ""
Write-Host "Iniciando API..." -ForegroundColor Yellow
Write-Host "La API estará disponible en:" -ForegroundColor Green
Write-Host "  - HTTP: http://localhost:5081" -ForegroundColor White
Write-Host "  - Swagger: http://localhost:5081/swagger" -ForegroundColor White
Write-Host ""
Write-Host "Presiona Ctrl+C para detener la API" -ForegroundColor Gray
Write-Host ""

# Ejecutar la API
dotnet run
