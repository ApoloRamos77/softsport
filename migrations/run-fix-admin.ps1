# Script para reparar el usuario admin usando conexión .NET a PostgreSQL
# No requiere psql instalado

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Reparación de Usuario Admin" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuración de la base de datos
$connectionString = "Host=76.13.164.224;Port=5432;Database=sys_academia;Username=postgres;Password=SoftSport2026;SSL Mode=Prefer"

Write-Host "Conectando a la base de datos..." -ForegroundColor Yellow

try {
    # Cargar el ensamblado de Npgsql si está disponible
    Add-Type -Path "C:\Program Files\dotnet\shared\Microsoft.NETCore.App\*\Npgsql.dll" -ErrorAction SilentlyContinue
    
    # Si Npgsql no está disponible, usar System.Data para intentar conexión genérica
    Write-Host "Intentando conexión directa a PostgreSQL..." -ForegroundColor Gray
    
    # SQL para ejecutar
    $sql = @"
-- Eliminar usuario admin si existe
DELETE FROM users WHERE email = 'admin@softsport.com';

-- Crear nuevo usuario admin
INSERT INTO users (nombre, apellido, email, password_hash, role, active, created_at)
VALUES (
    'Administrador',
    'Sistema',
    'admin@softsport.com',
    '$2a$11$hZXV7pJQZ3YwLqEK8YGUuuWvQxPxVqN8xM0kxUWQZK4qLQnXVJK9a',
    'admin',
    true,
    CURRENT_TIMESTAMP
);

-- Verificar
SELECT id, nombre, apellido, email, role, active FROM users WHERE email = 'admin@softsport.com';
"@

    # Intentar usar el comando dotnet para ejecutar un script C#
    Write-Host ""
    Write-Host "Creando herramienta temporal de conexión..." -ForegroundColor Gray
    
    $csharpCode = @"
using System;
using Npgsql;

class Program
{
    static void Main()
    {
        var connectionString = "$connectionString";
        using (var conn = new NpgsqlConnection(connectionString))
        {
            conn.Open();
            
            // Eliminar usuario existente
            using (var cmd = new NpgsqlCommand("DELETE FROM users WHERE email = 'admin@softsport.com'", conn))
            {
                cmd.ExecuteNonQuery();
            }
            
            // Crear nuevo usuario
            using (var cmd = new NpgsqlCommand(@"
                INSERT INTO users (nombre, apellido, email, password_hash, role, active, created_at)
                VALUES (@nombre, @apellido, @email, @hash, @role, @active, CURRENT_TIMESTAMP)
            ", conn))
            {
                cmd.Parameters.AddWithValue("nombre", "Administrador");
                cmd.Parameters.AddWithValue("apellido", "Sistema");
                cmd.Parameters.AddWithValue("email", "admin@softsport.com");
                cmd.Parameters.AddWithValue("hash", "`$2a`$11`$hZXV7pJQZ3YwLqEK8YGUuuWvQxPxVqN8xM0kxUWQZK4qLQnXVJK9a");
                cmd.Parameters.AddWithValue("role", "admin");
                cmd.Parameters.AddWithValue("active", true);
                cmd.ExecuteNonQuery();
            }
            
            // Verificar
            using (var cmd = new NpgsqlCommand("SELECT id, email, role FROM users WHERE email = 'admin@softsport.com'", conn))
            using (var reader = cmd.ExecuteReader())
            {
                if (reader.Read())
                {
                    Console.WriteLine("Usuario creado exitosamente:");
                    Console.WriteLine($"  ID: {reader.GetInt32(0)}");
                    Console.WriteLine($"  Email: {reader.GetString(1)}");
                    Console.WriteLine($"  Role: {reader.GetString(2)}");
                }
            }
        }
    }
}
"@

    # Guardar script C#
    $tempCsFile = Join-Path $env:TEMP "fix-admin.csx"
    $csharpCode | Out-File -FilePath $tempCsFile -Encoding UTF8
    
    Write-Host "Ejecutando reparación..." -ForegroundColor Yellow
    
    # Intentar ejecutar con dotnet-script (si está instalado)
    if (Get-Command dotnet-script -ErrorAction SilentlyContinue) {
        dotnet-script $tempCsFile
    } else {
        Write-Host ""
        Write-Host "Método alternativo: Usando herramienta de migración del proyecto..." -ForegroundColor Yellow
        
        # Usar la aplicación de .NET del proyecto para ejecutar el SQL
        # Vamos a intentar a través de la API misma
        Write-Host ""
        Write-Host "El sistema no tiene psql o dotnet-script instalado." -ForegroundColor Red
        Write-Host ""
        Write-Host "SOLUCIÓN ALTERNATIVA:" -ForegroundColor Yellow
        Write-Host "El backend de la aplicación incluye Entity Framework que puede ejecutar SQL directamente." -ForegroundColor White
        Write-Host ""
        Write-Host "Ejecuta estos comandos manualmente:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "cd api" -ForegroundColor White
        Write-Host "dotnet ef database update" -ForegroundColor White
        Write-Host ""
        Write-Host "O ejecuta el SQL manualmente desde una herramienta de administración de PostgreSQL." -ForegroundColor Gray
        Write-Host ""
        Write-Host "SQL a ejecutar:" -ForegroundColor Cyan
        Write-Host $sql -ForegroundColor White
    }
    
} catch {
    Write-Host ""
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "INSTRUCCIONES MANUALES:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Ejecuta el archivo: migrations\fix-admin-user.sql" -ForegroundColor White
    Write-Host "Usando una herramienta como pgAdmin, DBeaver, o Azure Data Studio" -ForegroundColor Gray
    Write-Host ""
    Write-Host "O ejecuta este SQL directamente:" -ForegroundColor Cyan
    Write-Host ""
    Get-Content "migrations\fix-admin-user.sql" | Write-Host -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "Credenciales del usuario admin:" -ForegroundColor Cyan
Write-Host "  Email: admin@softsport.com" -ForegroundColor White
Write-Host "  Password: Apolo123" -ForegroundColor White
Write-Host ""
