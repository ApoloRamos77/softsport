# Script de despliegue automatizado para Backend en Easypanel
param(
    [Parameter(Mandatory=$false)]
    [string]$CommitMessage = "Deploy: Actualizacion de backend"
)

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host " DESPLIEGUE AUTOMATIZADO - BACKEND" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/6] Limpiando build anterior..." -ForegroundColor Yellow
Remove-Item -Path ".\api\bin" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".\api\obj" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "      OK - Build anterior limpiado" -ForegroundColor Green
Write-Host ""

Write-Host "[2/6] Verificando .NET SDK..." -ForegroundColor Yellow
$dotnetVersion = dotnet --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "      ERROR - .NET SDK no encontrado" -ForegroundColor Red
    Write-Host "      Instala .NET 9.0 SDK desde: https://dotnet.microsoft.com/download" -ForegroundColor Yellow
    exit 1
}
Write-Host "      OK - .NET SDK $dotnetVersion" -ForegroundColor Green
Write-Host ""

Write-Host "[3/6] Compilando proyecto..." -ForegroundColor Yellow
Write-Host "      Ejecutando: dotnet publish en modo Release" -ForegroundColor Gray
$publishOutput = dotnet publish .\api\SoftSportAPI.csproj -c Release -o .\api\bin\publish 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "      ERROR en la compilación" -ForegroundColor Red
    Write-Host $publishOutput
    exit 1
}
Write-Host "      OK - Compilación completada" -ForegroundColor Green
Write-Host ""

Write-Host "[4/6] Copiando archivos..." -ForegroundColor Yellow
# Limpiar destino
Remove-Item -Path ".\publish\backend\*" -Recurse -Force -Exclude "DATABASE_CONFIG.md"

# Copiar archivos compilados
Copy-Item -Path ".\api\bin\publish\*" -Destination ".\publish\backend\" -Recurse -Force

# Copiar Dockerfile optimizado para producción
Copy-Item -Path ".\Dockerfile.backend-production" -Destination ".\publish\backend\Dockerfile" -Force
Write-Host "      OK - Archivos copiados a publish/backend/" -ForegroundColor Green
Write-Host ""

Write-Host "[5/6] Verificando cambios..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ([string]::IsNullOrWhiteSpace($gitStatus)) {
    Write-Host "      No hay cambios para desplegar" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host " BUILD COMPLETADO (Sin cambios)" -ForegroundColor Yellow
    Write-Host "=====================================" -ForegroundColor Cyan
    exit 0
}
Write-Host "      OK - Cambios detectados" -ForegroundColor Green
Write-Host ""

Write-Host "[6/6] Subiendo a GitHub..." -ForegroundColor Yellow
git add .
git commit -m "$CommitMessage"
git push
Write-Host "      OK - Subido a GitHub" -ForegroundColor Green
Write-Host ""

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host " DESPLIEGUE COMPLETADO" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend API URL: https://softsport77-api.scuiaw.easypanel.host" -ForegroundColor Cyan
Write-Host "Swagger URL:     https://softsport77-api.scuiaw.easypanel.host/swagger" -ForegroundColor Cyan
Write-Host ""
Write-Host "El deploy en Easypanel se iniciará automáticamente..." -ForegroundColor Yellow
Write-Host ""
