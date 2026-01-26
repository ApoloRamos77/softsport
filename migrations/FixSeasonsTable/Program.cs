using Npgsql;

var connectionString = "Host=76.13.164.224;Port=5432;Database=sys_academia;Username=postgres;Password=SoftSport2026#;SslMode=Prefer";

try
{
    using var connection = new NpgsqlConnection(connectionString);
    await connection.OpenAsync();
    
    Console.WriteLine("🔧 Verificando y creando tablas y columnas faltantes...\n");
    
    // Script completo para verificar todas las estructuras
    var sql = @"
        -- Crear tabla Roles con mayúscula (Entity Framework busca 'Roles')
        CREATE TABLE IF NOT EXISTS ""Roles"" (
            ""Id"" SERIAL PRIMARY KEY,
            ""Nombre"" VARCHAR(200) NOT NULL,
            ""Descripcion"" VARCHAR(500),
            ""Tipo"" VARCHAR(50) DEFAULT 'Sistema',
            ""Academia"" VARCHAR(200),
            ""FechaCreacion"" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            ""FechaModificacion"" TIMESTAMP
        );
        
        -- Crear tabla RolePermissions
        CREATE TABLE IF NOT EXISTS ""RolePermissions"" (
            ""Id"" SERIAL PRIMARY KEY,
            ""RoleId"" INTEGER NOT NULL,
            ""PermissionKey"" VARCHAR(200) NOT NULL,
            ""Granted"" BOOLEAN NOT NULL DEFAULT true,
            CONSTRAINT fk_rolepermissions_role FOREIGN KEY (""RoleId"") REFERENCES ""Roles""(""Id"")
        );
        
        -- Agregar columnas faltantes a servicios
        ALTER TABLE servicios 
        ADD COLUMN IF NOT EXISTS codigo VARCHAR(50),
        ADD COLUMN IF NOT EXISTS tipo VARCHAR(50),
        ADD COLUMN IF NOT EXISTS pronto_pago DECIMAL(10,2);
        
        -- Agregar columnas faltantes a productos  
        ALTER TABLE productos
        ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT true,
        ADD COLUMN IF NOT EXISTS codigo VARCHAR(50);
        
        -- Agregar columnas faltantes a trainings
        ALTER TABLE trainings
        ADD COLUMN IF NOT EXISTS hora_inicio TIME,
        ADD COLUMN IF NOT EXISTS hora_fin TIME,
        ADD COLUMN IF NOT EXISTS ubicacion VARCHAR(500),
        ADD COLUMN IF NOT EXISTS categoria_id INTEGER,
        ADD COLUMN IF NOT EXISTS tipo VARCHAR(100),
        ADD COLUMN IF NOT EXISTS estado VARCHAR(50) DEFAULT 'Programado';
        
        -- Verificar que recibos tenga todas las columnas
        ALTER TABLE recibos
        ADD COLUMN IF NOT EXISTS observaciones TEXT,
        ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMP,
        ADD COLUMN IF NOT EXISTS fecha_modificacion TIMESTAMP;
    ";
    
    using var command = new NpgsqlCommand(sql, connection);
    await command.ExecuteNonQueryAsync();
    
    Console.WriteLine("✅ Todas las tablas y columnas verificadas/creadas exitosamente");
}
catch (Exception ex)
{
    Console.WriteLine($"\n❌ Error: {ex.Message}");
    Console.WriteLine($"Stack: {ex.StackTrace}");
}
