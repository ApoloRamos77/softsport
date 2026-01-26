# Script para crear archivo .zip de despliegue
# Ejecutar desde la raíz del proyecto

Write-Host "🚀 Preparando archivos para Easypanel..." -ForegroundColor Cyan

# Crear carpeta temporal
$tempDir = "publish-easypanel"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copiar frontend
Write-Host "📦 Copiando frontend..." -ForegroundColor Yellow
Copy-Item -Path "publish\frontend\*" -Destination "$tempDir\frontend" -Recurse

# Copiar backend
Write-Host "📦 Copiando backend..." -ForegroundColor Yellow
Copy-Item -Path "publish\backend\*" -Destination "$tempDir\backend" -Recurse

# Copiar archivos de configuración
Write-Host "📦 Copiando archivos de configuración..." -ForegroundColor Yellow
Copy-Item -Path "publish\docker-compose.yml" -Destination "$tempDir\"
Copy-Item -Path "publish\EASYPANEL_DEPLOY.md" -Destination "$tempDir\README.md"

# Crear archivo ZIP
Write-Host "🗜️ Creando archivo ZIP..." -ForegroundColor Yellow
$zipFile = "softsport-easypanel.zip"
if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
}
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipFile

# Limpiar
Remove-Item $tempDir -Recurse -Force

Write-Host "✅ Archivo creado: $zipFile" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Siguiente paso:" -ForegroundColor Cyan
Write-Host "   1. Extrae el archivo ZIP" -ForegroundColor White
Write-Host "   2. Lee el README.md para instrucciones de despliegue" -ForegroundColor White
Write-Host "   3. Sube las carpetas frontend/ y backend/ a Easypanel" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Total de archivos preparados:" -ForegroundColor Cyan
Write-Host "   - Frontend: $(Get-ChildItem -Path "publish\frontend" -Recurse -File | Measure-Object).Count archivos" -ForegroundColor White
Write-Host "   - Backend: $(Get-ChildItem -Path "publish\backend" -Recurse -File | Measure-Object).Count archivos" -ForegroundColor White
