using Npgsql;

var connectionString = "Host=76.13.164.224;Port=5432;Database=sys_academia;Username=postgres;Password=SoftSport2026#;SslMode=Prefer";

try
{
    using var connection = new NpgsqlConnection(connectionString);
    await connection.OpenAsync();
    
    Console.WriteLine("🔧 Agregando columnas faltantes a tabla alumnos...\n");
    
    var sql = @"
        ALTER TABLE alumnos 
        ADD COLUMN IF NOT EXISTS sexo VARCHAR(1),
        ADD COLUMN IF NOT EXISTS fotografia VARCHAR(500),
        ADD COLUMN IF NOT EXISTS codigopais VARCHAR(5),
        ADD COLUMN IF NOT EXISTS direccion VARCHAR(500),
        ADD COLUMN IF NOT EXISTS colegio VARCHAR(200),
        ADD COLUMN IF NOT EXISTS segundorepresentantenombre VARCHAR(200),
        ADD COLUMN IF NOT EXISTS segundorepresentanteparentesco VARCHAR(100),
        ADD COLUMN IF NOT EXISTS segundorepresentantecodigo VARCHAR(5),
        ADD COLUMN IF NOT EXISTS segundorepresentantetelefono VARCHAR(20),
        ADD COLUMN IF NOT EXISTS segundorepresentanteemail VARCHAR(200),
        ADD COLUMN IF NOT EXISTS tiposangre VARCHAR(5),
        ADD COLUMN IF NOT EXISTS alergias VARCHAR(200),
        ADD COLUMN IF NOT EXISTS condicionesmedicas TEXT,
        ADD COLUMN IF NOT EXISTS medicamentos TEXT,
        ADD COLUMN IF NOT EXISTS contactoemergencia VARCHAR(200),
        ADD COLUMN IF NOT EXISTS codigopaisemergencia VARCHAR(5),
        ADD COLUMN IF NOT EXISTS telefonoemergencia VARCHAR(20),
        ADD COLUMN IF NOT EXISTS notas TEXT;
    ";
    
    using var command = new NpgsqlCommand(sql, connection);
    await command.ExecuteNonQueryAsync();
    
    Console.WriteLine("✅ Columnas agregadas exitosamente a tabla alumnos");
}
catch (Exception ex)
{
    Console.WriteLine($"\n❌ Error: {ex.Message}");
}
