using Npgsql;
using System;

Console.WriteLine("========================================");
Console.WriteLine("   Reparación de Usuario Admin");
Console.WriteLine("========================================");
Console.WriteLine();

var connectionString = "Host=76.13.164.224;Port=5432;Database=sys_academia;Username=postgres;Password=SoftSport2026;SSL Mode=Prefer";

try
{
    Console.WriteLine("Conectando a la base de datos...");
    using var conn = new NpgsqlConnection(connectionString);
    await conn.OpenAsync();
    Console.WriteLine("✓ Conexión exitosa");
    Console.WriteLine();

    // Eliminar usuario admin si existe
    Console.WriteLine("Eliminando usuario admin existente (si existe)...");
    using (var cmd = new NpgsqlCommand("DELETE FROM users WHERE email = 'admin@softsport.com'", conn))
    {
        var deleted = await cmd.ExecuteNonQueryAsync();
        Console.WriteLine($"  Registros eliminados: {deleted}");
    }

    // Crear nuevo usuario admin
    Console.WriteLine("Creando nuevo usuario admin...");
    using (var cmd = new NpgsqlCommand(@"
        INSERT INTO users (nombre, apellido, email, password_hash, role, active, created_at)
        VALUES (@nombre, @apellido, @email, @hash, @role, @active, CURRENT_TIMESTAMP)
        RETURNING id
    ", conn))
    {
        cmd.Parameters.AddWithValue("nombre", "Administrador");
        cmd.Parameters.AddWithValue("apellido", "Sistema");
        cmd.Parameters.AddWithValue("email", "admin@softsport.com");
        cmd.Parameters.AddWithValue("hash", "$2a$11$hZXV7pJQZ3YwLqEK8YGUuuWvQxPxVqN8xM0kxUWQZK4qLQnXVJK9a");
        cmd.Parameters.AddWithValue("role", "admin");
        cmd.Parameters.AddWithValue("active", true);
        
        var newId = await cmd.ExecuteScalarAsync();
        Console.WriteLine($"✓ Usuario creado con ID: {newId}");
    }

    // Verificar
    Console.WriteLine();
    Console.WriteLine("Verificando usuario creado...");
    using (var cmd = new NpgsqlCommand(@"
        SELECT id, nombre, apellido, email, role, active 
        FROM users 
        WHERE email = 'admin@softsport.com'
    ", conn))
    using (var reader = await cmd.ExecuteReaderAsync())
    {
        if (await reader.ReadAsync())
        {
            Console.WriteLine("✓ Usuario encontrado:");
            Console.WriteLine($"  ID:       {reader.GetInt32(0)}");
            Console.WriteLine($"  Nombre:   {reader.GetString(1)} {reader.GetString(2)}");
            Console.WriteLine($"  Email:    {reader.GetString(3)}");
            Console.WriteLine($"  Role:     {reader.GetString(4)}");
            Console.WriteLine($"  Active:   {reader.GetBoolean(5)}");
        }
    }

    Console.WriteLine();
    Console.WriteLine("========================================");
    Console.WriteLine("   Reparación Completada");
    Console.WriteLine("========================================");
    Console.WriteLine();
    Console.WriteLine("Credenciales de acceso:");
    Console.WriteLine("  Email:    admin@softsport.com");
    Console.WriteLine("  Password: Apolo123");
    Console.WriteLine();
}
catch (Exception ex)
{
    Console.WriteLine();
    Console.WriteLine($"✗ Error: {ex.Message}");
    Console.WriteLine();
    Console.WriteLine("Stack trace:");
    Console.WriteLine(ex.StackTrace);
    return 1;
}

return 0;
