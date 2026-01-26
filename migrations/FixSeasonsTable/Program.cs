using Npgsql;

var connectionString = "Host=76.13.164.224;Port=5432;Database=sys_academia;Username=postgres;Password=SoftSport2026#;SslMode=Prefer";

var tables = new[] { 
    "alumnos", "categorias", "becas", "grupos", "payment_methods", 
    "representantes", "servicios", "productos", "trainings", "games", "expenses"
};

try
{
    using var connection = new NpgsqlConnection(connectionString);
    await connection.OpenAsync();
    
    Console.WriteLine("🔧 Agregando columnas de auditoría a todas las tablas...\n");
    
    foreach (var table in tables)
    {
        var sql = $@"
            ALTER TABLE {table} 
            ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMP,
            ADD COLUMN IF NOT EXISTS usuario_creacion VARCHAR(100),
            ADD COLUMN IF NOT EXISTS fecha_modificacion TIMESTAMP,
            ADD COLUMN IF NOT EXISTS usuario_modificacion VARCHAR(100),
            ADD COLUMN IF NOT EXISTS fecha_anulacion TIMESTAMP,
            ADD COLUMN IF NOT EXISTS usuario_anulacion VARCHAR(100);
        ";
        
        using var command = new NpgsqlCommand(sql, connection);
        await command.ExecuteNonQueryAsync();
        
        Console.WriteLine($"✅ {table}");
    }
    
    Console.WriteLine("\n🎉 Todas las tablas actualizadas exitosamente!");
}
catch (Exception ex)
{
    Console.WriteLine($"\n❌ Error: {ex.Message}");
}
