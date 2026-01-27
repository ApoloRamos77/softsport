# Script de despliegue RÁPIDO - Sin verificaciones
# Uso: .\deploy-quick.ps1

Write-Host "🚀 Despliegue rápido iniciado..." -ForegroundColor Cyan

# Limpiar
Remove-Item -Path ".\dist" -Recurse -Force -ErrorAction SilentlyContinue

# Build
npm run build

# Copiar
Copy-Item -Path ".\dist\*" -Destination ".\publish\frontend\" -Recurse -Force

# Git
git add .
git commit -m "Deploy: Quick update $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git push

Write-Host "✅ Listo! Ahora reconstruye en Easypanel" -ForegroundColor Green
Write-Host "   O espera si tienes auto-deploy configurado" -ForegroundColor Yellow
