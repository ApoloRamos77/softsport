# ====================================================================
# Script de Migración de Datos - SQL Server a PostgreSQL
# ====================================================================
# Este script exporta los datos de SQL Server e importa a PostgreSQL

param(
    [string]$SqlServerHost = "192.168.1.160",
    [string]$SqlServerUser = "sa",
    [string]$SqlServerPassword = "Mt`$q12o15",
    [string]$SqlServerDatabase = "Sys_Academia",
    [string]$PostgresHost = "localhost",
    [string]$PostgresUser = "postgres",
    [string]$PostgresPassword = "postgres",
    [string]$PostgresDatabase = "sys_academia"
)

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "MIGRACIÓN DE DATOS: SQL Server -> PostgreSQL" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

$exportFolder = ".\migration-export"

# Crear carpeta de exportación
if (-not (Test-Path $exportFolder)) {
    New-Item -ItemType Directory -Path $exportFolder | Out-Null
}

Write-Host "📊 Exportando datos de SQL Server..." -ForegroundColor Yellow
Write-Host ""

# Lista de tablas a exportar (en orden de dependencias)
$tables = @(
    "users",
    "representantes",
    "categorias",
    "grupos",
    "becas",
    "alumnos",
    "servicios",
    "productos",
    "payment_methods",
    "recibos",
    "recibo_items",
    "abonos",
    "seasons",
    "alumno_becas",
    "trainings",
    "games",
    "tactical_boards",
    "expenses",
    "accounting_entries",
    "roles",
    "role_permissions",
    "academy_config"
)

foreach ($table in $tables) {
    Write-Host "  Exportando tabla: $table" -ForegroundColor White
    
    # Exportar a CSV usando BCP (Bulk Copy Program)
    $bcpCommand = "bcp `"SELECT * FROM $SqlServerDatabase.dbo.$table`" queryout `"$exportFolder\$table.csv`" -c -t`"`,`" -S $SqlServerHost -U $SqlServerUser -P `"$SqlServerPassword`""
    
    try {
        Invoke-Expression $bcpCommand 2>&1 | Out-Null
        Write-Host "    ✅ $table exportada" -ForegroundColor Green
    }
    catch {
        Write-Host "    ⚠️ Error exportando $table (puede estar vacía)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "📋 INSTRUCCIONES PARA IMPORTAR EN POSTGRESQL" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Crear la base de datos en Easypanel:" -ForegroundColor Yellow
Write-Host "   - Ve a Easypanel -> + Servicio -> Database -> PostgreSQL" -ForegroundColor White
Write-Host "   - Nombre: softsport-db" -ForegroundColor White
Write-Host "   - Password: [tu-password-seguro]" -ForegroundColor White
Write-Host ""
Write-Host "2. Ejecutar el script de estructura:" -ForegroundColor Yellow
Write-Host "   - Conectarse a PostgreSQL" -ForegroundColor White
Write-Host "   - Ejecutar: migrations/init-postgresql.sql" -ForegroundColor White
Write-Host ""
Write-Host "3. Importar los datos exportados:" -ForegroundColor Yellow
Write-Host "   Los archivos CSV están en: $exportFolder" -ForegroundColor White
Write-Host ""
Write-Host "   Comando para importar cada tabla:" -ForegroundColor White
Write-Host "   psql -h HOST -U USER -d sys_academia -c `"\COPY tabla FROM 'archivo.csv' CSV HEADER`"" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Configurar el backend:" -ForegroundColor Yellow
Write-Host "   Variables de entorno en Easypanel:" -ForegroundColor White
Write-Host "   UsePostgreSQL=true" -ForegroundColor Gray
Write-Host "   ConnectionStrings__DefaultConnection=Host=softsport-db;Database=sys_academia;Username=postgres;Password=TU_PASSWORD" -ForegroundColor Gray
Write-Host ""

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "ALTERNATIVA: Migración Automática con pgLoader" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Si tienes pgLoader instalado, puedes migrar directamente:" -ForegroundColor Yellow
Write-Host ""
Write-Host "pgloader --type mssql --with `"quote identifiers`" \" -ForegroundColor Gray
Write-Host "  mssql://$SqlServerUser:PASSWORD@$SqlServerHost/$SqlServerDatabase \" -ForegroundColor Gray
Write-Host "  postgresql://$PostgresUser:PASSWORD@$PostgresHost/$PostgresDatabase" -ForegroundColor Gray
Write-Host ""
Write-Host "Documentación: https://pgloader.readthedocs.io/" -ForegroundColor White
Write-Host ""

<#
.SYNOPSIS
    Migra datos de SQL Server a PostgreSQL

.DESCRIPTION
    Exporta todas las tablas de SQL Server a archivos CSV para posterior importación en PostgreSQL

.PARAMETER SqlServerHost
    Servidor SQL Server (default: 192.168.1.160)

.PARAMETER SqlServerUser
    Usuario de SQL Server (default: sa)

.PARAMETER SqlServerPassword
    Password de SQL Server

.PARAMETER SqlServerDatabase
    Base de datos SQL Server (default: Sys_Academia)

.EXAMPLE
    .\migrate-to-postgres.ps1
    Exporta los datos usando los valores por defecto

.EXAMPLE
    .\migrate-to-postgres.ps1 -SqlServerHost "miservidor" -SqlServerPassword "mipassword"
    Exporta especificando servidor y password

.NOTES
    Requiere:
    - SQL Server Client Tools (bcp.exe)
    - Acceso a SQL Server desde esta máquina
#>
