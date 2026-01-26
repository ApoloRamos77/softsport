# ====================================================================
# Script de Despliegue para Easypanel - ADHSOFT SPORT
# ====================================================================
# Este script construye las imágenes Docker y las prepara para Easypanel
# Ejecutar desde la carpeta publish/

param(
    [string]$BackendTag = "latest",
    [string]$FrontendTag = "latest",
    [switch]$Push,
    [string]$Registry = ""
)

Write-Host "🚀 ADHSOFT SPORT - Despliegue a Easypanel" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ====================================================================
# 1. VERIFICAR REQUISITOS
# ====================================================================

Write-Host "📋 Verificando requisitos..." -ForegroundColor Yellow

# Verificar Docker
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Docker no está instalado" -ForegroundColor Red
    Write-Host "   Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Docker instalado" -ForegroundColor Green

# Verificar que estamos en la carpeta correcta
if (-not (Test-Path "frontend\Dockerfile") -or -not (Test-Path "backend\Dockerfile")) {
    Write-Host "❌ Error: Ejecuta este script desde la carpeta 'publish/'" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Carpeta correcta" -ForegroundColor Green
Write-Host ""

# ====================================================================
# 2. CONSTRUIR IMAGEN DEL BACKEND
# ====================================================================

Write-Host "🔨 Construyendo imagen del Backend..." -ForegroundColor Yellow
Write-Host "   Carpeta: backend/" -ForegroundColor White
Write-Host "   Tag: softsport-backend:$BackendTag" -ForegroundColor White

$backendImage = "softsport-backend:$BackendTag"
if ($Registry) {
    $backendImage = "$Registry/softsport-backend:$BackendTag"
}

docker build -t $backendImage backend/

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al construir la imagen del backend" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Backend construido exitosamente" -ForegroundColor Green
Write-Host ""

# ====================================================================
# 3. CONSTRUIR IMAGEN DEL FRONTEND
# ====================================================================

Write-Host "🔨 Construyendo imagen del Frontend..." -ForegroundColor Yellow
Write-Host "   Carpeta: frontend/" -ForegroundColor White
Write-Host "   Tag: softsport-frontend:$FrontendTag" -ForegroundColor White

$frontendImage = "softsport-frontend:$FrontendTag"
if ($Registry) {
    $frontendImage = "$Registry/softsport-frontend:$FrontendTag"
}

docker build -t $frontendImage frontend/

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al construir la imagen del frontend" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend construido exitosamente" -ForegroundColor Green
Write-Host ""

# ====================================================================
# 4. VERIFICAR IMÁGENES
# ====================================================================

Write-Host "📦 Imágenes Docker creadas:" -ForegroundColor Cyan
docker images | Select-String "softsport"
Write-Host ""

# ====================================================================
# 5. PUSH A REGISTRY (OPCIONAL)
# ====================================================================

if ($Push) {
    if (-not $Registry) {
        Write-Host "⚠️ Advertencia: Necesitas especificar un registry con -Registry" -ForegroundColor Yellow
        Write-Host "   Ejemplo: .\deploy-easypanel.ps1 -Push -Registry 'registry.easypanel.io/tu-proyecto'" -ForegroundColor Yellow
    } else {
        Write-Host "📤 Subiendo imágenes al registry..." -ForegroundColor Yellow
        
        docker push $backendImage
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Error al subir backend" -ForegroundColor Red
            exit 1
        }
        
        docker push $frontendImage
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Error al subir frontend" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "✅ Imágenes subidas exitosamente" -ForegroundColor Green
    }
    Write-Host ""
}

# ====================================================================
# 6. PRUEBA LOCAL (OPCIONAL)
# ====================================================================

Write-Host "🧪 ¿Deseas probar las imágenes localmente? (S/N)" -ForegroundColor Cyan
$respuesta = Read-Host

