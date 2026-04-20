# deploy.ps1
# Script para compilar Backend y Frontend en las rutas establecidas para Easypanel.

Write-Host "==============================================="
Write-Host "🚀 Iniciando Build para Producción (Soft Sport) "
Write-Host "==============================================="
Write-Host ""

# 1. Compilar Backend
Write-Host "1. Compilando Backend (.NET) hacia /publish/backend..." -ForegroundColor Cyan
dotnet publish api/SoftSportAPI.csproj -c Release -o publish/backend
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error compilando el Backend." -ForegroundColor Red
    exit $LASTEXITCODE
}
Write-Host "✅ Backend compilado correctamente." -ForegroundColor Green
Write-Host ""

# 2. Compilar Frontend
Write-Host "2. Compilando Frontend (React/Vite) hacia /publish/frontend..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error compilando el Frontend." -ForegroundColor Red
    exit $LASTEXITCODE
}
Write-Host "✅ Frontend compilado correctamente." -ForegroundColor Green
Write-Host ""

Write-Host "🎉 Los artefactos están listos en la carpeta /publish" -ForegroundColor Green
Write-Host "=> /publish/backend (API .NET)"
Write-Host "=> /publish/frontend (Web/Dist)"
