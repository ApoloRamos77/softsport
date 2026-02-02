# Script para probar la conexión a la base de datos PostgreSQL
# y verificar el usuario admin

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Diagnóstico de Base de Datos" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuración de la base de datos
$dbHost = "76.13.164.224"
$dbPort = "5432"
$dbName = "sys_academia"
$dbUser = "postgres"
$dbPassword = "SoftSport2026"

Write-Host "Configuración:" -ForegroundColor Yellow
Write-Host "  Host: $dbHost" -ForegroundColor White
Write-Host "  Puerto: $dbPort" -ForegroundColor White
Write-Host "  Base de datos: $dbName" -ForegroundColor White
Write-Host ""

# Establecer variable de entorno para contraseña
$env:PGPASSWORD = $dbPassword

# Test 1: Verificar si psql está instalado
Write-Host "[1/4] Verificando si psql está instalado..." -ForegroundColor Yellow
if (Get-Command psql -ErrorAction SilentlyContinue) {
    Write-Host "      ✓ psql está instalado" -ForegroundColor Green
} else {
    Write-Host "      ✗ psql NO está instalado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Para instalar PostgreSQL client:" -ForegroundColor Yellow
    Write-Host "  1. Descarga PostgreSQL desde https://www.postgresql.org/download/windows/" -ForegroundColor White
    Write-Host "  2. O usa Chocolatey: choco install postgresql" -ForegroundColor White
    Write-Host ""
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    exit 1
}

# Test 2: Verificar conexión a la base de datos
Write-Host "[2/4] Probando conexión a la base de datos..." -ForegroundColor Yellow
$connectionTest = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "      ✓ Conexión exitosa a PostgreSQL" -ForegroundColor Green
} else {
    Write-Host "      ✗ Error al conectar a PostgreSQL" -ForegroundColor Red
    Write-Host $connectionTest -ForegroundColor Red
    Write-Host ""
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    exit 1
}

# Test 3: Verificar si existe la tabla users
Write-Host "[3/4] Verificando tabla 'users'..." -ForegroundColor Yellow
$tableCheck = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -c "SELECT COUNT(*) FROM users;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "      ✓ Tabla 'users' existe" -ForegroundColor Green
    Write-Host "      Total de usuarios: $tableCheck" -ForegroundColor Gray
} else {
    Write-Host "      ✗ Tabla 'users' no existe o hay un error" -ForegroundColor Red
    Write-Host $tableCheck -ForegroundColor Red
    Write-Host ""
    Write-Host "Ejecuta el script de inicialización: migrations/init-postgresql.sql" -ForegroundColor Yellow
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    exit 1
}

# Test 4: Verificar usuario admin
Write-Host "[4/4] Verificando usuario admin..." -ForegroundColor Yellow
$adminCheck = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -t -c "SELECT email, role, active FROM users WHERE email = 'admin@softsport.com';" 2>&1
if ($LASTEXITCODE -eq 0 -and $adminCheck -ne "") {
    Write-Host "      ✓ Usuario admin encontrado" -ForegroundColor Green
    Write-Host "      Detalles: $adminCheck" -ForegroundColor Gray
} else {
    Write-Host "      ✗ Usuario admin NO encontrado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Ejecuta el script de reparación: migrations/fix-admin-user.sql" -ForegroundColor Yellow
}

# Limpiar variable de entorno
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Diagnóstico Completado" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
