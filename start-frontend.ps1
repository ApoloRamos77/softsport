# Ejecutar desde PowerShell en la raíz del proyecto

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Soft Sport - Iniciando Frontend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en la carpeta correcta
if (-not (Test-Path "package.json")) {
    Write-Error "No se encontró package.json. Asegúrate de ejecutar desde la raíz del proyecto."
    exit 1
}

# Verificar si node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠ node_modules no encontrado. Instalando dependencias..." -ForegroundColor Yellow
    npm.cmd install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Error al instalar dependencias."
        exit 1
    }
    Write-Host "✓ Dependencias instaladas" -ForegroundColor Green
}

Write-Host ""
Write-Host "Iniciando servidor de desarrollo Vite..." -ForegroundColor Yellow
Write-Host "El frontend estará disponible en:" -ForegroundColor Green
Write-Host "  - Local: http://localhost:3000" -ForegroundColor White
Write-Host "  - Network: http://172.16.11.92:3000" -ForegroundColor White
Write-Host ""
Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Gray
Write-Host ""

# Ejecutar el frontend
npm.cmd run dev

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Soft Sport - Iniciando Frontend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en la carpeta correcta
if (-not (Test-Path "package.json")) {
    Write-Error "No se encontró package.json. Asegúrate de ejecutar desde la raíz del proyecto."
    exit 1
}

# Verificar si node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠ node_modules no encontrado. Instalando dependencias..." -ForegroundColor Yellow
    npm.cmd install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Error al instalar dependencias."
        exit 1
    }
    Write-Host "✓ Dependencias instaladas" -ForegroundColor Green
}

Write-Host ""
Write-Host "Iniciando servidor de desarrollo Vite..." -ForegroundColor Yellow
Write-Host "El frontend estará disponible en:" -ForegroundColor Green
Write-Host "  - Local: http://localhost:3000" -ForegroundColor White
Write-Host "  - Network: http://172.16.11.92:3000" -ForegroundColor White
Write-Host ""
Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Gray
Write-Host ""

# Ejecutar el frontend
npm.cmd run dev
