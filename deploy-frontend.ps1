# Script de despliegue automatizado para Frontend en Easypanel
# Uso: .\deploy-frontend.ps1 "Mensaje del commit"

param(
    [Parameter(Mandatory=$false)]
    [string]$CommitMessage = "Deploy: Actualización de frontend"
)

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host " DESPLIEGUE AUTOMATIZADO - FRONTEND" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Limpiar cache y dist anterior
Write-Host "[1/6] Limpiando cache y build anterior..." -ForegroundColor Yellow
Remove-Item -Path ".\node_modules\.vite" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".\dist" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "      ✓ Cache limpiado" -ForegroundColor Green
Write-Host ""

# Paso 2: Build del proyecto
Write-Host "[2/6] Construyendo proyecto..." -ForegroundColor Yellow
$buildOutput = npm run build 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "      ✗ Error en el build" -ForegroundColor Red
    Write-Host $buildOutput
    exit 1
}
Write-Host "      ✓ Build completado exitosamente" -ForegroundColor Green
Write-Host ""

# Paso 3: Copiar archivos a publish/frontend
Write-Host "[3/6] Copiando archivos a publish/frontend..." -ForegroundColor Yellow
Copy-Item -Path ".\dist\*" -Destination ".\publish\frontend\" -Recurse -Force
Write-Host "      ✓ Archivos copiados" -ForegroundColor Green
Write-Host ""

# Paso 4: Verificar cambios en git
Write-Host "[4/6] Verificando cambios..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ([string]::IsNullOrWhiteSpace($gitStatus)) {
    Write-Host "      ! No hay cambios para desplegar" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host " NO SE REQUIERE DESPLIEGUE" -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan
    exit 0
}
Write-Host "      ✓ Cambios detectados" -ForegroundColor Green
Write-Host ""

# Paso 5: Commit y Push
Write-Host "[5/6] Subiendo a GitHub..." -ForegroundColor Yellow
git add .
git commit -m "$CommitMessage"
if ($LASTEXITCODE -ne 0) {
    Write-Host "      ✗ Error en el commit" -ForegroundColor Red
    exit 1
}

git push
if ($LASTEXITCODE -ne 0) {
    Write-Host "      ✗ Error en el push" -ForegroundColor Red
    exit 1
}
Write-Host "      ✓ Cambios subidos a GitHub" -ForegroundColor Green
Write-Host ""

# Paso 6: Trigger webhook de Easypanel (opcional)
Write-Host "[6/6] Triggering Easypanel deploy..." -ForegroundColor Yellow

# Leer webhook URL desde archivo de configuración (si existe)
$webhookFile = ".\.easypanel-webhook"
if (Test-Path $webhookFile) {
    $webhookUrl = Get-Content $webhookFile -Raw
    $webhookUrl = $webhookUrl.Trim()
    
    try {
        $response = Invoke-WebRequest -Uri $webhookUrl -Method POST -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "      ✓ Webhook ejecutado exitosamente" -ForegroundColor Green
            Write-Host "      → Easypanel está reconstruyendo el servicio..." -ForegroundColor Cyan
        } else {
            Write-Host "      ! Webhook respondió con código: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "      ! No se pudo ejecutar el webhook: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "      → Reconstruye manualmente en Easypanel" -ForegroundColor Cyan
    }
} else {
    Write-Host "      ! Archivo .easypanel-webhook no encontrado" -ForegroundColor Yellow
    Write-Host "      → Crea el archivo con la URL del webhook de Easypanel" -ForegroundColor Cyan
    Write-Host "      → O reconstruye manualmente en el panel" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host " DESPLIEGUE COMPLETADO" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Último commit:" -ForegroundColor White
$lastCommit = git log -1 --oneline
Write-Host "  $lastCommit" -ForegroundColor Gray
Write-Host ""
Write-Host "URL Frontend: https://softsport77-web.scuiaw.easypanel.host" -ForegroundColor Cyan
Write-Host ""
