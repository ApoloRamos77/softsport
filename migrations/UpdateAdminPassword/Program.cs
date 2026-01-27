using System;
using Npgsql;
using BCrypt.Net;

// Configuración de conexión
var connectionString = "Host=76.13.164.224;Port=5432;Database=sys_academia;Username=postgres;Password=SoftSport2026;";

Console.WriteLine("Actualizando contraseña del usuario admin...");
Console.WriteLine();

try
{
    using var connection = new NpgsqlConnection(connectionString);
    connection.Open();
    
    // Generar hash de la contraseña "Apolo123"
    var passwordHash = BCrypt.Net.BCrypt.HashPassword("Apolo123");
    
    Console.WriteLine($"Hash generado: {passwordHash}");
    Console.WriteLine();
    
    // Actualizar la contraseña en la base de datos
    using var command = new NpgsqlCommand(
        "UPDATE users SET password_hash = @passwordHash WHERE email = @email", 
        connection);
    
    command.Parameters.AddWithValue("passwordHash", passwordHash);
    command.Parameters.AddWithValue("email", "admin@softsport.com");
    
    var rowsAffected = command.ExecuteNonQuery();
    
    if (rowsAffected > 0)
    {
        Console.WriteLine("✓ Contraseña actualizada exitosamente");
        Console.WriteLine();
        Console.WriteLine("Credenciales de acceso:");
        Console.WriteLine("  Email: admin@softsport.com");
        Console.WriteLine("  Contraseña: Apolo123");
    }
    else
    {
        Console.WriteLine("⚠ No se encontró el usuario admin@softsport.com");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"Error: {ex.Message}");
}