if ($respuesta -eq "S" -or $respuesta -eq "s") {
    Write-Host ""
    Write-Host "🚀 Iniciando contenedores localmente..." -ForegroundColor Yellow
    
    # Leer variables de entorno
    if (Test-Path ".env") {
        Write-Host "✅ Usando archivo .env" -ForegroundColor Green
    } else {
        Write-Host "⚠️ No se encontró .env, usando valores por defecto" -ForegroundColor Yellow
        Write-Host "   Copia .env.example a .env y configura las variables" -ForegroundColor Yellow
    }
    
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Aplicación iniciada!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📍 URLs de acceso:" -ForegroundColor Cyan
        Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
        Write-Host "   Backend:  http://localhost:5081" -ForegroundColor White
        Write-Host "   Swagger:  http://localhost:5081/swagger" -ForegroundColor White
        Write-Host ""
        Write-Host "⏹️ Para detener: docker-compose down" -ForegroundColor Yellow
    }
}

# ====================================================================
# 7. INSTRUCCIONES FINALES
# ====================================================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "✅ CONSTRUCCIÓN COMPLETADA" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Próximos pasos para desplegar en Easypanel:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣ Accede a tu panel de Easypanel" -ForegroundColor White
Write-Host "   https://easypanel.io" -ForegroundColor Gray
Write-Host ""
Write-Host "2️⃣ Crea un nuevo proyecto" -ForegroundColor White
Write-Host "   - Nombre: ADHSOFT-SPORT" -ForegroundColor Gray
Write-Host ""
Write-Host "3️⃣ Agrega el servicio BACKEND:" -ForegroundColor White
Write-Host "   - Type: App" -ForegroundColor Gray
Write-Host "   - Source: Docker Image" -ForegroundColor Gray
Write-Host "   - Image: $backendImage" -ForegroundColor Gray
Write-Host "   - Port: 5081" -ForegroundColor Gray
Write-Host "   - Variables de entorno (ver .env.example)" -ForegroundColor Gray
Write-Host ""
Write-Host "4️⃣ Agrega el servicio FRONTEND:" -ForegroundColor White
Write-Host "   - Type: App" -ForegroundColor Gray
Write-Host "   - Source: Docker Image" -ForegroundColor Gray
Write-Host "   - Image: $frontendImage" -ForegroundColor Gray
Write-Host "   - Port: 80" -ForegroundColor Gray
Write-Host ""
Write-Host "5️⃣ Configura los dominios:" -ForegroundColor White
Write-Host "   - Backend: api.tudominio.com → :5081" -ForegroundColor Gray
Write-Host "   - Frontend: app.tudominio.com → :80" -ForegroundColor Gray
Write-Host ""
Write-Host "6️⃣ Configura la base de datos:" -ForegroundColor White
Write-Host "   - Asegúrate de que SQL Server sea accesible desde Easypanel" -ForegroundColor Gray
Write-Host "   - O crea un servicio de base de datos en Easypanel" -ForegroundColor Gray
Write-Host ""
Write-Host "Para mas detalles, lee: EASYPANEL_DEPLOY.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "Necesitas ayuda? Ejecuta: Get-Help .\deploy-easypanel.ps1 -Detailed" -ForegroundColor Yellow
Write-Host ""

<#
.SYNOPSIS
    Script de despliegue para Easypanel - ADHSOFT SPORT

.DESCRIPTION
    Construye las imágenes Docker del frontend y backend, y opcionalmente las sube a un registry.

.PARAMETER BackendTag
    Tag para la imagen del backend. Por defecto: "latest"

.PARAMETER FrontendTag
    Tag para la imagen del frontend. Por defecto: "latest"

.PARAMETER Push
    Si se especifica, sube las imágenes al registry

.PARAMETER Registry
    URL del registry de Docker. Ejemplo: "registry.easypanel.io/mi-proyecto"

.EXAMPLE
    .\deploy-easypanel.ps1
    Construye las imágenes localmente

.EXAMPLE
    .\deploy-easypanel.ps1 -Push -Registry "registry.easypanel.io/adhsoft"
    Construye y sube las imágenes al registry

.EXAMPLE
    .\deploy-easypanel.ps1 -BackendTag "v1.0.0" -FrontendTag "v1.0.0"
    Construye con tags específicos

.NOTES
    Autor: ADHSOFT
    Versión: 1.0.0
    Fecha: Enero 2026
#>
