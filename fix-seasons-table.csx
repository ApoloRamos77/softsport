using Npgsql;

var connectionString = "Host=76.13.164.224;Port=5432;Database=sys_academia;Username=postgres;Password=SoftSport2026#;SslMode=Prefer";

try
{
    using var connection = new NpgsqlConnection(connectionString);
    await connection.OpenAsync();
    
    var sql = @"
        ALTER TABLE seasons 
        ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMP,
        ADD COLUMN IF NOT EXISTS usuario_creacion VARCHAR(100),
        ADD COLUMN IF NOT EXISTS fecha_modificacion TIMESTAMP,
        ADD COLUMN IF NOT EXISTS usuario_modificacion VARCHAR(100),
        ADD COLUMN IF NOT EXISTS fecha_anulacion TIMESTAMP,
        ADD COLUMN IF NOT EXISTS usuario_anulacion VARCHAR(100);
    ";
    
    using var command = new NpgsqlCommand(sql, connection);
    await command.ExecuteNonQueryAsync();
    
    Console.WriteLine("✅ Columnas de auditoría agregadas exitosamente a la tabla seasons");
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Error: {ex.Message}");
}
