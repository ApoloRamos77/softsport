# Script de despliegue automatizado para Frontend en Easypanel
param(
    [Parameter(Mandatory=$false)]
    [string]$CommitMessage = "Deploy: Actualizacion de frontend"
)

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host " DESPLIEGUE AUTOMATIZADO - FRONTEND" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/6] Limpiando cache y build anterior..." -ForegroundColor Yellow
Remove-Item -Path ".\node_modules\.vite" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".\publish\frontend" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "      OK - Cache limpiado" -ForegroundColor Green
Write-Host ""

Write-Host "[2/6] Construyendo proyecto..." -ForegroundColor Yellow
$buildOutput = npm run build 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "      ERROR en el build" -ForegroundColor Red
    Write-Host $buildOutput
    exit 1
}
Write-Host "      OK - Build completado" -ForegroundColor Green
Write-Host ""

Write-Host "[3/6] Copiando archivos..." -ForegroundColor Yellow
# Copiar archivos del build
# Los archivos ya se generan en publish/frontend segun vite.config.ts
# Copy-Item -Path ".\dist\*" -Destination ".\publish\frontend\" -Recurse -Force
# Copiar Dockerfile para archivos estaticos pre-compilados
Copy-Item -Path ".\Dockerfile.frontend-static" -Destination ".\publish\frontend\Dockerfile" -Force
# Copiar .dockerignore si existe
if (Test-Path ".\.dockerignore") {
    Copy-Item -Path ".\.dockerignore" -Destination ".\publish\frontend\.dockerignore" -Force
}
Write-Host "      OK - Archivos y Dockerfile copiados" -ForegroundColor Green
Write-Host ""

Write-Host "[4/6] Verificando cambios..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ([string]::IsNullOrWhiteSpace($gitStatus)) {
    Write-Host "      No hay cambios para desplegar" -ForegroundColor Yellow
    exit 0
}
Write-Host "      OK - Cambios detectados" -ForegroundColor Green
Write-Host ""

Write-Host "[5/6] Subiendo a GitHub..." -ForegroundColor Yellow
git add .
git commit -m "$CommitMessage"
git push
Write-Host "      OK - Subido a GitHub" -ForegroundColor Green
Write-Host ""

Write-Host "[6/6] Verificando webhook..." -ForegroundColor Yellow
$webhookFile = ".\.easypanel-webhook"
if (Test-Path $webhookFile) {
    $webhookUrl = Get-Content $webhookFile -Raw
    $webhookUrl = $webhookUrl.Trim()
    try {
        Invoke-WebRequest -Uri $webhookUrl -Method POST -UseBasicParsing | Out-Null
        Write-Host "      OK - Webhook ejecutado" -ForegroundColor Green
    }
    catch {
        Write-Host "      Webhook fallo - Reconstruye manualmente" -ForegroundColor Yellow
    }
}
else {
    Write-Host "      Sin webhook - Reconstruye manualmente en Easypanel" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host " DESPLIEGUE COMPLETADO" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URL: https://softsport77-web.scuiaw.easypanel.host" -ForegroundColor Cyan
Write-Host ""
